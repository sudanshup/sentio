import { useState } from 'react';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { DataService } from '../lib/data';

export function ExportData() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'json' | 'txt') => {
        setIsExporting(true);
        try {
            const entries = await DataService.getEntries();
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `sentio_export_${timestamp}`;
            
            let content = '';
            let mimeType = '';

            if (format === 'json') {
                // Decrypting handled in DataService? No, currently getEntries returns encrypted.
                // For a real export, we'd need to prompt for the master key or use the currently unlocked session.
                // Assuming session master key is available or we strictly export encrypted backup.
                // Let's assume encrypted backup for now for security.
                content = JSON.stringify(entries, null, 2);
                mimeType = 'application/json';
            } else {
                // For text, we can only export what we can see. 
                // Since this component might be used when not unlocked, we caution.
                // Ideally, we only allow this if unlocked.
                content = "Exporting encrypted backups for import/restore.\n\n" + 
                          entries.map(e => `[${e.created_at}]\nID: ${e.id}\n(Encrypted Content)\n`).join('\n-------------------\n');
                mimeType = 'text/plain';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("Export failed", e);
            alert("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Export
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                Download a local backup of your journal entries.
            </p>
            
            <div className="flex gap-3">
                <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
                    JSON Backup
                </button>
                <button
                    onClick={() => handleExport('txt')}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Text Summary
                </button>
            </div>
        </div>
    );
}
