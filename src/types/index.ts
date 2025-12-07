export interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  position: { x: number; y: number };
  code?: string;
  lineNumber?: number;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface PathRow {
  camino: string;
  recorrido: string;
  entrada: string;
  salida: string;
}

export interface AnalysisResult {
  numberedCode: string;
  flowNodes: FlowNode[];
  flowEdges: FlowEdge[];
  pathTable: PathRow[];
}
