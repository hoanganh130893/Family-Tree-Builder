import React from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { X, Trash2, UserPlus, HeartHandshake } from 'lucide-react';
import { translations } from '@/lib/translations';

export default function Sidebar() {
  const { 
    nodes, 
    edges, 
    selectedNodeId, 
    selectedEdgeId, 
    updateNodeData, 
    updateEdgeData, 
    deleteNode, 
    deleteEdge,
    setSelectedNodeId,
    setSelectedEdgeId,
    language
  } = useFamilyStore();

  const t = translations[language];

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="hidden md:flex w-80 bg-white border-l border-slate-200 p-6 flex-col h-full overflow-y-auto">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.appTitle}</h2>
        <p className="text-sm text-slate-500 mb-6">
          {t.selectToEdit}
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {t.addPerson}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {t.addPerson}
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              {t.addUnion}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {t.addUnion}
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-2">{t.connectNodesTitle}</h3>
            <p className="text-xs text-slate-500">
              {t.connectNodesDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
        onClick={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl md:relative md:shadow-none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-800">
          {selectedNode ? (selectedNode.data.type === 'person' ? t.editPerson : t.editUnion) : t.editRelationship}
        </h2>
        <button 
          onClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
          className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {selectedNode && selectedNode.data.type === 'person' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.firstName}</label>
              <input
                type="text"
                value={selectedNode.data.firstName || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.lastName}</label>
              <input
                type="text"
                value={selectedNode.data.lastName || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.gender}</label>
              <select
                value={selectedNode.data.gender || 'other'}
                onChange={(e) => updateNodeData(selectedNode.id, { gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.birthDate}</label>
              <input
                type="date"
                value={selectedNode.data.birthDate || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.deathDate}</label>
              <input
                type="date"
                value={selectedNode.data.deathDate || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { deathDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.avatarUrl}</label>
              <input
                type="url"
                value={selectedNode.data.avatarUrl || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.biography}</label>
              <textarea
                value={selectedNode.data.bio || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {selectedNode && selectedNode.data.type === 'union' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.unionType}</label>
              <select
                value={selectedNode.data.unionType || 'marriage'}
                onChange={(e) => updateNodeData(selectedNode.id, { unionType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="marriage">{t.marriage}</option>
                <option value="partnership">{t.partnership}</option>
                <option value="single_parent">{t.singleParent}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.startDate}</label>
              <input
                type="date"
                value={selectedNode.data.startDate || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.endDate}</label>
              <input
                type="date"
                value={selectedNode.data.endDate || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {selectedEdge && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.relationshipType}</label>
              <select
                value={selectedEdge.data?.relationType || 'spouse'}
                onChange={(e) => updateEdgeData(selectedEdge.id, { relationType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="spouse">{t.spouse}</option>
                <option value="biological_child">{t.biologicalChild}</option>
                <option value="adopted_child">{t.adoptedChild}</option>
                <option value="step_child">{t.stepChild}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={() => {
            if (selectedNode) deleteNode(selectedNode.id);
            if (selectedEdge) deleteEdge(selectedEdge.id);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {selectedNode ? t.deleteNode : t.deleteRelationship}
        </button>
      </div>
    </div>
    </>
  );
}
