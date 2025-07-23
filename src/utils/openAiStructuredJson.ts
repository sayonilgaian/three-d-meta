import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { ZodType } from 'zod'

export default async function openAiStructuredJson(
    openAiToken: string,
    jsonSchema: ZodType,
    prompt: string = ''
) {
    const openAiClient = new OpenAI({ apiKey: openAiToken })

    const openAiResponse = await openAiClient.responses.parse({
        model: 'gpt-4o-mini-2024-07-18',
        input: `You are a JSON generator that outputs a “jsonConfig” object for creating a 3D object (to be parsed into a glTF).  
                - Input (optional): either a simple object name (e.g., “cube”, “car”), or a detailed prompt describing the object.  
                - Output must be valid JSON, with structure:

                {
                "jsonConfig": {
                    "meshes": [
                    {
                        "name": string,
                        "vertices": [number, number, number, …],
                        "indices": [integer, integer, integer, …],
                        "uvs": [number, number, …],
                        "colors": [number, number, number, number, …]  // optional
                    },
                    … // possibly more meshes
                    ]
                }
                }

                Constraints:
                1. The “meshes” array may contain multiple mesh objects.
                2. “vertices” is a multiple of 3 (each triplet is x,y,z).
                3. “indices” are integers indexing into the vertex list; values must range from 0 to (number_of_vertices/3 – 1). The length of “indices” should be a multiple of 3 (triangles).
                4. “uvs” are pairs [u, v] per vertex: length equals (vertices.length / 3) × 2.
                5. “colors”, if present, are RGBA quadruplets per vertex: length equals (vertices.length / 3) × 4.
                6. All numeric values should be within typical ranges (e.g., UVs between 0 and 1, colors between 0 and 1).
                7. Do NOT include extraneous keys or comments—output must parse as strict JSON.

                Behavior:
                - If no input is provided, generate a simple default (e.g., a single cube mesh).
                - If given “sphere” or “6‑sided box” etc., build that mesh accordingly.
                - If given a prompt (“a red pyramid”), generate a mesh with appropriate values for a pyramid, include “colors” or default them.
                - Always produce parsable JSON only in the defined schema.

                ${prompt && `Input:${prompt}`}

                Example output (for “cube”):
                {
                "jsonConfig": {
                    "meshes": [
                    {
                        "name": "Cube",
                        "vertices": [...],
                        "indices": [...],
                        "uvs": [...],
                        "colors": [...]
                    }
                    ]
                }
                }
`,
        text: {
            format: zodTextFormat(jsonSchema, 'jsonConfig3d')
        }
    })

    return {
        jsonConfig: openAiResponse.output_parsed,
        tokensConsumed: openAiResponse.usage
    }
}
