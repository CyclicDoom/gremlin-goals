import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { aspiration, apiKey } = await request.json()

    if (!apiKey) {
      return Response.json({ 
        error: "API key is required. Please provide your OpenAI API key." 
      }, { status: 400 })
    }

    const openai = createOpenAI({
      apiKey: apiKey,
    })

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: `You are a brutally honest goal-setting assistant. A user wants to work on: "${aspiration}"

Your job is to suggest 3 micro-goals that are:
- Under 2 minutes to complete
- Observable/measurable 
- Ridiculously small and achievable
- Connected to their aspiration but not overwhelming

Be direct and practical. No motivational fluff.

Format your response as a JSON array of 3 strings, like:
["Write one sentence in a journal", "Do 5 push-ups", "Read one page of any book"]

Only return the JSON array, nothing else.`,
    })

    const goals = JSON.parse(text.trim())

    return Response.json({ goals })
  } catch (error) {
    console.error("Error generating goals:", error)

    return Response.json({ 
      error: error instanceof Error ? error.message : "Failed to generate goals. Please check your API key and try again."
    }, { status: 500 })
  }
}
