import React from 'react';
import type { PathRow } from '../types';

interface PathTableProps {
  paths: PathRow[];
}

export const PathTable: React.FC<PathTableProps> = ({ paths }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#9ccc65' }}>
            <th style={headerStyle}>Camino</th>
            <th style={headerStyle}>Recorrido de Nodos</th>
            <th style={headerStyle}>Entrada</th>
            <th style={headerStyle}>Salida</th>
          </tr>
        </thead>
        <tbody>
          {paths.map((path, index) => (
            <tr key={index} style={{ 
              backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
              borderBottom: '1px solid #ddd'
            }}>
              <td style={cellStyle}>{path.camino}</td>
              <td style={cellStyle}>{path.recorrido}</td>
              <td style={cellStyle}>{path.entrada}</td>
              <td style={cellStyle}>{path.salida}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#000',
  backgroundColor: '#9ccc65',
  border: '1px solid #ddd'
};

const cellStyle: React.CSSProperties = {
  padding: '12px',
  border: '1px solid #ddd',
  fontSize: '14px',
  color: '#000'
};
