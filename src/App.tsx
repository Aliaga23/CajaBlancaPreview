import { useState } from 'react';
import { CodeAnalyzer } from './services/openai';
import { CodeDisplay } from './components/CodeDisplay';
import { FlowDiagram } from './components/FlowDiagram';
import { PathTable } from './components/PathTable';
import type { AnalysisResult } from './types';
import { Code, GitBranch, Table, Loader2, Key } from 'lucide-react';
import 'reactflow/dist/style.css';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'flow' | 'table'>('code');

  // Código de ejemplo
  const exampleCode = `async function createUsuario(data: any, tenantID: any) {
  try {
    const _usuario = await this.usuarioModel.find({ email: data.email, tenant: tenantID });
    if (_usuario.length < 1) {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash('856341', salt)
      data.password = hash
      data.fullname = data.nombres + ' ' + data.apellidos
      data.tenant = tenantID
      const usuario = await this.usuarioModel.create(data)
      return { data: usuario }
    } else {
      return { data: undefined, message: 'el correo electronico ya esta en uso' }
    }
  } catch (error) {
    return { data: undefined, message: 'no se pudo crear el usuario' }
  }
}`;

  const handleAnalyze = async () => {
    if (!apiKey.trim()) {
      setError('Por favor ingresa tu API Key de OpenAI');
      return;
    }

    if (!code.trim()) {
      setError('Por favor ingresa código para analizar');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const analyzer = new CodeAnalyzer(apiKey);
      const analysis = await analyzer.analyzeCode(code);
      setResult(analysis);
      setActiveTab('code');
    } catch (err) {
      setError('Error al analizar el código: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Analizador de Flujo de Código</h1>
        <p>Analiza código y genera diagramas de flujo, numeración y tablas de caminos con GPT</p>
      </header>

      <div className="container">
        {/* Sección de entrada */}
        <div className="input-section">
          {!import.meta.env.VITE_OPENAI_API_KEY && (
            <div className="api-key-input">
              <Key size={20} />
              <input
                type="password"
                placeholder="Tu API Key de OpenAI"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input"
              />
            </div>
          )}

          <div className="code-input-container">
            <div className="code-input-header">
              <h3>Código a analizar</h3>
              <button 
                onClick={() => setCode(exampleCode)}
                className="button-secondary"
              >
                Cargar ejemplo
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Pega aquí tu código JavaScript/TypeScript..."
              className="code-textarea"
              rows={15}
            />
          </div>

          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="button-primary"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Analizando...
              </>
            ) : (
              'Analizar Código'
            )}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {/* Sección de resultados */}
        {result && (
          <div className="results-section">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                <Code size={18} />
                Código Numerado
              </button>
              <button
                className={`tab ${activeTab === 'flow' ? 'active' : ''}`}
                onClick={() => setActiveTab('flow')}
              >
                <GitBranch size={18} />
                Diagrama de Flujo
              </button>
              <button
                className={`tab ${activeTab === 'table' ? 'active' : ''}`}
                onClick={() => setActiveTab('table')}
              >
                <Table size={18} />
                Tabla de Caminos
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'code' && (
                <div>
                  <h3>Código Numerado</h3>
                  <CodeDisplay code={result.numberedCode} />
                </div>
              )}

              {activeTab === 'flow' && (
                <div>
                  <h3>Diagrama de Flujo</h3>
                  <FlowDiagram 
                    nodes={result.flowNodes} 
                    edges={result.flowEdges} 
                  />
                </div>
              )}

              {activeTab === 'table' && (
                <div>
                  <h3>Tabla de Caminos de Prueba</h3>
                  <PathTable paths={result.pathTable} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
