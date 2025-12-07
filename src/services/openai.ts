import OpenAI from 'openai';
import type { AnalysisResult } from '../types';

export class CodeAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async analyzeCode(code: string): Promise<AnalysisResult> {
    const prompt = `Eres un experto en testing de caja blanca y análisis de flujo de código. Analiza el siguiente código y genera:

1. CÓDIGO NUMERADO (siguiendo principios de caja blanca):
   - Numera cada línea ejecutable del código siguiendo el ORDEN DE EJECUCIÓN, no el orden físico de las líneas.
   - Principios de numeración para caja blanca:
     * Primero: declaración de función y código antes de bifurcaciones
     * En IF/ELSE: numera primero TODO el bloque TRUE (if), luego TODO el bloque FALSE (else)
     * En TRY/CATCH: numera primero el bloque TRY completo, luego el bloque CATCH
     * La línea del IF en sí NO se numera como nodo separado, el nodo de decisión es la última línea antes de la bifurcación
   - Formato: "N.  código" donde N es el número de nodo

2. DIAGRAMA DE FLUJO (grafo de control de flujo):
   - Crea un nodo por cada línea numerada
   - Estructura en 3 columnas visuales:
     * x=250: Flujo principal (happy path / rama TRUE)
     * x=100: Rama alternativa (else / false)  
     * x=400: Manejo de excepciones (catch)
   - Separación vertical: 80px entre nodos consecutivos
   - Nodo "fin" al final donde convergen todos los caminos
   - Edges (conexiones):
     * Conecta nodos secuenciales
     * En decisiones: etiqueta con la condición (ej: "condición == true", "condición == false")
     * En try/catch: etiqueta "Exception" hacia el catch
     * Todos los caminos terminan en "fin"

3. TABLA DE CAMINOS (Path Coverage):
   - Identifica TODOS los caminos independientes del código
   - Cada camino debe cubrir una ruta única desde inicio hasta fin
   - Incluye:
     * C1: Camino de éxito (happy path)
     * C2, C3...: Caminos alternativos (else, diferentes condiciones)
     * Cn: Caminos de error (catch, excepciones)
   - Para cada camino especifica: entrada de prueba y salida esperada

Código a analizar:
\`\`\`
${code}
\`\`\`

Responde SOLO con JSON válido:
{
  "numberedCode": "código numerado según orden de ejecución",
  "flowNodes": [
    {"id": "1", "type": "start", "label": "1", "position": {"x": 250, "y": 0}},
    {"id": "fin", "type": "end", "label": "Fin", "position": {"x": 250, "y": 900}}
  ],
  "flowEdges": [
    {"id": "e1-2", "from": "1", "to": "2", "label": ""}
  ],
  "pathTable": [
    {"camino": "C1", "recorrido": "1,2,3", "entrada": "descripción", "salida": "resultado"}
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'o1',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis de código y testing de caja blanca. Genera SIEMPRE JSON válido sin texto adicional. IMPORTANTE: Al numerar código, sigue el ORDEN DE EJECUCIÓN (if→bloque_true→bloque_false), NO el orden secuencial de líneas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const result = JSON.parse(content);
    return result;
  }
}
