"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy, Target, Calendar } from "lucide-react"

type Screen = "welcome" | "aspiration" | "assistant" | "checkin" | "trophy"

interface AppState {
  aspiration: string
  microGoal: string
  streak: number
  lastCheckIn: string | null
  hasUnlockedTrophy: boolean
}

const INITIAL_STATE: AppState = {
  aspiration: "",
  microGoal: "",
  streak: 0,
  lastCheckIn: null,
  hasUnlockedTrophy: false,
}

export default function GremlinGoals() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE)
  const [aspirationInput, setAspirationInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestedGoals, setSuggestedGoals] = useState<string[]>([])
  const [selectedGoal, setSelectedGoal] = useState("")

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gremlin-goals-state")
    if (saved) {
      const parsedState = JSON.parse(saved)
      setAppState(parsedState)

      // Determine which screen to show based on saved state
      if (parsedState.microGoal && !isToday(parsedState.lastCheckIn)) {
        setCurrentScreen("checkin")
      } else if (parsedState.microGoal) {
        setCurrentScreen("checkin")
      } else if (parsedState.aspiration) {
        setCurrentScreen("assistant")
        setAspirationInput(parsedState.aspiration)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gremlin-goals-state", JSON.stringify(appState))
  }, [appState])

  const isToday = (dateString: string | null) => {
    if (!dateString) return false
    const today = new Date().toDateString()
    const checkDate = new Date(dateString).toDateString()
    return today === checkDate
  }

  const generateMicroGoals = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aspiration: aspirationInput }),
      })

      const data = await response.json()
      setSuggestedGoals(data.goals)
    } catch (error) {
      // Fallback mock goals for demo
      setSuggestedGoals(["Write one sentence in a document", "Do 5 push-ups", "Read one page of any book"])
    }

    setIsGenerating(false)
  }

  const lockInGoal = () => {
    setAppState((prev) => ({
      ...prev,
      aspiration: aspirationInput,
      microGoal: selectedGoal,
    }))
    setCurrentScreen("checkin")
  }

  const handleCheckIn = (completed: boolean) => {
    const today = new Date().toISOString()

    setAppState((prev) => {
      const newStreak = completed ? prev.streak + 1 : 0
      const shouldShowTrophy = newStreak === 3 && !prev.hasUnlockedTrophy

      return {
        ...prev,
        streak: newStreak,
        lastCheckIn: today,
        hasUnlockedTrophy: shouldShowTrophy ? true : prev.hasUnlockedTrophy,
      }
    })

    // Show trophy screen if they hit 3-day streak for first time
    if (completed && appState.streak === 2 && !appState.hasUnlockedTrophy) {
      setTimeout(() => setCurrentScreen("trophy"), 1000)
    }
  }

  const resetApp = () => {
    setAppState(INITIAL_STATE)
    setAspirationInput("")
    setSuggestedGoals([])
    setSelectedGoal("")
    localStorage.removeItem("gremlin-goals-state")
    setCurrentScreen("welcome")
  }

  const getSnarkyFeedback = (completed: boolean, streak: number) => {
    if (completed) {
      const responses = [
        "Fine. You did the thing.",
        "Wow. Actual follow-through. Rare.",
        "One day down. Don't get cocky.",
        "Look at you, being consistent.",
        "Progress. Barely, but still.",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    } else {
      const responses = [
        "You didn't do your 1-minute goal? Incredible.",
        "Tomorrow's a new day. And so is failure.",
        "Streak broken. Classic move.",
        "At least you're consistent at being inconsistent.",
        "The goal was literally designed to be easy.",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold text-white">Gremlin Goals</CardTitle>
            <p className="text-gray-300 text-lg leading-relaxed">
              No fluff. No fake motivation. Just you, a goal, and your excuses.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setCurrentScreen("aspiration")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg"
            >
              Let's Go
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentScreen === "aspiration") {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              What's something you wish you were doing more of, but aren't?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={aspirationInput}
              onChange={(e) => setAspirationInput(e.target.value)}
              placeholder="Be honest..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={() => setCurrentScreen("assistant")}
              disabled={!aspirationInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
            >
              Next
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentScreen === "assistant") {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Micro-Goal Assistant</CardTitle>
            <p className="text-gray-300">
              Your aspiration: <span className="italic">"{aspirationInput}"</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!suggestedGoals.length && !isGenerating && (
              <Button onClick={generateMicroGoals} className="w-full bg-green-600 hover:bg-green-700">
                <Target className="w-4 h-4 mr-2" />
                Generate Micro-Goals with AI
              </Button>
            )}

            {isGenerating && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Generating realistic goals...</span>
              </div>
            )}

            {suggestedGoals.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">Pick the smallest one you can actually do:</p>
                {suggestedGoals.map((goal, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedGoal(goal)}
                    className={`w-full p-3 text-left rounded border transition-colors ${
                      selectedGoal === goal
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                    }`}
                  >
                    {goal}
                  </button>
                ))}

                {selectedGoal && (
                  <div className="pt-4 space-y-3">
                    <div className="p-3 bg-gray-700 rounded">
                      <p className="text-sm text-gray-300">This is your Gremlin Goal:</p>
                      <p className="font-semibold text-white">"{selectedGoal}"</p>
                    </div>
                    <Button onClick={lockInGoal} className="w-full bg-red-600 hover:bg-red-700">
                      Lock it in
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentScreen === "checkin") {
    const canCheckInToday = !isToday(appState.lastCheckIn)
    const hasCheckedInToday = isToday(appState.lastCheckIn)

    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                <Calendar className="w-3 h-3 mr-1" />
                Streak: {appState.streak}
              </Badge>
              <button onClick={resetApp} className="text-xs text-gray-500 hover:text-gray-300">
                Reset
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-400">Your aspiration:</p>
              <p className="text-gray-200 italic">"{appState.aspiration}"</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Today's micro-goal:</p>
              <p className="text-white font-semibold">"{appState.microGoal}"</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {canCheckInToday ? (
              <>
                <p className="text-center text-lg font-semibold text-white">Did you do the thing?</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCheckIn(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-3"
                  >
                    ✅ Yes
                  </Button>
                  <Button
                    onClick={() => handleCheckIn(false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-lg py-3"
                  >
                    ❌ No
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-gray-300">
                  {hasCheckedInToday ? getSnarkyFeedback(appState.streak > 0, appState.streak) : "Come back tomorrow."}
                </p>
                <p className="text-sm text-gray-500">Next check-in available tomorrow</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentScreen === "trophy") {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center space-y-4">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
            <CardTitle className="text-2xl text-white">🐁 Rat of Routine</CardTitle>
            <p className="text-gray-300">You did a thing for 3 days. Statistically rare. Please continue.</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentScreen("checkin")} className="w-full bg-yellow-600 hover:bg-yellow-700">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
