import dagre from 'dagre';
import { FamilyNode, FamilyEdge } from '@/store/useFamilyStore';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 150;
const unionSize = 50;

export const getLayoutedElements = (nodes: FamilyNode[], edges: FamilyEdge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    const isUnion = node.data.type === 'union';
    dagreGraph.setNode(node.id, { 
      width: isUnion ? unionSize : nodeWidth, 
      height: isUnion ? unionSize : nodeHeight 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isUnion = node.data.type === 'union';
    
    // Dagre centers nodes, React Flow uses top-left
    const xOffset = isUnion ? unionSize / 2 : nodeWidth / 2;
    const yOffset = isUnion ? unionSize / 2 : nodeHeight / 2;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - xOffset,
        y: nodeWithPosition.y - yOffset,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
