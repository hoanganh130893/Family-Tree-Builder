'use client';

import React, { useRef } from 'react';
import { useFamilyStore, FamilyNode, FamilyEdge } from '@/store/useFamilyStore';
import { translations } from '@/lib/translations';
import { FileUp, FileDown, FileJson, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

export default function ImportExport() {
  const { nodes, edges, importData, language } = useFamilyStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { nodes: importedNodes, edges: importedEdges } = JSON.parse(content);
        if (Array.isArray(importedNodes) && Array.isArray(importedEdges)) {
          importData(importedNodes, importedEdges);
          alert(t.importSuccess);
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert(t.importError);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const importedNodes: FamilyNode[] = results.data.map((row: any, index: number) => {
            return {
              id: row.id || uuidv4(),
              type: 'personNode',
              position: { x: 100 + (index % 5) * 250, y: 100 + Math.floor(index / 5) * 200 },
              data: {
                type: 'person',
                firstName: row.firstName || 'New',
                lastName: row.lastName || 'Person',
                gender: row.gender || 'other',
                birthDate: row.birthDate || undefined,
                deathDate: row.deathDate || undefined,
                avatarUrl: row.avatarUrl || undefined,
                bio: row.bio || undefined,
              },
            };
          });
          
          // For CSV, we usually only import persons. We'll merge with existing or replace?
          // Let's replace for simplicity in this "Import" context, or we could append.
          // The user asked for "import members", so let's append them to existing nodes.
          importData([...nodes, ...importedNodes], edges);
          alert(t.importSuccess);
        } catch (error) {
          console.error('CSV Import error:', error);
          alert(t.importError);
        }
      },
    });
    event.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors shadow-sm">
          <FileUp className="w-4 h-4" />
          <span className="hidden sm:inline">{t.importData}</span>
        </button>
        <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <FileJson className="w-4 h-4 text-blue-500" />
            {t.importJson}
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            {t.importCsv}
          </button>
        </div>
      </div>

      <button
        onClick={handleExportJson}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors shadow-sm"
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden sm:inline">{t.exportData}</span>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />
      <input
        type="file"
        ref={csvInputRef}
        onChange={handleImportCsv}
        accept=".csv"
        className="hidden"
      />
    </div>
  );
}
