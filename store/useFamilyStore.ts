import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { getLayoutedElements } from '@/lib/layout';
import { Language } from '@/lib/translations';
import { db } from '@/lib/db';

export type PersonData = {
  type: 'person';
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
};

export type UnionData = {
  type: 'union';
  unionType: 'marriage' | 'partnership' | 'single_parent';
  startDate?: string;
  endDate?: string;
};

export type FamilyNode = Node<PersonData | UnionData>;

export type FamilyEdge = Edge<{
  relationType: 'spouse' | 'biological_child' | 'adopted_child' | 'step_child';
}>;

interface FamilyState {
  nodes: FamilyNode[];
  edges: FamilyEdge[];
  onNodesChange: OnNodesChange<FamilyNode>;
  onEdgesChange: OnEdgesChange<FamilyEdge>;
  onConnect: OnConnect;
  addPerson: (position: { x: number; y: number }) => void;
  addUnion: (position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<PersonData | UnionData>) => void;
  updateEdgeData: (id: string, data: Partial<FamilyEdge['data']>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  autoLayout: () => void;
  setNodes: (nodes: FamilyNode[]) => void;
  setEdges: (edges: FamilyEdge[]) => void;
  importData: (nodes: FamilyNode[], edges: FamilyEdge[]) => Promise<void>;
  loadFromDB: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
}

const initialNodes: FamilyNode[] = [
  {
    id: '1',
    type: 'personNode',
    position: { x: 250, y: 100 },
    data: {
      type: 'person',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
    },
  },
  {
    id: '2',
    type: 'personNode',
    position: { x: 450, y: 100 },
    data: {
      type: 'person',
      firstName: 'Jane',
      lastName: 'Doe',
      gender: 'female',
    },
  },
  {
    id: 'u1',
    type: 'unionNode',
    position: { x: 350, y: 200 },
    data: {
      type: 'union',
      unionType: 'marriage',
    },
  },
  {
    id: '3',
    type: 'personNode',
    position: { x: 350, y: 350 },
    data: {
      type: 'person',
      firstName: 'Jimmy',
      lastName: 'Doe',
      gender: 'male',
    },
  }
];

const initialEdges: FamilyEdge[] = [
  { id: 'e1-u1', source: '1', target: 'u1', sourceHandle: 'spouse', targetHandle: 'spouse-left', data: { relationType: 'spouse' } },
  { id: 'e2-u1', source: '2', target: 'u1', sourceHandle: 'spouse', targetHandle: 'spouse-right', data: { relationType: 'spouse' } },
  { id: 'eu1-3', source: 'u1', target: '3', sourceHandle: 'child', targetHandle: 'parent', data: { relationType: 'biological_child' } },
];

export const useFamilyStore = create<FamilyState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  
  onNodesChange: (changes: NodeChange<FamilyNode>[]) => {
    const newNodes = applyNodeChanges(changes, get().nodes) as FamilyNode[];
    set({ nodes: newNodes });
    // Sync changes to DB (throttled or bulk in real app, but simple for now)
    db.nodes.clear().then(() => db.nodes.bulkAdd(newNodes));
  },
  
  onEdgesChange: (changes: EdgeChange<FamilyEdge>[]) => {
    const newEdges = applyEdgeChanges(changes, get().edges) as FamilyEdge[];
    set({ edges: newEdges });
    db.edges.clear().then(() => db.edges.bulkAdd(newEdges));
  },
  
  onConnect: (connection: Connection) => {
    // Determine the relation type based on handles
    let relationType: NonNullable<FamilyEdge['data']>['relationType'] = 'spouse';
    
    if (connection.sourceHandle === 'child' || connection.targetHandle === 'parent') {
      relationType = 'biological_child';
    }
    
    const newEdge: FamilyEdge = {
      ...connection,
      id: `e-${uuidv4()}`,
      data: { relationType },
    } as FamilyEdge;
    
    const updatedEdges = addEdge(newEdge, get().edges) as FamilyEdge[];
    set({ edges: updatedEdges });
    db.edges.clear().then(() => db.edges.bulkAdd(updatedEdges));
  },
  
  addPerson: (position) => {
    const newNode: FamilyNode = {
      id: uuidv4(),
      type: 'personNode',
      position,
      data: {
        type: 'person',
        firstName: 'New',
        lastName: 'Person',
      },
    };
    const updatedNodes = [...get().nodes, newNode];
    set({ nodes: updatedNodes });
    db.nodes.add(newNode);
  },
  
  addUnion: (position) => {
    const newNode: FamilyNode = {
      id: uuidv4(),
      type: 'unionNode',
      position,
      data: {
        type: 'union',
        unionType: 'marriage',
      },
    };
    const updatedNodes = [...get().nodes, newNode];
    set({ nodes: updatedNodes });
    db.nodes.add(newNode);
  },
  
  updateNodeData: (id, data) => {
    const updatedNodes = get().nodes.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...data } as any };
      }
      return node;
    });
    set({ nodes: updatedNodes });
    const node = updatedNodes.find(n => n.id === id);
    if (node) db.nodes.put(node);
  },
  
  updateEdgeData: (id, data) => {
    const updatedEdges = get().edges.map((edge) => {
      if (edge.id === id) {
        return { ...edge, data: { ...edge.data, ...data } as any };
      }
      return edge;
    });
    set({ edges: updatedEdges });
    const edge = updatedEdges.find(e => e.id === id);
    if (edge) db.edges.put(edge);
  },
  
  deleteNode: (id) => {
    const updatedNodes = get().nodes.filter((node) => node.id !== id);
    const updatedEdges = get().edges.filter((edge) => edge.source !== id && edge.target !== id);
    set({
      nodes: updatedNodes,
      edges: updatedEdges,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
    db.nodes.delete(id);
    // Also delete associated edges in DB
    db.edges.where('source').equals(id).or('target').equals(id).delete();
  },
  
  deleteEdge: (id) => {
    const updatedEdges = get().edges.filter((edge) => edge.id !== id);
    set({
      edges: updatedEdges,
      selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId,
    });
    db.edges.delete(id);
  },
  
  autoLayout: () => {
    const { nodes, edges } = get();
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);
    set({ nodes: layoutedNodes });
    // Sync to DB
    db.nodes.clear().then(() => db.nodes.bulkAdd(layoutedNodes));
  },

  setNodes: (nodes) => {
    set({ nodes });
    db.nodes.clear().then(() => db.nodes.bulkAdd(nodes));
  },

  setEdges: (edges) => {
    set({ edges });
    db.edges.clear().then(() => db.edges.bulkAdd(edges));
  },

  importData: async (nodes, edges) => {
    await db.transaction('rw', db.nodes, db.edges, async () => {
      await db.nodes.clear();
      await db.edges.clear();
      await db.nodes.bulkAdd(nodes);
      await db.edges.bulkAdd(edges);
    });
    set({ nodes, edges });
  },

  loadFromDB: async () => {
    const dbNodes = await db.nodes.toArray();
    const dbEdges = await db.edges.toArray();
    if (dbNodes.length > 0) {
      set({ nodes: dbNodes as FamilyNode[], edges: dbEdges as FamilyEdge[] });
    } else {
      // First time load - initialize with sample data
      await db.nodes.bulkAdd(initialNodes);
      await db.edges.bulkAdd(initialEdges);
      set({ nodes: initialNodes, edges: initialEdges });
    }
  },
  
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  
  setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
}));
