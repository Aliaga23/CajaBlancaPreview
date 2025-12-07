import React, { useMemo } from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import type { FlowNode, FlowEdge } from '../types';

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ nodes, edges }) => {
  const reactFlowNodes = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];
    return nodes.map((node) => ({
      id: node.id,
      position: node.position,
      data: { label: node.label },
      style: {
        background: 'white',
        border: '2px solid #333',
        borderRadius: '50%',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }
    }));
  }, [nodes]);

  const reactFlowEdges = useMemo(() => {
    if (!edges || edges.length === 0) return [];
    const seenIds = new Set<string>();
    return edges.map((edge, index) => {
      // Generar ID único para evitar duplicados
      let uniqueId = edge.id || `e${edge.from}-${edge.to}`;
      if (seenIds.has(uniqueId)) {
        uniqueId = `${uniqueId}-${index}`;
      }
      seenIds.add(uniqueId);
      
      return {
        id: uniqueId,
        source: edge.from,
        target: edge.to,
        label: edge.label || '',
        animated: true,
        style: {
          stroke: '#333',
          strokeWidth: 2
        }
      };
    });
  }, [edges]);

  return (
    <div style={{ height: '700px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }}>
      <ReactFlow nodes={reactFlowNodes} edges={reactFlowEdges} fitView />
    </div>
  );
};