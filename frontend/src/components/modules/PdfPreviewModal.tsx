import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as pdfjsLib from 'pdfjs-dist';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Upload,
  RefreshCw,
  FileText,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfPreviewModalProps {
  file?: File | null;
  sampleUrl?: string | null;
  sampleTitle?: string | null;
  sampleWarning?: string | null;
  uploading?: boolean;
  onClose: () => void;
  onConfirmUpload?: () => void;
  onReplaceFile?: () => void;
  onUseSampleForUpload?: (sampleUrl: string, filename: string) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  file,
  sampleUrl,
  sampleTitle,
  sampleWarning,
  uploading = false,
  onClose,
  onConfirmUpload,
  onReplaceFile,
  onUseSampleForUpload,
}) => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.15);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [textPreview, setTextPreview] = useState<string>('');
  const [previewErr, setPreviewErr] = useState<string | null>(null);

  const displayName = file?.name || sampleTitle || 'Document Preview';
  const isPdf = Boolean(
    file?.name.toLowerCase().endsWith('.pdf') ||
      file?.type === 'application/pdf' ||
      sampleUrl?.toLowerCase().endsWith('.pdf')
  );

  // Load PDF or lightweight text preview whenever target changes
  useEffect(() => {
    let cancelled = false;
    let activeDoc: pdfjsLib.PDFDocumentProxy | null = null;
    setPdfDoc(null);
    setPageNum(1);
    setNumPages(0);
    setTextPreview('');
    setPreviewErr(null);

    if (!file && !sampleUrl) return;

    (async () => {
      if (isPdf) {
        setLoadingPdf(true);
        try {
          const bytes = file
            ? await file.arrayBuffer()
            : await fetch(sampleUrl!).then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.arrayBuffer();
              });
          const task = pdfjsLib.getDocument({ data: bytes });
          const doc = await task.promise;
          if (cancelled) {
            await (doc as any).destroy?.();
            return;
          }
          activeDoc = doc;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
        } catch (err: any) {
          if (!cancelled) {
            setPreviewErr(
              err?.message || L('Unable to render PDF pages.', 'PDF பக்கங்களைக் காட்ட முடியவில்லை.')
            );
          }
        } finally {
          if (!cancelled) setLoadingPdf(false);
        }
      } else if (file && /\.(csv|txt)$/i.test(file.name)) {
        const snippet = await file.slice(0, 6000).text();
        if (!cancelled) setTextPreview(snippet);
      }
    })();

    return () => {
      cancelled = true;
      if (activeDoc) void (activeDoc as any).destroy?.();
    };
  }, [file, sampleUrl, isPdf]);

  // Render active PDF page onto canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let renderTask: pdfjsLib.RenderTask | null = null;
    let cancelled = false;

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled || !canvasRef.current) return;
        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderTask = page.render({ canvas, canvasContext: ctx, viewport });
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !cancelled) {
          setPreviewErr(err?.message || L('Page rendering error.', 'பக்கத்தைக் காட்டுவதில் பிழை.'));
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdfDoc, pageNum, zoom]);

  if (!file && !sampleUrl) return null;

  const sizeLabel = file
    ? `${(file.size / 1024).toFixed(1)} KB`
    : L('Sample Demonstration PDF', 'மாதிரி ஆவணம்');

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={L('Document Pre-Upload Preview', 'பதிவேற்றுவதற்கு முன் ஆவண முன்னோட்டம்')}
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-4xl max-h-[92vh] rounded-2xl border border-emerald-500/30 bg-[#081511] text-[#fcfbf7] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Metadata Bar */}
        <div className="px-5 py-3.5 bg-[#0b1f19] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/35 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#fcfbf7] truncate">{displayName}</h3>
              <div className="text-[11px] font-mono text-[#a4b2a9] flex flex-wrap items-center gap-2 tabular-nums">
                <span>{sizeLabel}</span>
                {numPages > 0 && (
                  <span>
                    · {numPages} {L('page(s)', 'பக்கங்கள்')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={L('Close preview', 'முன்னோட்டத்தை மூடு')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sampleWarning && (
          <div className="px-5 py-2 bg-amber-950/75 border-b border-amber-500/30 text-[11px] font-mono text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{sampleWarning}</span>
          </div>
        )}

        {/* Controls Bar for PDF pages & Zoom */}
        {isPdf && numPages > 0 && (
          <div className="px-5 py-2.5 bg-[#06120e] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pageNum <= 1}
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{L('Prev', 'முந்தைய')}</span>
              </button>
              <span className="font-mono text-[#d9c27a] tabular-nums px-2">
                {L('Page', 'பக்கம்')} {pageNum} / {numPages}
              </span>
              <button
                type="button"
                disabled={pageNum >= numPages}
                onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 inline-flex items-center gap-1"
              >
                <span>{L('Next', 'அடுத்த')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <button
                type="button"
                aria-label={L('Zoom out', 'சிறிதாக்கு')}
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="tabular-nums w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                aria-label={L('Zoom in', 'பெரிதாக்கு')}
                onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Viewport Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#030b08] flex items-start justify-center min-h-[320px]">
          {loadingPdf ? (
            <div className="my-auto flex items-center gap-2 text-xs font-mono text-emerald-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{L('Rendering PDF preview…', 'PDF பக்கம் தயாராகிறது…')}</span>
            </div>
          ) : previewErr ? (
            <div className="my-auto max-w-md rounded-xl border border-rose-500/40 bg-rose-950/50 p-4 text-xs text-rose-200">
              {previewErr}
            </div>
          ) : isPdf ? (
            <canvas ref={canvasRef} className="rounded-lg shadow-xl border border-white/10 bg-white max-w-full" />
          ) : textPreview ? (
            <pre className="w-full p-4 rounded-xl bg-[#071811] border border-white/10 text-xs font-mono text-stone-200 whitespace-pre-wrap">
              {textPreview}
            </pre>
          ) : (
            <div className="my-auto text-center space-y-2 text-xs text-[#a4b2a9]">
              <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
              <p>
                {L(
                  'File staged and validated. Click Confirm & Upload to run server extraction.',
                  'கோப்பு சரிபார்க்கப்பட்டது. பதிவேற்ற உறுதிப்படுத்தவும்.'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-5 py-3.5 bg-[#0b1f19] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {onReplaceFile && (
              <button
                type="button"
                onClick={onReplaceFile}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{L('Replace File', 'கோப்பை மாற்று')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-stone-300"
            >
              {L('Cancel', 'ரத்து செய்')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sampleUrl && (
              <a
                href={sampleUrl}
                download
                className="px-3.5 py-2 rounded-xl bg-[#05140d] border border-white/15 hover:border-emerald-400/50 text-xs font-medium text-[#fcfbf7] inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{L('Download PDF', 'பதிவிறக்கு')}</span>
              </a>
            )}
            {sampleUrl && onUseSampleForUpload && (
              <button
                type="button"
                onClick={() => onUseSampleForUpload(sampleUrl, sampleUrl.split('/').pop() || 'sample.pdf')}
                className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{L('Upload to Document Studio', 'ஆவண மையத்தில் பதிவேற்று')}</span>
              </button>
            )}
            {file && onConfirmUpload && (
              <button
                type="button"
                disabled={uploading}
                onClick={onConfirmUpload}
                className="px-5 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-[#041a11] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploading ? L('Uploading…', 'பதிவேற்றுகிறது…') : L('Confirm & Upload PDF', 'உறுதிப்படுத்தி பதிவேற்று')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
