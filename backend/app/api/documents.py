import csv
import hashlib
import io
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.models import AuditLog, DocumentAnalysis, DocumentRecord, User
from ..schemas.schemas import DocumentAnalysisOut, DocumentAnalyzeRequest, DocumentOut

router = APIRouter(prefix="/documents", tags=["Document Intelligence"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv", ".xlsx", ".txt", ".png", ".jpg", ".jpeg"}

SUPPORTED_TASKS = {
    "summarise",
    "extract_structured",
    "groundwater_trends",
    "water_quality_explain",
    "compare_documents",
    "identify_anomalies",
    "missing_inconsistent",
    "technical_report",
    "simple_explanation",
    "field_checklist",
    "answer_question",
    "translate_tamil",
}


def _check_doc_access(doc: DocumentRecord, current_user: User) -> None:
    if doc.owner_id != current_user.id and current_user.role != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access another user's document.",
        )


def _extract_pdf(raw: bytes) -> Tuple[str, List[Dict[str, Any]], int, str, str]:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(raw))
    page_count = len(reader.pages)
    pages_text: List[str] = []
    for idx, page in enumerate(reader.pages, start=1):
        txt = (page.extract_text() or "").strip()
        if txt:
            pages_text.append(f"[Page {idx}]\n{txt}")
    full_text = "\n\n".join(pages_text)
    if not full_text.strip():
        return (
            "",
            [],
            page_count,
            "failed",
            "PDF contains no extractable text layer (likely scanned imagery; OCR is unavailable in this runtime).",
        )
    return full_text, [], page_count, "extracted", f"Extracted selectable text across {len(pages_text)} of {page_count} page(s)."


def _extract_docx(raw: bytes) -> Tuple[str, List[Dict[str, Any]], int, str, str]:
    from docx import Document

    doc = Document(io.BytesIO(raw))
    lines = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
    tables: List[Dict[str, Any]] = []
    for t_idx, table in enumerate(doc.tables, start=1):
        rows = [[cell.text.strip() for cell in row.cells] for row in table.rows]
        if rows:
            headers = rows[0]
            data_rows = rows[1:] if len(rows) > 1 else []
            tables.append({"name": f"DOCX Table {t_idx}", "headers": headers, "rows": data_rows})
    full_text = "\n".join(f"[Line {i+1}] {line}" for i, line in enumerate(lines))
    if not full_text.strip() and not tables:
        return "", [], 1, "failed", "DOCX file contained no readable paragraphs or tables."
    return full_text, tables, 1, "extracted", f"Extracted {len(lines)} paragraph(s) and {len(tables)} table(s)."


def _extract_csv(raw: bytes) -> Tuple[str, List[Dict[str, Any]], int, str, str]:
    decoded = raw.decode("utf-8", errors="replace")
    reader = list(csv.reader(io.StringIO(decoded)))
    if not reader:
        return "", [], 1, "failed", "CSV file is empty."
    headers = reader[0]
    rows = reader[1:]
    tables = [{"name": "CSV Data", "headers": headers, "rows": rows[:500]}]
    preview_lines = [f"[Row 1 / Headers] {', '.join(headers)}"]
    for idx, row in enumerate(rows[:200], start=2):
        preview_lines.append(f"[Row {idx}] {', '.join(row)}")
    return "\n".join(preview_lines), tables, 1, "extracted", f"Parsed CSV with {len(headers)} columns and {len(rows)} data row(s)."


def _extract_xlsx(raw: bytes) -> Tuple[str, List[Dict[str, Any]], int, str, str]:
    from openpyxl import load_workbook

    wb = load_workbook(io.BytesIO(raw), data_only=True, read_only=True)
    tables: List[Dict[str, Any]] = []
    text_parts: List[str] = []
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        rows = []
        for r in ws.iter_rows(values_only=True):
            vals = ["" if v is None else str(v).strip() for v in r]
            if any(vals):
                rows.append(vals)
        if rows:
            headers = rows[0]
            data_rows = rows[1:]
            tables.append({"name": sheet_name, "headers": headers, "rows": data_rows[:500]})
            text_parts.append(f"[Sheet: {sheet_name}] Headers: {', '.join(headers)}")
            for idx, r in enumerate(data_rows[:100], start=2):
                text_parts.append(f"[Sheet: {sheet_name}, Row {idx}] {', '.join(r)}")
    wb.close()
    if not tables:
        return "", [], 1, "failed", "Workbook contained no non-empty worksheets."
    return "\n".join(text_parts), tables, len(tables), "extracted", f"Extracted {len(tables)} worksheet(s)."


