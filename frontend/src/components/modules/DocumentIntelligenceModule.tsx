import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  History,
  GitCompare,
  Loader2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService, DocumentAnalysisItem, DocumentItem } from '../../services/api';

interface DocumentIntelligenceModuleProps {
  onOpenAuth?: () => void;
}

const ANALYSIS_TASKS = [
  { id: 'summarise', en: 'Summarise Document', ta: 'ஆவணத்தைச் சுருக்கு' },
  { id: 'extract_structured', en: 'Extract Structured Data', ta: 'அட்டவணை/தரவு பிரித்தெடு' },
  { id: 'groundwater_trends', en: 'Analyse Groundwater Trends', ta: 'நிலத்தடி நீர் போக்கு ஆய்வு' },
  { id: 'water_quality_explain', en: 'Explain Water-Quality Parameters', ta: 'நீர் தர அளவுருக்கள் விளக்கம்' },
  { id: 'compare_documents', en: 'Compare Two Documents', ta: 'இரு ஆவணங்களை ஒப்பிடு' },
  { id: 'identify_anomalies', en: 'Identify Anomalies', ta: 'மாறுபாடுகளைக் கண்டறி' },
  { id: 'missing_inconsistent', en: 'Find Missing / Inconsistent Info', ta: 'விடுபட்ட தகவல்களைக் கண்டறி' },
  { id: 'technical_report', en: 'Generate Technical Report', ta: 'தொழில்நுட்ப அறிக்கை உருவாக்கு' },
  { id: 'simple_explanation', en: 'Generate Simple Explanation', ta: 'எளிய விளக்கம் உருவாக்கு' },
  { id: 'field_checklist', en: 'Create Field Checklist', ta: 'கள ஆய்வு சரிபார்ப்புப் பட்டியல்' },
  { id: 'answer_question', en: 'Answer Document Question', ta: 'ஆவணக் கேள்விக்குப் பதில்' },
  { id: 'translate_tamil', en: 'Translate Explanation to Tamil', ta: 'தமிழில் விளக்கம் மொழிபெயர்' },
];

