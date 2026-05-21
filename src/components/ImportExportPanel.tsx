'use client';

import { useRef, useState } from 'react';
import { Upload, Download, FileJson, AlertTriangle, CheckCircle, Info, FileDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { ImportLevel, ImportValidationResult } from '../types/importExport';
import { readJsonFile, validateImport, downloadTemplate } from '../lib/importExport';

interface ImportExportPanelProps {
  level: ImportLevel;
  /** Called when a valid import file has been selected and validated. Receives the parsed JSON. */
  onImport: (data: unknown) => Promise<void>;
  /** Called to trigger export of current data. */
  onExport: () => void;
  /** Optional: disable export (e.g. nothing to export yet). */
  exportDisabled?: boolean;
  /** Extra label for the current entity (e.g. project name). */
  entityLabel?: string;
}

const LEVEL_LABELS: Record<ImportLevel, { de: string; en: string; tr: string }> = {
  project: { de: 'Projekt', en: 'Project', tr: 'Proje' },
  campaign: { de: 'Kampagne', en: 'Campaign', tr: 'Kampanya' },
  audience: { de: 'Zielgruppe', en: 'Audience', tr: 'Hedef Kitle' },
};

export default function ImportExportPanel({
  level,
  onImport,
  onExport,
  exportDisabled,
  entityLabel,
}: ImportExportPanelProps) {
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [pendingData, setPendingData] = useState<unknown>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const label = LEVEL_LABELS[level][language];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setImportError(null);
    setImportSuccess(false);
    setValidation(null);
    setPendingData(null);

    try {
      const raw = await readJsonFile(file);
      const result = validateImport(raw, level);
      setValidation(result);

      if (result.valid) {
        setPendingData(raw);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t({ de: 'Unbekannter Fehler beim Lesen der Datei.', en: 'Unknown error reading the file.', tr: 'Dosya okunurken bilinmeyen hata.' }));
    }

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = async () => {
    if (!pendingData) return;
    setImporting(true);
    try {
      await onImport(pendingData);
      setImportSuccess(true);
      setValidation(null);
      setPendingData(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t({ de: 'Import fehlgeschlagen.', en: 'Import failed.', tr: 'İçe aktarma başarısız.' }));
    } finally {
      setImporting(false);
    }
  };

  const handleCancelImport = () => {
    setValidation(null);
    setPendingData(null);
    setImportError(null);
  };

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileJson size={20} />
        <h3 className="card-title" style={{ margin: 0 }}>
          {`${t({ de: 'Import / Export', en: 'Import / Export', tr: 'İçe Aktar / Dışa Aktar' })} – ${label}`}
          {entityLabel && <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '8px' }}>({entityLabel})</span>}
        </h3>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload size={16} />
            {t({ de: `${label} importieren`, en: `Import ${label}`, tr: `${label} İçe Aktar` })}
          </button>

          {/* Export */}
          <button
            className="btn btn-secondary"
            onClick={onExport}
            disabled={exportDisabled}
          >
            <Download size={16} />
            {t({ de: `${label} exportieren`, en: `Export ${label}`, tr: `${label} Dışa Aktar` })}
          </button>

          {/* Template Download */}
          <button
            className="btn btn-ghost"
            onClick={() => downloadTemplate(level)}
            title={t({ de: 'Leere JSON-Vorlage herunterladen', en: 'Download empty JSON template', tr: 'Boş JSON şablonu indir' })}
          >
            <FileDown size={16} />
            {t({ de: 'Vorlage (JSON)', en: 'Template (JSON)', tr: 'Şablon (JSON)' })}
          </button>
        </div>

        {/* Import Error */}
        {importError && (
          <div style={alertStyle('error')}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{importError}</span>
            <button onClick={() => setImportError(null)} style={closeStyle}>×</button>
          </div>
        )}

        {/* Import Success */}
        {importSuccess && (
          <div style={alertStyle('success')}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{t({ de: `${label} wurde erfolgreich importiert.`, en: `${label} imported successfully.`, tr: `${label} başarıyla içe aktarıldı.` })}</span>
            <button onClick={() => setImportSuccess(false)} style={closeStyle}>×</button>
          </div>
        )}

        {/* Validation Result */}
        {validation && (
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>
              {t({ de: 'Validierungsergebnis', en: 'Validation Result', tr: 'Doğrulama Sonucu' })}
            </h4>

            {validation.errors.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                {validation.errors.map((err, i) => (
                  <div key={i} style={alertStyle('error')}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem' }}>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                {validation.warnings.map((w, i) => (
                  <div key={i} style={alertStyle('warning')}>
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem' }}>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {validation.valid ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn btn-primary" onClick={handleConfirmImport} disabled={importing}>
                  {importing
                    ? t({ de: 'Importiere...', en: 'Importing...', tr: 'İçe aktarılıyor...' })
                    : t({ de: 'Import bestätigen', en: 'Confirm Import', tr: 'İçe aktarmayı onayla' })
                  }
                </button>
                <button className="btn btn-ghost" onClick={handleCancelImport} disabled={importing}>
                  {t({ de: 'Abbrechen', en: 'Cancel', tr: 'İptal' })}
                </button>
              </div>
            ) : (
              <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {t({
                  de: 'Bitte behebe die Fehler und lade die Datei erneut hoch.',
                  en: 'Please fix the errors and re-upload the file.',
                  tr: 'Lütfen hataları düzeltin ve dosyayı tekrar yükleyin.',
                })}
              </p>
            )}
          </div>
        )}

        {/* Info hint */}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
          {t({
            de: 'Importdateien müssen dem Momentum-JSON-Schema entsprechen. Lade die Vorlage herunter, um das erwartete Format zu sehen.',
            en: 'Import files must conform to the Momentum JSON schema. Download the template to see the expected format.',
            tr: 'İçe aktarma dosyaları Momentum JSON şemasına uygun olmalıdır. Beklenen formatı görmek için şablonu indirin.',
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Inline Style Helpers ──────────────────────────────────

function alertStyle(type: 'error' | 'success' | 'warning'): React.CSSProperties {
  const colors = {
    error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
    success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
  };
  const c = colors[type];
  return {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
    borderRadius: 'var(--radius-sm)', background: c.bg, border: `1px solid ${c.border}`,
    color: c.text, fontSize: '0.87rem', marginBottom: '4px',
  };
}

const closeStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto',
  fontSize: '1.1rem', lineHeight: 1, opacity: 0.7, color: 'inherit',
};
