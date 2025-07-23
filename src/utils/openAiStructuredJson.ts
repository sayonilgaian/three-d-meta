import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodType } from "zod";

export default async function openAiStructuredJson(openAiToken: string, jsonSchema: ZodType) {

    console.log(openAiToken)

    const openAiClient = new OpenAI({ apiKey: openAiToken })

    const openAiResponse = await openAiClient.responses.parse({
        model: 'gpt-4o-mini-2024-07-18',
        input: 'generate 3d object config',
        text: {
            format: zodTextFormat(jsonSchema, "jsonConfig3d"),
        }
    })

    return {
        jsonConfig: openAiResponse.output_parsed,
        tokensConsumed: openAiResponse.usage
    }

}