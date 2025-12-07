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
    const prompt = `Eres un experto en testing de caja blanca. Analiza el código y genera:

1. CÓDIGO NUMERADO - REGLAS DE NUMERACIÓN PARA CAJA BLANCA:
   
   REGLA PRINCIPAL: La numeración NO es secuencial. Sigue el ORDEN DE EJECUCIÓN:
   
   - Numera líneas ejecutables desde el inicio hasta encontrar un IF
   - El IF es un NODO DE DECISIÓN: la línea anterior al IF es donde se bifurca
   - Después del nodo de decisión:
     a) Primero numera TODAS las líneas del bloque TRUE (if) hasta su cierre
     b) Luego numera TODAS las líneas del bloque FALSE (else) 
     c) Los números del else son MENORES que los del bloque if porque van después en la numeración de ejecución pero representan el camino alternativo
   - Para TRY/CATCH:
     a) Numera el bloque try completo
     b) Luego numera el bloque catch con números mayores
   
   IMPORTANTE: 
   - La línea "if (condición) {" NO se numera, el nodo de decisión es la línea anterior
   - La línea "else {" SÍ se numera como inicio del camino alternativo
   - La línea "catch {" SÍ se numera como inicio del manejo de errores

2. DIAGRAMA DE FLUJO:
   - Un nodo circular por cada número de línea
   - Distribución en columnas:
     * x=250: Flujo principal y rama TRUE
     * x=100: Rama FALSE/else (a la izquierda)
     * x=400: Rama catch/error (a la derecha)
   - y aumenta 80px por cada nodo en su columna
   - Nodo "fin" donde convergen todos los caminos
   - Edges con etiquetas en bifurcaciones (condición true/false, Exception)

3. TABLA DE CAMINOS:
   - C1: Happy path (rama true de todas las condiciones)
   - C2, C3...: Caminos con ramas else
   - Cn: Caminos de error (catch)
   - Incluir: recorrido de nodos, entrada de prueba, salida esperada

Código:
\`\`\`
${code}
\`\`\`

JSON de respuesta:
{
  "numberedCode": "código con números N. al inicio de cada línea ejecutable",
  "flowNodes": [{"id": "1", "type": "start", "label": "1", "position": {"x": 250, "y": 0}}],
  "flowEdges": [{"id": "e1-2", "from": "1", "to": "2", "label": ""}],
  "pathTable": [{"camino": "C1", "recorrido": "1,2,3", "entrada": "desc", "salida": "resultado"}]
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