def _extract_txt(raw: bytes) -> Tuple[str, List[Dict[str, Any]], int, str, str]:
    decoded = raw.decode("utf-8", errors="replace").strip()
    if not decoded:
        return "", [], 1, "failed", "Text file is empty."
    lines = [f"[Line {i+1}] {ln}" for i, ln in enumerate(decoded.splitlines()) if ln.strip()]
    return "\n".join(lines), [], 1, "extracted", f"Extracted {len(lines)} non-empty line(s)."


def _inspect_image(raw: bytes) -> Tuple[str, List[Dict[str, Any]], int, str, str]:
    from PIL import Image

    img = Image.open(io.BytesIO(raw))
    fmt = img.format or "Unknown"
    w, h = img.size
    return (
        "",
        [],
        1,
        "ocr_unavailable",
        f"Image verified ({fmt}, {w}x{h}px), but OCR engine (Tesseract) is not installed in this runtime. Upload PDF/DOCX/CSV/XLSX/TXT for text extraction.",
    )


def _extract_measurements(text: str, tables: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, str]]]:
    """Deterministically locate cited hydrochemical/groundwater observations without inventing values."""
    findings: Dict[str, List[Dict[str, str]]] = {
        "depth_mbgl": [],
        "tds": [],
        "chromium": [],
        "nitrate": [],
        "ph": [],
        "ec": [],
        "rainfall_mm": [],
        "bod_do": [],
    }
    patterns = {
        "depth_mbgl": re.compile(
            r"(?:(\d+(?:\.\d+)?)\s*(?:mbgl|m\s*bgl|meters?\s+below\s+ground)|(?:depth[_\s]*mbgl|water[_\s]*level(?:[_\s]*mbgl)?)[^\d\n]{0,16}(\d+(?:\.\d+)?))",
            re.I,
        ),
        "tds": re.compile(r"(?:tds|total\s+dissolved\s+solids)[^\d\n]{0,20}(\d+(?:\.\d+)?)\s*(?:mg/l|ppm)?", re.I),
        "chromium": re.compile(r"(?:chromium|cr6?\+?)[^\d\n]{0,20}(\d+(?:\.\d+)?)\s*(?:mg/l|ppm)?", re.I),
        "nitrate": re.compile(r"(?:nitrate|no3-?)[^\d\n]{0,20}(\d+(?:\.\d+)?)\s*(?:mg/l|ppm)?", re.I),
        "ph": re.compile(r"\bpH\b[^\d\n]{0,12}(\d+(?:\.\d+)?)", re.I),
        "ec": re.compile(r"(?:\bEC\b|electrical\s+conductivity)[^\d\n]{0,20}(\d+(?:\.\d+)?)\s*(?:µs/cm|us/cm)?", re.I),
        "rainfall_mm": re.compile(r"(?:rainfall|precipitation)[^\d\n]{0,20}(\d+(?:\.\d+)?)\s*mm", re.I),
        "bod_do": re.compile(r"\b(BOD|DO)\b[^\d\n]{0,15}(\d+(?:\.\d+)?)\s*(?:mg/l)?", re.I),
    }

    def _pick_val(key: str, m: re.Match) -> str:
        if key == "bod_do":
            return m.group(2)
        if key == "depth_mbgl":
            return m.group(1) or m.group(2) or ""
        return m.group(1)

    current_ref = "Document"
    for block in text.splitlines():
        ref_match = re.match(r"^\[(Page \d+|Line \d+|Row \d+[^\]]*|Sheet:[^\]]+)\]", block)
        if ref_match:
            current_ref = ref_match.group(1)
        for key, pat in patterns.items():
            for m in pat.finditer(block):
                snippet = block.strip()[:180]
                val = _pick_val(key, m)
                if val:
                    findings[key].append({"value": val, "ref": current_ref, "excerpt": snippet})

    for t in tables:
        t_name = t.get("name", "Table")
        headers = [str(h) for h in t.get("headers", [])]
        for r_idx, row in enumerate(t.get("rows", [])[:150], start=2):
            joined = " | ".join(f"{headers[i] if i < len(headers) else f'Col{i+1}'}: {v}" for i, v in enumerate(row))
            for key, pat in patterns.items():
                for m in pat.finditer(joined):
                    val = _pick_val(key, m)
                    if val:
                        findings[key].append({"value": val, "ref": f"{t_name}, Row {r_idx}", "excerpt": joined[:180]})

    return findings


