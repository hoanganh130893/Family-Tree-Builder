import React, { useState, useEffect, useRef } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useReactFlow } from '@xyflow/react';
import { Search, UserRound } from 'lucide-react';
import { translations } from '@/lib/translations';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { nodes, setSelectedNodeId, language } = useFamilyStore();
  const { setCenter, getNode } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const searchResults = nodes.filter((node) => {
    if (node.data.type !== 'person') return false;
    if (!query) return false;
    const fullName = `${node.data.firstName} ${node.data.lastName}`.toLowerCase();
    return fullName.includes(query.toLowerCase());
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (nodeId: string) => {
    const node = getNode(nodeId);
    if (node) {
      setSelectedNodeId(nodeId);
      const width = node.measured?.width ?? 192;
      const height = node.measured?.height ?? 150;
      setCenter(node.position.x + width / 2, node.position.y + height / 2, { zoom: 1.2, duration: 800 });
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative w-64">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors shadow-sm"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {searchResults.length === 0 ? (
            <div className="px-4 py-2 text-slate-500 text-sm">{t.noResults}</div>
          ) : (
            searchResults.map((node) => {
              if (node.data.type !== 'person') return null;
              return (
                <button
                  key={node.id}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  onClick={() => handleSelect(node.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {node.data.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={node.data.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserRound className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-slate-900">
                      {node.data.firstName} {node.data.lastName}
                    </div>
                    {(node.data.birthDate || node.data.deathDate) && (
                      <div className="text-xs text-slate-500">
                        {node.data.birthDate ? new Date(node.data.birthDate).getFullYear() : '?'} - {node.data.deathDate ? new Date(node.data.deathDate).getFullYear() : (node.data.deathDate === null ? '?' : '')}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
