import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { aspiration } = await request.json()

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    
    // Check if Replit AI Integrations is available (requires paid Replit plan)
    const hasAIIntegrations = process.env.AI_INTEGRATIONS_OPENAI_API_KEY && 
                              process.env.AI_INTEGRATIONS_OPENAI_API_KEY !== "_DUMMY_API_KEY_"
    
    // Check if user provided their own OpenAI API key
    const hasUserApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
    
    if (!hasAIIntegrations && !hasUserApiKey) {
      return Response.json({ 
        error: "OpenAI API key not configured. Either upgrade to a paid Replit plan to use Replit AI Integrations, or provide your own OPENAI_API_KEY environment variable."
      }, { status: 503 })
    }
    
    const openai = createOpenAI({
      baseURL: hasAIIntegrations ? process.env.AI_INTEGRATIONS_OPENAI_BASE_URL : undefined,
      apiKey: hasAIIntegrations ? process.env.AI_INTEGRATIONS_OPENAI_API_KEY : process.env.OPENAI_API_KEY,
    })

    const { text } = await generateText({
      model: openai("gpt-5"),
      temperature: 1, // GPT-5 only supports temperature=1
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
      error: error instanceof Error ? error.message : "Failed to generate goals. Please try again."
    }, { status: 500 })
  }
}