def _run_deterministic_analysis(
    doc: DocumentRecord,
    req: DocumentAnalyzeRequest,
    compare_doc: Optional[DocumentRecord] = None,
) -> Dict[str, Any]:
    tables = json.loads(doc.extracted_tables_json or "[]")
    text = doc.extracted_text or ""
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    extracted = _extract_measurements(text, tables)
    is_ta = req.language == "ta" or req.task_type == "translate_tamil"

    citations: List[str] = []
    observations: List[str] = []
    interpretations: List[str] = []
    missing_info: List[str] = []

    # Collect top citations
    seen_refs = set()
    for ln in lines:
        m = re.match(r"^\[([^\]]+)\]", ln)
        if m and m.group(1) not in seen_refs:
            seen_refs.add(m.group(1))
            citations.append(m.group(1))
        if len(citations) >= 12:
            break
    if not citations and tables:
        citations = [f"Table: {t.get('name', 'Sheet')} ({len(t.get('rows', []))} rows)" for t in tables[:6]]

    # Build grounded observations from extracted numbers/lines
    if extracted["depth_mbgl"]:
        sample = extracted["depth_mbgl"][:4]
        observations.append(
            "Groundwater depth values extracted: "
            + "; ".join(f"{x['value']} mbgl ({x['ref']})" for x in sample)
        )
    else:
        missing_info.append("No explicit groundwater depth (mbgl) measurements detected in extracted content.")

    if extracted["tds"]:
        sample = extracted["tds"][:4]
        observations.append(
            "TDS values extracted: "
            + "; ".join(f"{x['value']} mg/L ({x['ref']})" for x in sample)
        )
        for x in sample:
            try:
                v = float(x["value"])
                if v > 500:
                    interpretations.append(
                        f"Extracted TDS ({v} mg/L at {x['ref']}) exceeds BIS 10500 acceptable drinking limit of 500 mg/L."
                        if v <= 2000
                        else f"Extracted TDS ({v} mg/L at {x['ref']}) exceeds BIS 10500 permissible ceiling of 2000 mg/L."
                    )
            except ValueError:
                pass
    else:
        missing_info.append("No Total Dissolved Solids (TDS) measurements found.")

    if extracted["chromium"]:
        sample = extracted["chromium"][:4]
        observations.append(
            "Chromium measurements extracted: "
            + "; ".join(f"{x['value']} mg/L ({x['ref']})" for x in sample)
        )
        for x in sample:
            try:
                v = float(x["value"])
                if v > 0.05:
                    interpretations.append(
                        f"Extracted Chromium ({v} mg/L at {x['ref']}) exceeds BIS 10500 limit (0.05 mg/L); requires certified lab confirmation before regulatory attribution."
                    )
            except ValueError:
                pass
    else:
        missing_info.append("No Total Chromium / heavy metal concentrations found.")

    if extracted["nitrate"]:
        sample = extracted["nitrate"][:6]
        observations.append(
            "Nitrate (NO3-) measurements extracted: "
            + "; ".join(f"{x['value']} mg/L ({x['ref']})" for x in sample)
        )
        numeric_nitrates = []
        for x in sample:
            try:
                numeric_nitrates.append((float(x["value"]), x))
            except ValueError:
                pass
        if numeric_nitrates:
            peak_val, peak_item = max(numeric_nitrates, key=lambda pair: pair[0])
            if peak_val > 45.0:
                interpretations.append(
                    f"Highest extracted Nitrate ({peak_val} mg/L at {peak_item['ref']}) exceeds BIS 10500 acceptable limit of 45 mg/L."
                )
    else:
        missing_info.append("No Nitrate (NO3-) concentrations found in extracted content.")

    if extracted["ph"]:
        sample = extracted["ph"][:4]
        observations.append("pH values extracted: " + "; ".join(f"{x['value']} ({x['ref']})" for x in sample))
    if extracted["rainfall_mm"]:
        sample = extracted["rainfall_mm"][:4]
        observations.append("Rainfall observations extracted: " + "; ".join(f"{x['value']} mm ({x['ref']})" for x in sample))

    if tables:
        observations.append(
            f"Extracted {len(tables)} structured table(s): "
            + ", ".join(f"{t.get('name')} ({len(t.get('headers', []))} cols, {len(t.get('rows', []))} rows)" for t in tables[:4])
        )

    if not observations and lines:
        observations.append(f"Extracted {len(lines)} text lines across {doc.page_count} page(s)/sheet(s).")

    # Check common environmental reporting gaps
    text_lower = text.lower()
    if "latitude" not in text_lower and "longitude" not in text_lower and "coord" not in text_lower:
        missing_info.append("Geographic coordinates (latitude/longitude) are not stated in the extracted text.")
    if not any(src in text_lower for src in ("cgwb", "cpcb", "tnpcb", "imd", "wris", "bis 10500")):
        missing_info.append("Official agency provenance or laboratory standard (e.g. CGWB, TNPCB, BIS 10500) is not explicitly cited in the text.")

    # Task-specific deterministic synthesis
    task = req.task_type
    md_parts: List[str] = []

    provider_note = (
        "> **Extraction Mode**: Deterministic source-grounded analysis (no external LLM API key configured in this environment). "
        "All numbers and excerpts below come strictly from the uploaded file.\n\n"
    )
    if is_ta:
        provider_note = (
            "> **பகுப்பாய்வு முறை**: நேரடி ஆவண அடிப்படையிலான நிர்ணயிக்கப்பட்ட பகுப்பாய்வு (வெளிப்புற LLM API இணைக்கப்படவில்லை). "
            "கீழே உள்ள அனைத்து எண்களும் பதிவேற்றப்பட்ட ஆவணத்திலிருந்து மட்டுமே எடுக்கப்பட்டவை.\n\n"
        )

    md_parts.append(provider_note)

    if task == "compare_documents" and compare_doc is not None:
        comp_tables = json.loads(compare_doc.extracted_tables_json or "[]")
        comp_lines = [ln.strip() for ln in (compare_doc.extracted_text or "").splitlines() if ln.strip()]
        comp_extracted = _extract_measurements(compare_doc.extracted_text or "", comp_tables)
        set_a = {re.sub(r"^\[[^\]]+\]\s*", "", l) for l in lines}
        set_b = {re.sub(r"^\[[^\]]+\]\s*", "", l) for l in comp_lines}
        only_a = list(set_a - set_b)[:5]
        only_b = list(set_b - set_a)[:5]
        md_parts.append(f"### Document Comparison: `{doc.filename}` vs `{compare_doc.filename}`\n")
        md_parts.append(f"- **Primary Document**: {len(lines)} lines, {len(tables)} table(s), {doc.page_count} page(s)/sheet(s)")
        md_parts.append(f"- **Comparison Document**: {len(comp_lines)} lines, {len(comp_tables)} table(s), {compare_doc.page_count} page(s)/sheet(s)")
        md_parts.append(f"- **Shared exact lines**: {len(set_a & set_b)}")
        if extracted["tds"] or comp_extracted["tds"]:
            md_parts.append(
                f"- **TDS Comparison**: Primary has {len(extracted['tds'])} reading(s); Secondary has {len(comp_extracted['tds'])} reading(s)."
            )
        if only_a:
            md_parts.append("\n**Sample Lines Only in Primary Document:**\n" + "\n".join(f"- {s[:140]}" for s in only_a))
        if only_b:
            md_parts.append("\n**Sample Lines Only in Secondary Document:**\n" + "\n".join(f"- {s[:140]}" for s in only_b))
        interpretations.append("Differences above reflect literal text/table delta between the two uploaded files.")

    elif task == "field_checklist":
        md_parts.append(f"### Field Verification Checklist — Grounded in `{doc.filename}`\n")
        checklist_items = [
            "Verify GPS coordinates and station identifier at the sampling point.",
            "Cross-check field pH, Electrical Conductivity (EC), and Total Dissolved Solids (TDS) with calibrated meter.",
        ]
        if extracted["chromium"]:
            checklist_items.append("Collect duplicate 1L acid-preserved grab sample for ICP-MS Total Chromium verification (detected in document).")
        if extracted["depth_mbgl"]:
            checklist_items.append("Record static water level (mbgl) prior to pumping and log pumping duration.")
        if missing_info:
            checklist_items.append(f"Resolve missing metadata noted in document: {missing_info[0]}")
        for idx, item in enumerate(checklist_items, 1):
            md_parts.append(f"{idx}. [ ] {item}")

    elif task == "answer_question":
        q_lower = req.instruction.lower()
        stop_words = {
            "the", "and", "for", "are", "was", "were", "has", "have", "had", "can", "how",
            "who", "why", "not", "any", "all", "its", "into", "does", "did", "been", "being",
            "will", "would", "could", "should", "there", "their", "these", "those", "than",
            "then", "also", "more", "most", "each", "only", "other", "between", "under", "over",
            "what", "where", "when", "which", "this", "that", "from", "with", "about",
            "document", "report", "result", "results", "value", "values", "level", "levels",
            "concentration", "sample", "samples", "data", "information", "missing", "dissolved",
            "highest", "lowest", "tell", "show", "explain", "across", "period",
        }
        q_words = [
            w
            for w in re.findall(r"[a-zA-Z0-9\u0B80-\u0BFF]{3,}", q_lower)
            if w not in stop_words
        ]
        # Build chunked passages preserving [Page N] / [Row N] metadata
        chunks: List[Dict[str, Any]] = []
        cur_ref = "Document"
        buffer: List[str] = []
        for ln in lines:
            m_ref = re.match(r"^\[(Page \d+|Line \d+|Row \d+[^\]]*|Sheet:[^\]]+)\]", ln)
            if m_ref:
                if buffer:
                    chunks.append({"ref": cur_ref, "text": " ".join(buffer)})
                    buffer = []
                cur_ref = m_ref.group(1)
            buffer.append(ln)
            if sum(len(x) for x in buffer) >= 420:
                chunks.append({"ref": cur_ref, "text": " ".join(buffer)})
                buffer = []
        if buffer:
            chunks.append({"ref": cur_ref, "text": " ".join(buffer)})

        analyte_terms = {
            "nitrate", "groundwater", "rainfall", "chromium", "tds", "fluoride", "arsenic",
            "mercury", "lead", "cadmium", "uranium", "cyanide", "phosphate", "ammonia",
            "turbidity", "coliform", "chloride", "sulfate", "sulphate", "bod", "cod",
            "hardness", "iron", "manganese", "zinc", "copper", "nickel", "selenium", "boron",
        }
        asked_analytes = [w for w in q_words if w in analyte_terms]
        doc_lower = text.lower()
        absent_analytes = [
            w for w in asked_analytes if not re.search(rf"\b{re.escape(w)}\b", doc_lower)
        ]

        scored_chunks: List[Tuple[int, Dict[str, Any]]] = []
        if q_words:
            for ch in chunks:
                low = ch["text"].lower()
                score = sum(
                    2 if w in analyte_terms else 1
                    for w in q_words
                    if re.search(rf"\b{re.escape(w)}\b", low)
                )
                if score > 0:
                    scored_chunks.append((score, ch))
            scored_chunks.sort(key=lambda x: x[0], reverse=True)

        md_parts.append(f"### Source-Grounded Answer for: \"{req.instruction}\" — `{doc.filename}`\n")
        if ("highest" in q_lower or "max" in q_lower) and "nitrate" in q_lower:
            if extracted["nitrate"]:
                parsed_n = []
                for x in extracted["nitrate"]:
                    try:
                        parsed_n.append((float(x["value"]), x))
                    except ValueError:
                        pass
                if parsed_n:
                    best_v, best_item = max(parsed_n, key=lambda p: p[0])
                    md_parts.append(
                        f"**Highest Nitrate Detected in `{doc.filename}` ({best_item['ref']}):** **{best_v} mg/L**\n"
                        f"- Supporting excerpt: `{best_item['excerpt']}`"
                    )
        if absent_analytes and len(absent_analytes) == len(asked_analytes):
            missing_list = ", ".join(absent_analytes)
            md_parts.append(
                f"No passages or measurements for `{missing_list}` were found in `{doc.filename}`. "
                "The requested parameter appears absent from all extracted pages."
            )
            missing_info.append(f"Absent from '{doc.filename}': '{req.instruction}'.")
        elif scored_chunks:
            if absent_analytes:
                md_parts.append(
                    f"> Note: Requested parameter(s) `{', '.join(absent_analytes)}` appear absent from `{doc.filename}`."
                )
            md_parts.append("\n**Retrieved Source Chunks:**\n")
            for _, ch in scored_chunks[:5]:
                md_parts.append(f"- **[{ch['ref']}]** {ch['text'][:280]}")
            interpretations.append(f"Retrieved {len(scored_chunks)} matching chunk(s) citing pages/sections in '{doc.filename}'.")
        else:
            missing_terms = ", ".join(q_words) if q_words else req.instruction
            md_parts.append(
                f"No passages matching `{missing_terms}` were found in `{doc.filename}`. "
                "The requested parameter or information appears absent from the extracted pages."
            )
            missing_info.append(f"Absent from '{doc.filename}': '{req.instruction}'.")

    elif is_ta:
        md_parts.append(f"### ஆவணச் சுருக்கம் & தமிழ் விளக்கம் — `{doc.filename}`\n")
        md_parts.append(f"- **ஆவண வகை**: {doc.file_type.upper()} | **பக்கங்கள்/தாள்கள்**: {doc.page_count} | **வரிகள்**: {len(lines)}")
        if observations:
            md_parts.append("\n**நேரடி அவதானிப்புகள் (ஆவணத்திலிருந்து):**")
            for obs in observations:
                md_parts.append(f"- {obs}")
        if interpretations:
            md_parts.append("\n**அறிவியல் விளக்கம் (BIS 10500 / CPCB அடிப்படையில்):**")
            for interp in interpretations:
                md_parts.append(f"- {interp}")
        if missing_info:
            md_parts.append("\n**விடுபட்ட தகவல்கள்:**")
            for m in missing_info:
                md_parts.append(f"- {m}")
        if lines:
            md_parts.append("\n**ஆவணத்தின் முக்கிய பகுதிகள்:**")
            for ln in lines[:5]:
                md_parts.append(f"- {ln[:200]}")

    elif task == "simple_explanation":
        md_parts.append(f"### Plain-Language Explanation — `{doc.filename}`\n")
        md_parts.append(
            f"This file has **{doc.page_count} page(s)/sheet(s)** and **{len(lines)} lines** of readable information. "
            "Below is what the numbers mean in everyday language:\n"
        )
        if observations:
            md_parts.append("**What the document states:**\n" + "\n".join(f"- {o}" for o in observations))
        if interpretations:
            md_parts.append("\n**What this means for drinking & farming:**\n" + "\n".join(f"- {i}" for i in interpretations))
        else:
            md_parts.append("\n**What this means:** No drinking-water threshold exceedances were automatically detected in the extracted numbers, though full laboratory review is always recommended.")

    else:
        # summarise, extract_structured, groundwater_trends, water_quality_explain, identify_anomalies, missing_inconsistent, technical_report
        title_map = {
            "summarise": "Executive Summary",
            "extract_structured": "Structured Data Extraction",
            "groundwater_trends": "Groundwater Trend Analysis",
            "water_quality_explain": "Water Quality Parameter Explanation",
            "identify_anomalies": "Statistical & Threshold Anomaly Screening",
            "missing_inconsistent": "Missing & Inconsistent Information Audit",
            "technical_report": "Technical Hydrogeological Brief",
        }
        md_parts.append(f"### {title_map.get(task, 'Document Analysis')} — `{doc.filename}`\n")
        md_parts.append(f"**Instruction:** {req.instruction}\n")
        if observations:
            md_parts.append("**1. Direct Observations (Source-Grounded):**\n" + "\n".join(f"- {o}" for o in observations))
        if interpretations:
            md_parts.append("\n**2. Interpretations & Standards Context:**\n" + "\n".join(f"- {i}" for i in interpretations))
        if missing_info:
            md_parts.append("\n**3. Missing or Unverified Information:**\n" + "\n".join(f"- {m}" for m in missing_info))
        if lines:
            md_parts.append("\n**4. Source Excerpts:**\n" + "\n".join(f"- {ln[:220]}" for ln in lines[:6]))

    return {
        "provider_mode": "deterministic_extraction",
        "result_markdown": "\n".join(md_parts),
        "observations": observations,
        "interpretations": interpretations,
        "missing_information": missing_info,
        "citations": citations,
    }


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filename = Path(file.filename or "uploaded_file").name
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
        )

    sha256_hash = hashlib.sha256(raw).hexdigest()

    try:
        if ext == ".pdf":
            text, tables, pages, ex_status, notes = _extract_pdf(raw)
        elif ext == ".docx":
            text, tables, pages, ex_status, notes = _extract_docx(raw)
        elif ext == ".csv":
            text, tables, pages, ex_status, notes = _extract_csv(raw)
        elif ext == ".xlsx":
            text, tables, pages, ex_status, notes = _extract_xlsx(raw)
        elif ext == ".txt":
            text, tables, pages, ex_status, notes = _extract_txt(raw)
        else:
            text, tables, pages, ex_status, notes = _inspect_image(raw)
    except Exception as exc:
        text, tables, pages, ex_status, notes = "", [], 1, "failed", f"Extraction error: {str(exc)}"

    doc = DocumentRecord(
        owner_id=current_user.id,
        filename=filename,
        file_type=ext.lstrip("."),
        file_size_bytes=len(raw),
        sha256_hash=sha256_hash,
        page_count=pages,
        extraction_status=ex_status,
        extraction_notes=notes,
        extracted_text=text,
        extracted_tables_json=json.dumps(tables),
    )
    db.add(doc)
    db.flush()
    db.add(
        AuditLog(
            user_email=current_user.email,
            action="DOCUMENT_UPLOAD",
            entity=f"DOCUMENT #{doc.id}",
            details=f"Uploaded '{filename}' ({len(raw)} bytes, status={ex_status}).",
        )
    )
    db.commit()
    db.refresh(doc)

    return DocumentOut(
        id=doc.id,
        owner_id=doc.owner_id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        sha256_hash=doc.sha256_hash,
        page_count=doc.page_count,
        extraction_status=doc.extraction_status,
        extraction_notes=doc.extraction_notes,
        extracted_text=doc.extracted_text,
        tables=tables,
        created_at=doc.created_at,
    )


