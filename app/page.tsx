"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Trophy, Target, Calendar, AlertCircle, Sparkles, Zap, PartyPopper } from "lucide-react"

type Screen = "welcome" | "aspiration" | "assistant" | "checkin" | "trophy"
type GoalMode = "ai" | "manual"

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
  const [goalMode, setGoalMode] = useState<GoalMode>("ai")
  const [manualGoals, setManualGoals] = useState(["", "", ""])
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("gremlin-goals-state")
    if (saved) {
      const parsedState = JSON.parse(saved)
      setAppState(parsedState)

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
    setErrorMessage("")
    
    if (goalMode === "manual") {
      const validGoals = manualGoals.filter(goal => goal.trim() !== "")
      if (validGoals.length === 3) {
        setSuggestedGoals(validGoals)
      } else {
        setErrorMessage("Please fill in all 3 micro-goals before continuing.")
      }
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aspiration: aspirationInput
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        setErrorMessage(data.error)
        return
      }
      
      setSuggestedGoals(data.goals)
    } catch (error) {
      console.error("Error generating goals:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate goals. Please try again.")
    } finally {
      setIsGenerating(false)
    }
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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gremlin-purple/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce-subtle">
              👺
            </div>
          </div>
          
          <Card className="rough-card border-2 border-primary/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-5xl font-display font-bold text-gradient-purple animate-gradient">
                Gremlin Goals
              </CardTitle>
              <div className="relative">
                <div className="absolute -left-4 -top-2 text-4xl">💬</div>
                <p className="text-foreground/80 text-lg leading-relaxed pl-8 italic">
                  No fluff. No fake motivation. Just you, a goal, and your excuses.
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => setCurrentScreen("aspiration")}
                className="w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-bold py-6 text-xl rounded-xl shadow-lg gremlin-glow transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Zap className="w-5 h-5 mr-2" />
                Let's Go
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "aspiration") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gremlin-green/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-7xl mb-3 animate-wiggle">
              👺
            </div>
            <div className="relative inline-block">
              <div className="bg-muted/90 backdrop-blur px-6 py-3 rounded-2xl border-2 border-secondary/50 shadow-lg">
                <p className="text-sm font-medium text-foreground/90">
                  Let's be honest here...
                </p>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-muted/90 rotate-45 border-r-2 border-b-2 border-secondary/50"></div>
            </div>
          </div>
          
          <Card className="rough-card border-2 border-secondary/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-display text-foreground">
                What's something you wish you were doing more of, but aren't?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={aspirationInput}
                onChange={(e) => setAspirationInput(e.target.value)}
                placeholder="Be honest..."
                className="bg-input/50 border-2 border-border focus:border-secondary focus:ring-secondary/50 text-foreground placeholder-muted-foreground text-lg py-6 rounded-xl transition-all duration-200"
              />
              <Button
                onClick={() => setCurrentScreen("assistant")}
                disabled={!aspirationInput.trim()}
                className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-secondary-foreground font-bold py-6 text-lg rounded-xl shadow-lg gremlin-glow-green transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Next
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "assistant") {
    const canGenerate = goalMode === "manual" 
      ? manualGoals.every(goal => goal.trim() !== "")
      : true

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-7xl mb-3">
              {isGenerating ? <span className="animate-spin inline-block">👺</span> : "👺"}
            </div>
          </div>
          
          <Card className="rough-card border-2 border-accent/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-display flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                Micro-Goal Assistant
              </CardTitle>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Your aspiration:</p>
                <p className="text-foreground italic font-medium">"{aspirationInput}"</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!suggestedGoals.length && !isGenerating && (
                <>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground font-medium">Choose your method:</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setGoalMode("ai")}
                        variant={goalMode === "ai" ? "default" : "outline"}
                        className={`flex-1 py-6 text-base font-bold rounded-xl transition-all duration-200 ${
                          goalMode === "ai" 
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground gremlin-glow shadow-lg scale-105" 
                            : "border-2 hover:border-primary/50 hover:bg-primary/10"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Generated
                      </Button>
                      <Button
                        onClick={() => setGoalMode("manual")}
                        variant={goalMode === "manual" ? "default" : "outline"}
                        className={`flex-1 py-6 text-base font-bold rounded-xl transition-all duration-200 ${
                          goalMode === "manual" 
                            ? "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground gremlin-glow-green shadow-lg scale-105" 
                            : "border-2 hover:border-secondary/50 hover:bg-secondary/10"
                        }`}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Manual Entry
                      </Button>
                    </div>
                  </div>

                  {goalMode === "ai" && (
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/30 animate-slide-in">
                      <p className="text-sm text-foreground/80">
                        ✨ AI will generate personalized micro-goals based on your aspiration.
                      </p>
                    </div>
                  )}

                  {goalMode === "manual" && (
                    <div className="space-y-3 animate-slide-in">
                      <p className="text-sm text-muted-foreground font-medium">
                        Enter 3 micro-goals (under 2 minutes each):
                      </p>
                      {manualGoals.map((goal, index) => (
                        <div key={index} className="space-y-2">
                          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                            Goal {index + 1}:
                          </label>
                          <Input
                            value={goal}
                            onChange={(e) => {
                              const newGoals = [...manualGoals]
                              newGoals[index] = e.target.value
                              setManualGoals(newGoals)
                              setErrorMessage("")
                            }}
                            placeholder={`e.g., ${index === 0 ? "Write one sentence" : index === 1 ? "Do 5 push-ups" : "Read one page"}`}
                            className="bg-input/50 border-2 border-border focus:border-secondary focus:ring-secondary/50 text-foreground placeholder-muted-foreground rounded-xl transition-all duration-200"
                          />
                        </div>
                      ))}
                      {manualGoals.some(goal => goal.trim() === "") && (
                        <div className="flex items-center gap-2 p-3 bg-gremlin-yellow/20 rounded-lg border border-gremlin-yellow/50">
                          <AlertCircle className="w-4 h-4 text-gremlin-yellow flex-shrink-0" />
                          <p className="text-xs text-foreground/90 font-medium">
                            Please fill in all 3 goals to continue
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {errorMessage && (
                    <Alert variant="destructive" className="animate-wiggle border-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={generateMicroGoals} 
                    disabled={!canGenerate}
                    className="w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-bold py-6 text-lg rounded-xl shadow-lg gremlin-glow transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    {goalMode === "ai" ? "Generate with AI" : "Use These Goals"}
                  </Button>
                </>
              )}

              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">Generating realistic goals...</p>
                    <p className="text-sm text-muted-foreground">This won't take long</p>
                  </div>
                </div>
              )}

              {suggestedGoals.length > 0 && (
                <div className="space-y-4 animate-pop">
                  <div className="text-center mb-2">
                    <div className="relative inline-block">
                      <div className="bg-muted/90 backdrop-blur px-5 py-2 rounded-2xl border-2 border-primary/50 shadow-lg">
                        <p className="text-sm font-medium text-foreground/90">
                          Pick the smallest one you can actually do:
                        </p>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-muted/90 rotate-45 border-r-2 border-b-2 border-primary/50"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {suggestedGoals.map((goal, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedGoal(goal)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium ${
                          selectedGoal === goal
                            ? "bg-gradient-to-r from-primary to-accent border-primary text-primary-foreground shadow-lg gremlin-glow scale-105"
                            : "bg-card/50 border-border text-foreground hover:border-primary/50 hover:bg-primary/10 hover:scale-102"
                        }`}
                      >
                        <span className="mr-2">{selectedGoal === goal ? "✨" : "📌"}</span>
                        {goal}
                      </button>
                    ))}
                  </div>

                  {selectedGoal && (
                    <div className="pt-2 space-y-3 animate-slide-up">
                      <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border-2 border-primary/50 shadow-lg">
                        <p className="text-sm text-muted-foreground font-semibold mb-2">
                          🎯 This is your Gremlin Goal:
                        </p>
                        <p className="font-bold text-lg text-foreground">"{selectedGoal}"</p>
                      </div>
                      <Button 
                        onClick={lockInGoal} 
                        className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground font-bold py-6 text-lg rounded-xl shadow-lg gremlin-glow-pink transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        🔒 Lock it in
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "checkin") {
    const canCheckInToday = !isToday(appState.lastCheckIn)
    const hasCheckedInToday = isToday(appState.lastCheckIn)

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-7xl mb-3">
              {canCheckInToday ? "👺" : hasCheckedInToday ? "😊" : "👺"}
            </div>
          </div>
          
          <Card className="rough-card border-2 border-primary/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-2 border-primary/50 bg-primary/10 text-primary px-4 py-2 text-base font-bold rounded-xl shadow-md">
                  <Calendar className="w-4 h-4 mr-2" />
                  Streak: {appState.streak} 🔥
                </Badge>
                <button 
                  onClick={resetApp} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline font-medium"
                >
                  Reset
                </button>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                    Your aspiration:
                  </p>
                  <p className="text-foreground italic font-medium">"{appState.aspiration}"</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                    Today's micro-goal:
                  </p>
                  <p className="text-foreground font-bold text-lg">"{appState.microGoal}"</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {canCheckInToday ? (
                <>
                  <div className="text-center py-2">
                    <p className="text-2xl font-display font-bold text-foreground">
                      Did you do the thing?
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleCheckIn(true)}
                      className="bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-secondary-foreground font-bold py-8 text-xl rounded-xl shadow-lg gremlin-glow-green transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <span className="text-3xl mb-1">✅</span>
                      <span className="block text-base">Yes</span>
                    </Button>
                    <Button
                      onClick={() => handleCheckIn(false)}
                      className="bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive text-destructive-foreground font-bold py-8 text-xl rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <span className="text-3xl mb-1">❌</span>
                      <span className="block text-base">No</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-4">
                  {hasCheckedInToday && (
                    <div className="relative inline-block mb-4">
                      <div className="bg-muted/90 backdrop-blur px-6 py-4 rounded-2xl border-2 border-primary/50 shadow-lg">
                        <p className="text-base font-medium text-foreground italic">
                          {getSnarkyFeedback(appState.streak > 0, appState.streak)}
                        </p>
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-muted/90 rotate-45 border-l-2 border-t-2 border-primary/50"></div>
                    </div>
                  )}
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground font-medium">
                      {hasCheckedInToday ? "Next check-in available tomorrow" : "Come back tomorrow"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "trophy") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-gremlin-yellow/10 to-gremlin-pink/10 animate-gradient" />
        
        <div className="animate-pop relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce-subtle">
              🎉
            </div>
          </div>
          
          <Card className="rough-card border-2 border-gremlin-yellow/50 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="flex justify-center">
                <div className="relative">
                  <Trophy className="w-24 h-24 text-gremlin-yellow animate-bounce-subtle" />
                  <div className="absolute inset-0 animate-glow rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="text-6xl mb-3">🐁</div>
                <CardTitle className="text-4xl font-display font-bold text-gradient-purple animate-gradient">
                  Rat of Routine
                </CardTitle>
              </div>
              
              <div className="relative inline-block">
                <div className="bg-muted/90 backdrop-blur px-6 py-4 rounded-2xl border-2 border-gremlin-yellow/50 shadow-lg">
                  <p className="text-base font-medium text-foreground/90">
                    You did a thing for 3 days. Statistically rare. Please continue.
                  </p>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-muted/90 rotate-45 border-r-2 border-b-2 border-gremlin-yellow/50"></div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Button 
                onClick={() => setCurrentScreen("checkin")} 
                className="w-full bg-gradient-to-r from-gremlin-yellow to-gremlin-yellow/80 hover:from-gremlin-yellow/90 hover:to-gremlin-yellow text-secondary-foreground font-bold py-6 text-xl rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <PartyPopper className="w-5 h-5 mr-2" />
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
