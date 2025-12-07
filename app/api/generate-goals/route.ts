import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { aspiration, mode = "initial", previousGoal, previousLevel, streakAchieved, goalHistory = [], reroll } = body

    // Use user's own OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ 
        error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
      }, { status: 503 })
    }
    
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const modelName = "gpt-4o-mini"
    
    if (mode === "levelup") {
      // Generate a harder goal based on the previous one
      const historyContext = goalHistory.length > 0 
        ? `\n\nPrevious goals they've completed:\n${goalHistory.map((g: string, i: number) => `${i + 1}. "${g}"`).join('\n')}`
        : ""
      
      const { text } = await generateText({
        model: openai(modelName),
        temperature: 1,
        prompt: `You are a brutally honest goal-setting assistant helping someone progress toward their aspiration.

USER'S ASPIRATION: "${aspiration}"

LAST GOAL COMPLETED: "${previousGoal}"
They successfully completed this for ${streakAchieved} days straight. They're now at Level ${previousLevel}.
${historyContext}

Your job is to suggest ONE slightly more ambitious micro-goal that:
- Builds on what they just accomplished
- Is still under 2 minutes to complete
- Brings them closer to their aspiration
- Is a natural next step (not a huge jump)
- Is specific and measurable

${reroll ? "IMPORTANT: Generate a DIFFERENT goal than before. Be creative but keep it achievable." : ""}

Be direct. No motivational fluff.

Respond with a JSON object like:
{
  "goal": "Do 10 jumping jacks and 5 squats",
  "rationale": "You mastered 5 jumping jacks, so we're adding squats to build full-body movement.",
  "streakTarget": 3
}

Use streakTarget of 3 for levels 1-2, 5 for levels 3-4, and 7 for level 5+.

Only return the JSON object, nothing else.`,
      })

      const parsed = JSON.parse(text.trim())
      
      return Response.json({
        goal: parsed.goal,
        rationale: parsed.rationale,
        streakTarget: parsed.streakTarget || 3,
      })
    }
    
    // Initial goal generation (3 options)
    const { text } = await generateText({
      model: openai(modelName),
      temperature: 1,
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