export const DocumentIntelligenceModule: React.FC<DocumentIntelligenceModuleProps> = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [analyses, setAnalyses] = useState<DocumentAnalysisItem[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<DocumentAnalysisItem | null>(null);

  const [taskType, setTaskType] = useState<string>('summarise');
  const [instruction, setInstruction] = useState<string>('Summarise key environmental measurements and cite page or row numbers.');
  const [compareDocId, setCompareDocId] = useState<number | ''>('');
  const [contentTab, setContentTab] = useState<'text' | 'tables' | 'history'>('text');

  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDocuments = async () => {
    if (!isAuthenticated) return;
    setLoadingDocs(true);
    setErrorMsg(null);
    try {
      const list = await apiService.listDocuments();
      setDocs(list);
      if (list.length > 0 && !selectedDoc) {
        await selectDocument(list[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || L('Failed to load documents.', 'ஆவணங்களை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoadingDocs(false);
    }
  };

  const selectDocument = async (docId: number) => {
    setErrorMsg(null);
    try {
      const [fullDoc, hist] = await Promise.all([
        apiService.getDocument(docId),
        apiService.getDocumentAnalyses(docId),
      ]);
      setSelectedDoc(fullDoc);
      setAnalyses(hist);
      setActiveAnalysis(hist[0] || null);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Failed to load document details.', 'ஆவண விவரங்களை ஏற்ற முடியவில்லை.'));
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [isAuthenticated]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(L('File exceeds 10 MB limit.', 'கோப்பு அளவு 10 MB-க்கு மேல் உள்ளது.'));
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    try {
      const uploaded = await apiService.uploadDocument(file);
      setDocs((prev) => [uploaded, ...prev]);
      setSelectedDoc(uploaded);
      setAnalyses([]);
      setActiveAnalysis(null);
      setContentTab(uploaded.tables.length > 0 ? 'tables' : 'text');
    } catch (err: any) {
      setErrorMsg(err?.message || L('Upload failed.', 'பதிவேற்றம் தோல்வியடைந்தது.'));
    } finally {
      setUploading(false);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (taskType === 'compare_documents' && !compareDocId) {
      setErrorMsg(L('Select a second document to compare.', 'ஒப்பிடுவதற்கு இரண்டாவது ஆவணத்தைத் தேர்ந்தெடுக்கவும்.'));
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await apiService.analyzeDocument(selectedDoc.id, {
        task_type: taskType,
        instruction: instruction.trim() || taskType,
        language: taskType === 'translate_tamil' ? 'ta' : lang,
        compare_document_id: taskType === 'compare_documents' ? Number(compareDocId) : null,
      });
      setActiveAnalysis(res);
      setAnalyses((prev) => [res, ...prev]);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Analysis failed.', 'பகுப்பாய்வு தோல்வியடைந்தது.'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async (format: 'md' | 'json' | 'txt') => {
    if (!selectedDoc) return;
    try {
      const text = await apiService.exportDocumentText(selectedDoc.id, format);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDoc.filename}.report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Export failed.', 'ஏற்றுமதி தோல்வியடைந்தது.'));
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    try {
      await apiService.deleteDocument(docId);
      const remaining = docs.filter((d) => d.id !== docId);
      setDocs(remaining);
      if (selectedDoc?.id === docId) {
        setSelectedDoc(remaining[0] || null);
        setAnalyses([]);
        setActiveAnalysis(null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || L('Failed to delete document.', 'ஆவணத்தை நீக்க முடியவில்லை.'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-[#0b1f17] p-8 text-center space-y-4 max-w-xl mx-auto my-8">
        <Lock className="w-8 h-8 text-[#d9c27a] mx-auto" />
        <h2 className="text-xl font-semibold text-[#fcfbf7]">
          {L('Authentication Required for Document Intelligence', 'ஆவண நுண்ணறிவுக்கு உள்நுழைவு தேவை')}
        </h2>
        <p className="text-xs text-[#a4b2a9] leading-relaxed">
          {L(
            'Uploaded environmental reports and extraction histories are private per account. Sign in to upload PDF, DOCX, CSV, XLSX, or TXT files and run source-grounded analyses.',
            'பதிவேற்றப்பட்ட சுற்றுச்சூழல் அறிக்கைகள் உங்கள் கணக்கிற்கு மட்டுமே சொந்தமானவை. PDF, DOCX, CSV, XLSX அல்லது TXT கோப்புகளைப் பதிவேற்ற உள்நுழையவும்.'
          )}
        </p>
        {onOpenAuth && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold transition-colors"
          >
            {L('Sign In / Register', 'உள்நுழைக / பதிவு செய்க')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Studio Header: Violet & Emerald Accent */}
      <header className="rounded-2xl border border-violet-500/25 bg-gradient-to-r from-[#141024] via-[#17132a] to-[#0b211a] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-widest text-violet-300">
            {L('DOCUMENT ANALYSIS STUDIO · VIOLET/EMERALD GROUNDED', 'ஆவண பகுப்பாய்வு மையம் · ஆதார அடிப்படை')}
          </div>
          <h2 className="text-xl font-semibold text-[#fcfbf7]">
            {L('Document Intelligence', 'ஆவண நுண்ணறிவு')}
          </h2>
          <p className="text-xs text-[#a4b2a9]">
            {L(
              'Upload PDF, DOCX, CSV, XLSX, TXT (or inspect image metadata). Deterministic extraction cites pages and rows without inventing values.',
              'PDF, DOCX, CSV, XLSX, TXT கோப்புகளைப் பதிவேற்றி பக்க எண்கள் மற்றும் அட்டவணை ஆதாரங்களுடன் பகுப்பாய்வு செய்யுங்கள்.'
            )}
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold transition-colors shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{uploading ? L('Extracting...', 'பிரித்தெடுக்கிறது...') : L('Upload Document (Max 10 MB)', 'ஆவணம் பதிவேற்று (10 MB)')}</span>
          <input
            type="file"
            accept=".pdf,.docx,.csv,.xlsx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-4 text-xs text-rose-200 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button
            type="button"
            onClick={loadDocuments}
            className="px-3 py-1 rounded bg-rose-600 text-white font-semibold shrink-0"
          >
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Uploaded Document Library (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[#081b13] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-xs font-mono uppercase text-[#d9c27a]">
                {L('Uploaded Documents', 'பதிவேற்றப்பட்ட ஆவணங்கள்')} ({docs.length})
              </span>
              {loadingDocs && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            </div>

            {docs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#85928a] border border-dashed border-white/10 rounded-xl">
                {L('No documents uploaded yet. Upload a PDF, DOCX, CSV, XLSX, or TXT file to begin.', 'இன்னும் ஆவணங்கள் பதிவேற்றப்படவில்லை.')}
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {docs.map((doc) => {
                  const isSel = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => selectDocument(doc.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors space-y-1.5 ${
                        isSel
                          ? 'bg-[#0d2e20] border-[#10b981]'
                          : 'bg-[#05140d] border-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#fcfbf7] truncate">{doc.filename}</div>
                          <div className="text-[10px] font-mono text-[#85928a] tabular-nums">
                            {doc.file_type.toUpperCase()} · {(doc.file_size_bytes / 1024).toFixed(1)} KB · {doc.page_count}p
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDoc(doc.id);
                          }}
                          aria-label={`Delete ${doc.filename}`}
                          className="p-1 text-stone-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          doc.extraction_status === 'extracted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {doc.extraction_status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Instruction & Task Executor */}
          {selectedDoc && (
            <form
              onSubmit={handleRunAnalysis}
              className="rounded-2xl border border-white/10 bg-[#081b13] p-4 space-y-3"
            >
              <div className="text-xs font-mono uppercase text-[#d9c27a]">
                {L('Execute Analysis Task', 'பகுப்பாய்வுப் பணியை இயக்கு')}
              </div>

              <div>
                <label htmlFor="doc-task-select" className="block text-[11px] text-[#a4b2a9] mb-1">
                  {L('Analysis Task', 'பகுப்பாய்வு வகை')}
                </label>
                <select
                  id="doc-task-select"
                  value={taskType}
                  onChange={(e) => {
                    setTaskType(e.target.value);
                    const found = ANALYSIS_TASKS.find((x) => x.id === e.target.value);
                    if (found) {
                      setInstruction(lang === 'ta' ? found.ta : found.en);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-xs text-[#fcfbf7] focus:outline-none focus:border-emerald-500"
                >
                  {ANALYSIS_TASKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {lang === 'ta' ? t.ta : t.en}
                    </option>
                  ))}
                </select>
              </div>

              {taskType === 'compare_documents' && (
                <div>
                  <label htmlFor="doc-compare-select" className="block text-[11px] text-[#a4b2a9] mb-1">
                    {L('Compare Against Document', 'ஒப்பிட வேண்டிய இரண்டாவது ஆவணம்')}
                  </label>
                  <select
                    id="doc-compare-select"
                    value={compareDocId}
                    onChange={(e) => setCompareDocId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-xs text-[#fcfbf7]"
                  >
                    <option value="">{L('Select second document...', 'ஆவணத்தைத் தேர்ந்தெடுக்கவும்...')}</option>
                    {docs
                      .filter((d) => d.id !== selectedDoc.id)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.filename}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="doc-instruction" className="block text-[11px] text-[#a4b2a9] mb-1">
                  {L('Natural-Language Instruction', 'இயல்பான மொழி கட்டளை')}
                </label>
                <textarea
                  id="doc-instruction"
                  rows={3}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-xs text-[#fcfbf7] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-[#041a11] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{analyzing ? L('Analysing...', 'பகுப்பாய்வு செய்கிறது...') : L('Run Grounded Analysis', 'பகுப்பாய்வை இயக்கு')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Main Studio: Extracted Content + Grounded Output (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {!selectedDoc ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#081b13] p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-[#10b981] mx-auto" />
              <h3 className="text-base font-semibold text-[#fcfbf7]">
                {L('Select or Upload a Document', 'ஒரு ஆவணத்தைத் தேர்ந்தெடுக்கவும் அல்லது பதிவேற்றவும்')}
              </h3>
              <p className="text-xs text-[#a4b2a9] max-w-md mx-auto">
                {L(
                  'Supported formats: PDF, DOCX, CSV, XLSX, TXT (and image inspection). All extracted content and citations are verified before analysis.',
                  'PDF, DOCX, CSV, XLSX, TXT கோப்புகளைப் பதிவேற்றி நேரடி உரை மற்றும் அட்டவணைகளைப் பாருங்கள்.'
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Extraction Status & Export Toolbar */}
              <div className="rounded-2xl border border-white/10 bg-[#081b13] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#fcfbf7]">{selectedDoc.filename}</h3>
                    <p className="text-xs text-[#a4b2a9]">{selectedDoc.extraction_notes}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExport('md')}
                      className="px-3 py-1.5 rounded-lg bg-[#05140d] border border-white/10 text-xs text-[#fcfbf7] hover:border-emerald-500/40 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Markdown</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('json')}
                      className="px-3 py-1.5 rounded-lg bg-[#05140d] border border-white/10 text-xs text-[#fcfbf7] hover:border-emerald-500/40 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Extracted Content Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setContentTab('text')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
                      contentTab === 'text' ? 'bg-[#10b981] text-[#041a11] font-semibold' : 'bg-[#05140d] text-[#a4b2a9]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{L('Extracted Text', 'பிரித்தெடுக்கப்பட்ட உரை')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab('tables')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
                      contentTab === 'tables' ? 'bg-[#10b981] text-[#041a11] font-semibold' : 'bg-[#05140d] text-[#a4b2a9]'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>{L('Tables', 'அட்டவணைகள்')} ({selectedDoc.tables.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab('history')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
                      contentTab === 'history' ? 'bg-[#10b981] text-[#041a11] font-semibold' : 'bg-[#05140d] text-[#a4b2a9]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{L('History', 'வரலாறு')} ({analyses.length})</span>
                  </button>
                </div>

                {contentTab === 'text' && (
                  <pre className="p-4 rounded-xl bg-[#04100a] border border-white/[0.06] text-xs font-mono text-[#fcfbf7] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                    {selectedDoc.extracted_text || L('No extractable text available for this file.', 'இந்தக் கோப்பிலிருந்து உரை பிரித்தெடுக்க முடியவில்லை.')}
                  </pre>
                )}

                {contentTab === 'tables' && (
                  <div className="space-y-4 max-h-72 overflow-y-auto">
                    {selectedDoc.tables.length === 0 ? (
                      <p className="text-xs text-[#85928a] p-4 bg-[#04100a] rounded-xl">
                        {L('No structured tables extracted from this document.', 'இந்த ஆவணத்தில் அட்டவணைகள் கண்டறியப்படவில்லை.')}
                      </p>
                    ) : (
                      selectedDoc.tables.map((tbl, idx) => (
                        <div key={idx} className="rounded-xl border border-white/[0.08] bg-[#04100a] overflow-x-auto">
                          <div className="px-3 py-2 text-xs font-mono text-[#d9c27a] border-b border-white/[0.06]">
                            {tbl.name}
                          </div>
                          <table className="w-full text-left text-xs">
                            <thead className="bg-white/[0.04] text-[#a4b2a9] font-mono">
                              <tr>
                                {tbl.headers.map((h, hi) => (
                                  <th key={hi} className="px-3 py-2 whitespace-nowrap">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                              {tbl.rows.slice(0, 25).map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((cell, ci) => (
                                    <td key={ci} className="px-3 py-1.5 text-[#fcfbf7] whitespace-nowrap">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {contentTab === 'history' && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analyses.length === 0 ? (
                      <p className="text-xs text-[#85928a] p-4 bg-[#04100a] rounded-xl">
                        {L('No saved analyses for this document yet.', 'இந்த ஆவணத்திற்கான பகுப்பாய்வு வரலாறு இல்லை.')}
                      </p>
                    ) : (
                      analyses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setActiveAnalysis(a)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${
                            activeAnalysis?.id === a.id
                              ? 'bg-[#0d2e20] border-[#10b981]'
                              : 'bg-[#04100a] border-white/[0.06] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#fcfbf7]">{a.task_type}</span>
                            <span className="font-mono text-[10px] text-[#85928a]">
                              {new Date(a.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a4b2a9] truncate mt-1">{a.instruction}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Grounded Analysis Output */}
              {activeAnalysis && (
                <div className="rounded-2xl border border-emerald-500/30 bg-[#081b13] p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {L('SOURCE-GROUNDED OUTPUT', 'ஆதார அடிப்படையிலான வெளியீடு')} · {activeAnalysis.task_type}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-[#05140d] border border-white/10 text-[10px] font-mono text-[#d9c27a]">
                      {activeAnalysis.provider_mode}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#04100a] border border-white/[0.06] text-xs text-[#fcfbf7] whitespace-pre-wrap leading-relaxed">
                    {activeAnalysis.result_markdown}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#05140d] border border-white/[0.06] space-y-2">
                      <div className="font-mono text-[11px] uppercase text-emerald-400">
                        {L('Direct Observations', 'நேரடி அவதானிப்புகள்')}
                      </div>
                      {activeAnalysis.observations.length === 0 ? (
                        <p className="text-[#85928a]">{L('None extracted.', 'எதுவும் இல்லை.')}</p>
                      ) : (
                        <ul className="space-y-1.5 text-[#fcfbf7]">
                          {activeAnalysis.observations.map((o, i) => (
                            <li key={i}>• {o}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-[#05140d] border border-white/[0.06] space-y-2">
                      <div className="font-mono text-[11px] uppercase text-[#d9c27a]">
                        {L('Interpretations', 'விளக்கங்கள்')}
                      </div>
                      {activeAnalysis.interpretations.length === 0 ? (
                        <p className="text-[#85928a]">{L('No threshold exceedances inferred.', 'வரம்பு மீறல் இல்லை.')}</p>
                      ) : (
                        <ul className="space-y-1.5 text-[#fcfbf7]">
                          {activeAnalysis.interpretations.map((o, i) => (
                            <li key={i}>• {o}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-[#05140d] border border-white/[0.06] space-y-2">
                      <div className="font-mono text-[11px] uppercase text-amber-400">
                        {L('Missing Information', 'விடுபட்ட தகவல்கள்')}
                      </div>
                      {activeAnalysis.missing_information.length === 0 ? (
                        <p className="text-[#85928a]">{L('No gaps flagged.', 'இடைவெளிகள் இல்லை.')}</p>
                      ) : (
                        <ul className="space-y-1.5 text-[#fcfbf7]">
                          {activeAnalysis.missing_information.map((o, i) => (
                            <li key={i}>• {o}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