@router.get("/", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(DocumentRecord)
    if current_user.role != "Administrator":
        query = query.filter(DocumentRecord.owner_id == current_user.id)
    docs = query.order_by(DocumentRecord.created_at.desc()).all()
    return [
        DocumentOut(
            id=d.id,
            owner_id=d.owner_id,
            filename=d.filename,
            file_type=d.file_type,
            file_size_bytes=d.file_size_bytes,
            sha256_hash=d.sha256_hash,
            page_count=d.page_count,
            extraction_status=d.extraction_status,
            extraction_notes=d.extraction_notes,
            extracted_text=d.extracted_text[:4000],
            tables=json.loads(d.extracted_tables_json or "[]"),
            created_at=d.created_at,
        )
        for d in docs
    ]


@router.get("/samples")
def list_sample_documents():
    """Return metadata and disclaimer for bundled synthetic demonstration PDFs."""
    warning = "DEMONSTRATION DATA ONLY — NOT VERIFIED REAL-WORLD MONITORING DATA."
    return {
        "warning": warning,
        "samples": [
            {
                "id": "gw-sample",
                "title": "Groundwater Monitoring Sample Report",
                "filename": "palar_groundwater_monitoring_sample.pdf",
                "url": "/samples/palar_groundwater_monitoring_sample.pdf",
                "description": "Quarterly demonstration depth-to-water (mbgl) across five Palar demonstration wells.",
                "sample_questions": [
                    "What does this document say about groundwater levels?",
                    "What changes are visible across the reporting period?",
                    "What information is missing from this report?",
                ],
            },
            {
                "id": "rain-sample",
                "title": "Rainfall and Groundwater Recharge Assessment",
                "filename": "palar_rainfall_recharge_sample.pdf",
                "url": "/samples/palar_rainfall_recharge_sample.pdf",
                "description": "Synthetic monthly rainfall (mm), NE/SW monsoon balance, and check-dam screening.",
                "sample_questions": [
                    "Summarise the rainfall data.",
                    "Which months contribute most Northeast Monsoon rainfall?",
                    "Create a field checklist from this recharge report.",
                ],
            },
            {
                "id": "wq-sample",
                "title": "Water Quality Laboratory Sample Report",
                "filename": "palar_water_quality_lab_sample.pdf",
                "url": "/samples/palar_water_quality_lab_sample.pdf",
                "description": "Demonstration pH, TDS, Nitrate (NO3-), and Total Chromium chemical assay matrix.",
                "sample_questions": [
                    "Which sample has the highest nitrate result?",
                    "Explain the water-quality threshold exceedances in this document.",
                    "What information is missing from this report?",
                ],
            },
        ],
    }


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(DocumentRecord).filter(DocumentRecord.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    _check_doc_access(doc, current_user)
    return DocumentOut(
        id=doc.id,
        owner_id=doc.owner_id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        sha256_hash=doc.sha256_hash,
        page_count=doc.page_count,
        extraction_status=doc.extraction_status,
        extraction_notes=doc.extraction_notes,
        extracted_text=doc.extracted_text,
        tables=json.loads(doc.extracted_tables_json or "[]"),
        created_at=doc.created_at,
    )


@router.post("/{doc_id}/analyze", response_model=DocumentAnalysisOut)
def analyze_document(
    doc_id: int,
    req: DocumentAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.task_type not in SUPPORTED_TASKS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported task_type '{req.task_type}'. Supported: {', '.join(sorted(SUPPORTED_TASKS))}",
        )

    doc = db.query(DocumentRecord).filter(DocumentRecord.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    _check_doc_access(doc, current_user)

    if doc.extraction_status in ("failed", "ocr_unavailable") or (
        not (doc.extracted_text or "").strip() and json.loads(doc.extracted_tables_json or "[]") == []
    ):
        raise HTTPException(
            status_code=422,
            detail=f"Cannot analyse document '{doc.filename}' because extraction did not produce readable content ({doc.extraction_notes}).",
        )

    compare_doc = None
    if req.compare_document_id is not None:
        compare_doc = db.query(DocumentRecord).filter(DocumentRecord.id == req.compare_document_id).first()
        if not compare_doc:
            raise HTTPException(status_code=404, detail="Comparison document not found")
        _check_doc_access(compare_doc, current_user)
        if compare_doc.extraction_status in ("failed", "ocr_unavailable"):
            raise HTTPException(
                status_code=422,
                detail=f"Comparison document '{compare_doc.filename}' has no extracted text.",
            )

    analysis_data = _run_deterministic_analysis(doc, req, compare_doc=compare_doc)

    record = DocumentAnalysis(
        document_id=doc.id,
        owner_id=current_user.id,
        compared_document_id=compare_doc.id if compare_doc else None,
        task_type=req.task_type,
        instruction=req.instruction,
        language=req.language,
        provider_mode=analysis_data["provider_mode"],
        result_markdown=analysis_data["result_markdown"],
        observations_json=json.dumps(analysis_data["observations"]),
        interpretations_json=json.dumps(analysis_data["interpretations"]),
        missing_info_json=json.dumps(analysis_data["missing_information"]),
        citations_json=json.dumps(analysis_data["citations"]),
    )
    db.add(record)
    db.flush()
    db.add(
        AuditLog(
            user_email=current_user.email,
            action="DOCUMENT_ANALYSE",
            entity=f"DOCUMENT #{doc.id}",
            details=f"Executed '{req.task_type}' analysis (#{record.id}).",
        )
    )
    db.commit()
    db.refresh(record)

    return DocumentAnalysisOut(
        id=record.id,
        document_id=record.document_id,
        compared_document_id=record.compared_document_id,
        task_type=record.task_type,
        instruction=record.instruction,
        language=record.language,
        provider_mode=record.provider_mode,
        result_markdown=record.result_markdown,
        observations=analysis_data["observations"],
        interpretations=analysis_data["interpretations"],
        missing_information=analysis_data["missing_information"],
        citations=analysis_data["citations"],
        created_at=record.created_at,
    )


@router.get("/{doc_id}/analyses", response_model=List[DocumentAnalysisOut])
def get_document_analyses(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(DocumentRecord).filter(DocumentRecord.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    _check_doc_access(doc, current_user)

    items = (
        db.query(DocumentAnalysis)
        .filter(DocumentAnalysis.document_id == doc.id)
        .order_by(DocumentAnalysis.created_at.desc())
        .all()
    )
    return [
        DocumentAnalysisOut(
            id=a.id,
            document_id=a.document_id,
            compared_document_id=a.compared_document_id,
            task_type=a.task_type,
            instruction=a.instruction,
            language=a.language,
            provider_mode=a.provider_mode,
            result_markdown=a.result_markdown,
            observations=json.loads(a.observations_json or "[]"),
            interpretations=json.loads(a.interpretations_json or "[]"),
            missing_information=json.loads(a.missing_info_json or "[]"),
            citations=json.loads(a.citations_json or "[]"),
            created_at=a.created_at,
        )
        for a in items
    ]


@router.get("/{doc_id}/export")
def export_document_analysis(
    doc_id: int,
    format: str = Query("md", pattern="^(md|json|txt)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(DocumentRecord).filter(DocumentRecord.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    _check_doc_access(doc, current_user)

    analyses = (
        db.query(DocumentAnalysis)
        .filter(DocumentAnalysis.document_id == doc.id)
        .order_by(DocumentAnalysis.created_at.desc())
        .all()
    )

    if format == "json":
        payload = {
            "document": {
                "id": doc.id,
                "filename": doc.filename,
                "file_type": doc.file_type,
                "sha256": doc.sha256_hash,
                "extraction_status": doc.extraction_status,
                "extraction_notes": doc.extraction_notes,
            },
            "analyses": [
                {
                    "id": a.id,
                    "task_type": a.task_type,
                    "instruction": a.instruction,
                    "provider_mode": a.provider_mode,
                    "result_markdown": a.result_markdown,
                    "created_at": a.created_at.isoformat(),
                }
                for a in analyses
            ],
        }
        return Response(
            content=json.dumps(payload, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{doc.filename}.analysis.json"'},
        )

    lines = [
        f"# Document Intelligence Report: {doc.filename}",
        f"- File Type: {doc.file_type} | Pages/Sheets: {doc.page_count} | SHA-256: {doc.sha256_hash}",
        f"- Extraction Status: {doc.extraction_status} ({doc.extraction_notes})",
        "",
    ]
    for a in analyses:
        lines.append(f"## Analysis #{a.id} ({a.task_type} — {a.created_at.isoformat()})")
        lines.append(a.result_markdown)
        lines.append("")
    if not analyses:
        lines.append("## Extracted Content")
        lines.append(doc.extracted_text)

    media_type = "text/markdown" if format == "md" else "text/plain"
    return Response(
        content="\n".join(lines),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{doc.filename}.report.{format}"'},
    )


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(DocumentRecord).filter(DocumentRecord.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    _check_doc_access(doc, current_user)
    db.delete(doc)
    db.commit()
    return {"deleted": True, "id": doc_id}
