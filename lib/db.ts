import Dexie, { type Table } from 'dexie';
import { FamilyNode, FamilyEdge } from '@/store/useFamilyStore';

export interface DBNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: any;
}

export interface DBEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: any;
}

export class FamilyDatabase extends Dexie {
  nodes!: Table<DBNode>;
  edges!: Table<DBEdge>;

  constructor() {
    super('FamilyTreeDB');
    this.version(1).stores({
      nodes: 'id, type',
      edges: 'id, source, target'
    });
  }
}

export const db = new FamilyDatabase();
