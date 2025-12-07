import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
} from 'reactflow';
import { toPng } from 'html-to-image';
import { Download, Plus, Trash2 } from 'lucide-react';
import 'reactflow/dist/style.css';

const nodeStyle = {
  background: 'white',
  border: '2px solid #333',
  borderRadius: '50%',
  width: 60,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const FlowEditorInner: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeLabel, setNodeLabel] = useState('1');
  const [edgeLabel, setEdgeLabel] = useState('');
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}-${Date.now()}`,
        label: edgeLabel || '',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#333', strokeWidth: 2 },
        labelStyle: { fontSize: 12, fontWeight: 'bold' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setEdgeLabel('');
    },
    [edgeLabel, setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      position: { x: 250, y: nodes.length * 100 },
      data: { label: nodeLabel },
      style: nodeStyle,
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeLabel(String(parseInt(nodeLabel) + 1 || nodes.length + 2));
  }, [nodeLabel, nodes.length, setNodes]);

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setNodes, setEdges]);

  const updateEdgeLabel = useCallback(() => {
    if (selectedEdge && edgeLabel) {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === selectedEdge ? { ...e, label: edgeLabel } : e
        )
      );
      setEdgeLabel('');
      setSelectedEdge(null);
    }
  }, [selectedEdge, edgeLabel, setEdges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge.id);
    setEdgeLabel((edge.label as string) || '');
  }, []);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const newLabel = prompt('Nuevo número/texto para el nodo:', node.data.label);
    if (newLabel !== null) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
        )
      );
    }
  }, [setNodes]);

  const downloadImage = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#fafafa',
        width: 800,
        height: 600,
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'diagrama-manual.png';
        link.href = dataUrl;
        link.click();
      });
    }
  }, []);

  const clearAll = useCallback(() => {
    if (confirm('¿Borrar todo el diagrama?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="text"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
            placeholder="Número"
            style={{
              width: '60px',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={addNode}
            style={{
              padding: '6px 12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={16} />
            Nodo
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="text"
            value={edgeLabel}
            onChange={(e) => setEdgeLabel(e.target.value)}
            placeholder="Etiqueta conexión"
            style={{
              width: '120px',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {selectedEdge && (
            <button
              onClick={updateEdgeLabel}
              style={{
                padding: '6px 12px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Actualizar
            </button>
          )}
        </div>

        <button
          onClick={deleteSelected}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Trash2 size={16} />
          Eliminar
        </button>

        <button
          onClick={clearAll}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Limpiar
        </button>

        <button
          onClick={downloadImage}
          style={{
            padding: '6px 12px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Download size={16} />
          PNG
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        padding: '8px 10px',
        backgroundColor: '#e3f2fd',
        fontSize: '12px',
        color: '#1565c0'
      }}>
        Doble clic en nodo para editar • Arrastra desde un nodo a otro para conectar • Clic en línea para editar etiqueta
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, minHeight: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
          snapToGrid
          snapGrid={[10, 10]}
        >
          <Controls />
          <Background gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
};

export const FlowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
};
