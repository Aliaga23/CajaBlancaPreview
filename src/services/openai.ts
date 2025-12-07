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
    const prompt = `Analiza el código para testing de caja blanca y genera:

1. CÓDIGO NUMERADO (orden de ejecución, NO secuencial):
   - Numera siguiendo el FLUJO DE EJECUCIÓN del código
   - Para IF/ELSE:
     * Numera las líneas antes del if normalmente
     * La línea del if es el nodo de decisión
     * Luego numera TODO el bloque TRUE (if) completo
     * Después numera TODO el bloque FALSE (else)
   - Para TRY/CATCH:
     * Numera todo el bloque try primero
     * Luego numera el bloque catch
   - Los números NO van en orden físico de líneas, van en orden de ejecución
   - Formato: "N. código"

2. DIAGRAMA DE FLUJO:
   - Un nodo por cada número
   - Posiciones en columnas:
     * x=250: Flujo principal y rama TRUE
     * x=100: Rama FALSE/else
     * x=400: Rama catch
     * y incrementa 80px por nodo en cada columna
   - Conexiones simples:
     * Nodos consecutivos del mismo camino conectados
     * En el if: una conexión a TRUE, otra a FALSE con etiquetas
     * Solo UNA conexión del try al catch (no de cada línea)
   - Nodo "fin" al final donde convergen los caminos

3. TABLA DE CAMINOS:
   - C1: camino TRUE (happy path)
   - C2: camino FALSE (else)
   - C3: camino catch (si hay try/catch)

Código:
\`\`\`
${code}
\`\`\`

Responde SOLO JSON:
{
  "numberedCode": "código numerado según orden de ejecución",
  "flowNodes": [{"id": "1", "type": "start", "label": "1", "position": {"x": 250, "y": 0}}],
  "flowEdges": [{"id": "e1-2", "from": "1", "to": "2", "label": ""}],
  "pathTable": [{"camino": "C1", "recorrido": "1,2,3", "entrada": "datos", "salida": "resultado"}]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
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
      temperature: 0.6,
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
