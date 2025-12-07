import React, { useMemo, useCallback, useRef } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import 'reactflow/dist/style.css';
import type { FlowNode, FlowEdge } from '../types';

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const FlowDiagramInner: React.FC<FlowDiagramProps> = ({ nodes, edges }) => {
  const { getNodes } = useReactFlow();
  const flowRef = useRef<HTMLDivElement>(null);

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
        animated: false,
        style: {
          stroke: '#333',
          strokeWidth: 2
        }
      };
    });
  }, [edges]);

  const downloadImage = useCallback(() => {
    const nodesBounds = getRectOfNodes(getNodes());
    const imageWidth = nodesBounds.width + 100;
    const imageHeight = nodesBounds.height + 100;
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#fafafa',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'diagrama-flujo.png';
        link.href = dataUrl;
        link.click();
      });
    }
  }, [getNodes]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={downloadImage}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          padding: '8px 16px',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px'
        }}
      >
        <Download size={16} />
        Descargar PNG
      </button>
      <div ref={flowRef} style={{ height: '700px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }}>
        <ReactFlow nodes={reactFlowNodes} edges={reactFlowEdges} fitView />
      </div>
    </div>
  );
};

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ nodes, edges }) => {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner nodes={nodes} edges={edges} />
    </ReactFlowProvider>
  );
};