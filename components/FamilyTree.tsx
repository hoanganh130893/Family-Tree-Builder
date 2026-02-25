'use client';

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFamilyStore } from '@/store/useFamilyStore';
import PersonNode from './nodes/PersonNode';
import UnionNode from './nodes/UnionNode';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import ImportExport from './ImportExport';
import { UserPlus, HeartHandshake, LayoutTemplate, Languages } from 'lucide-react';
import { translations } from '@/lib/translations';

const nodeTypes = {
  personNode: PersonNode,
  unionNode: UnionNode,
};

function Flow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addPerson,
    addUnion,
    autoLayout,
    loadFromDB,
    language,
    setLanguage,
    setSelectedNodeId,
    setSelectedEdgeId,
  } = useFamilyStore();

  const t = translations[language];

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const onAddPerson = useCallback(() => {
    if (reactFlowWrapper.current) {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      addPerson(position);
    }
  }, [screenToFlowPosition, addPerson]);

  const onAddUnion = useCallback(() => {
    if (reactFlowWrapper.current) {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      addUnion(position);
    }
  }, [screenToFlowPosition, addUnion]);

  const onAutoLayout = useCallback(() => {
    autoLayout();
    window.requestAnimationFrame(() => {
      fitView({ duration: 800 });
    });
  }, [autoLayout, fitView]);

  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: '#94a3b8',
    },
    style: {
      strokeWidth: 2,
      stroke: '#94a3b8',
    },
  }), []);

  // Customize edges based on relation type
  const styledEdges = useMemo(() => {
    return edges.map(edge => {
      const relationType = edge.data?.relationType;
      let stroke = '#94a3b8';
      let strokeDasharray = '0';
      
      if (relationType === 'spouse') {
        stroke = '#6366f1'; // indigo-500
      } else if (relationType === 'adopted_child') {
        stroke = '#10b981'; // emerald-500
        strokeDasharray = '5 5';
      } else if (relationType === 'step_child') {
        stroke = '#f59e0b'; // amber-500
        strokeDasharray = '5 5';
      } else if (relationType === 'biological_child') {
        stroke = '#10b981'; // emerald-500
      }

      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: 2,
          stroke,
          strokeDasharray,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: stroke,
        },
      };
    });
  }, [edges]);

  return (
    <div className="flex h-screen w-full bg-slate-50" ref={reactFlowWrapper}>
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          onlyRenderVisibleElements={true}
          nodeDragThreshold={5}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'personNode') return '#3b82f6';
              if (n.type === 'unionNode') return '#ec4899';
              return '#cbd5e1';
            }}
          />
          
          <Panel position="top-left" className="bg-white p-2 rounded-lg shadow-md border border-slate-200 flex gap-2">
            <button
              onClick={onAddPerson}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
              title={t.addPerson}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addPerson}</span>
            </button>
            <button
              onClick={onAddUnion}
              className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-md text-sm font-medium transition-colors"
              title={t.addUnion}
            >
              <HeartHandshake className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addUnion}</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button
              onClick={onAutoLayout}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors"
              title={t.autoLayout}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span className="hidden sm:inline">{t.autoLayout}</span>
            </button>
          </Panel>

          <Panel position="top-right" className="m-4 flex flex-col gap-2 items-end">
            <div className="bg-white p-1 rounded-lg shadow-md border border-slate-200 flex gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${language === 'en' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${language === 'vi' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                VI
              </button>
            </div>
            <SearchBar />
            <ImportExport />
          </Panel>
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
}

export default function FamilyTree() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
