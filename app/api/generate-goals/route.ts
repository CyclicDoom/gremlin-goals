import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { aspiration } = await request.json()

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

    // Parse the AI response to extract goals
    const goals = JSON.parse(text.trim())

    return Response.json({ goals })
  } catch (error) {
    console.error("Error generating goals:", error)

    // Fallback goals if AI fails
    const fallbackGoals = [
      "Write one sentence about your day",
      "Do 5 jumping jacks",
      "Organize one small area for 2 minutes",
    ]

    return Response.json({ goals: fallbackGoals })
  }
}
