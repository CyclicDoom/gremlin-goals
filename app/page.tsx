"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Loader2, Trophy, Target, Calendar, AlertCircle, Sparkles, Zap, PartyPopper, ArrowUp, History, ChevronRight } from "lucide-react"

type Screen = "welcome" | "aspiration" | "assistant" | "checkin" | "trophy" | "levelup" | "journey"
type GoalMode = "ai" | "manual"

interface GoalRecord {
  id: string
  goalText: string
  level: number
  generatedBy: "ai" | "manual"
  startedAt: string
  completedAt: string
  streakAchieved: number
  rationale?: string
}

interface ActiveGoal {
  id: string
  text: string
  level: number
  streak: number
  streakTarget: number
  startedAt: string
  lastCheckIn: string | null
}

interface AppStateV2 {
  version: 2
  aspiration: string
  activeGoal: ActiveGoal | null
  history: GoalRecord[]
  hasUnlockedTrophy: boolean
}

interface LevelUpData {
  newGoal: string
  rationale: string
  level: number
  streakTarget: number
}

const INITIAL_STATE: AppStateV2 = {
  version: 2,
  aspiration: "",
  activeGoal: null,
  history: [],
  hasUnlockedTrophy: false,
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const getStreakTargetForLevel = (level: number): number => {
  if (level <= 2) return 3
  if (level <= 4) return 5
  return 7
}

const migrateFromV1 = (v1State: any): AppStateV2 => {
  if (v1State.version === 2) return v1State as AppStateV2
  
  const migrated: AppStateV2 = {
    version: 2,
    aspiration: v1State.aspiration || "",
    activeGoal: v1State.microGoal ? {
      id: generateId(),
      text: v1State.microGoal,
      level: 1,
      streak: v1State.streak || 0,
      streakTarget: 3,
      startedAt: new Date().toISOString(),
      lastCheckIn: v1State.lastCheckIn || null,
    } : null,
    history: [],
    hasUnlockedTrophy: v1State.hasUnlockedTrophy || false,
  }
  return migrated
}

export default function GremlinGoals() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [appState, setAppState] = useState<AppStateV2>(INITIAL_STATE)
  const [aspirationInput, setAspirationInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestedGoals, setSuggestedGoals] = useState<string[]>([])
  const [selectedGoal, setSelectedGoal] = useState("")
  const [goalMode, setGoalMode] = useState<GoalMode>("ai")
  const [manualGoals, setManualGoals] = useState(["", "", ""])
  const [errorMessage, setErrorMessage] = useState("")
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null)
  const [isGeneratingLevelUp, setIsGeneratingLevelUp] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: "levelup" | "trophy", state: AppStateV2 } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const goalModeRef = useRef<GoalMode>("ai")

  useEffect(() => {
    const saved = localStorage.getItem("gremlin-goals-state")
    if (saved) {
      const parsedState = JSON.parse(saved)
      const migratedState = migrateFromV1(parsedState)
      setAppState(migratedState)
      
      if (migratedState.version !== parsedState.version) {
        localStorage.setItem("gremlin-goals-state", JSON.stringify(migratedState))
      }

      if (migratedState.activeGoal && !isToday(migratedState.activeGoal.lastCheckIn)) {
        setCurrentScreen("checkin")
      } else if (migratedState.activeGoal) {
        setCurrentScreen("checkin")
      } else if (migratedState.aspiration) {
        setCurrentScreen("assistant")
        setAspirationInput(migratedState.aspiration)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("gremlin-goals-state", JSON.stringify(appState))
  }, [appState])

  useEffect(() => {
    if (pendingAction) {
      const timer = setTimeout(() => {
        if (pendingAction.type === "levelup") {
          triggerLevelUpWithState(pendingAction.state)
        } else if (pendingAction.type === "trophy") {
          setCurrentScreen("trophy")
        }
        setPendingAction(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [pendingAction])

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
          aspiration: aspirationInput,
          mode: "initial"
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
    goalModeRef.current = goalMode
    
    const newGoal: ActiveGoal = {
      id: generateId(),
      text: selectedGoal,
      level: 1,
      streak: 0,
      streakTarget: 3,
      startedAt: new Date().toISOString(),
      lastCheckIn: null,
    }
    
    setAppState((prev) => ({
      ...prev,
      aspiration: aspirationInput,
      activeGoal: newGoal,
    }))
    setCurrentScreen("checkin")
  }

  const handleCheckIn = (completed: boolean) => {
    const today = new Date().toISOString()

    setAppState((prev) => {
      if (!prev.activeGoal) return prev
      
      const newStreak = completed ? prev.activeGoal.streak + 1 : 0
      const hasReachedTarget = newStreak >= prev.activeGoal.streakTarget
      const isFirstTrophy = newStreak === 3 && !prev.hasUnlockedTrophy
      
      let newHistory = prev.history
      
      if (hasReachedTarget && completed) {
        const completedGoal: GoalRecord = {
          id: prev.activeGoal.id,
          goalText: prev.activeGoal.text,
          level: prev.activeGoal.level,
          generatedBy: prev.activeGoal.level === 1 ? goalModeRef.current : "ai",
          startedAt: prev.activeGoal.startedAt,
          completedAt: today,
          streakAchieved: prev.activeGoal.streakTarget,
        }
        newHistory = [...prev.history, completedGoal]
      }
      
      const newState: AppStateV2 = {
        ...prev,
        activeGoal: {
          ...prev.activeGoal,
          streak: newStreak,
          lastCheckIn: today,
        },
        history: newHistory,
        hasUnlockedTrophy: isFirstTrophy ? true : prev.hasUnlockedTrophy,
      }
      
      if (completed) {
        if (hasReachedTarget) {
          setPendingAction({ type: "levelup", state: newState })
        } else if (isFirstTrophy) {
          setPendingAction({ type: "trophy", state: newState })
        }
      }

      return newState
    })
  }

  const triggerLevelUpWithState = async (state: AppStateV2) => {
    if (!state.activeGoal) return
    
    setIsGeneratingLevelUp(true)
    setCurrentScreen("levelup")
    
    try {
      const response = await fetch("/api/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aspiration: state.aspiration,
          mode: "levelup",
          previousGoal: state.activeGoal.text,
          previousLevel: state.activeGoal.level,
          streakAchieved: state.activeGoal.streakTarget,
          goalHistory: state.history.slice(-5).map(g => g.goalText),
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        setErrorMessage(data.error)
        setCurrentScreen("checkin")
        return
      }
      
      setLevelUpData({
        newGoal: data.goal,
        rationale: data.rationale,
        level: state.activeGoal.level + 1,
        streakTarget: data.streakTarget || getStreakTargetForLevel(state.activeGoal.level + 1),
      })
    } catch (error) {
      console.error("Error generating level up goal:", error)
      setErrorMessage("Failed to generate next goal. Please try again.")
      setCurrentScreen("checkin")
    } finally {
      setIsGeneratingLevelUp(false)
    }
  }

  const acceptLevelUp = () => {
    if (!levelUpData || !appState.activeGoal) return
    
    const newActiveGoal: ActiveGoal = {
      id: generateId(),
      text: levelUpData.newGoal,
      level: levelUpData.level,
      streak: 0,
      streakTarget: levelUpData.streakTarget,
      startedAt: new Date().toISOString(),
      lastCheckIn: null,
    }
    
    setAppState((prev) => ({
      ...prev,
      activeGoal: newActiveGoal,
    }))
    
    setLevelUpData(null)
    setCurrentScreen("checkin")
  }

  const rerollLevelUp = async () => {
    setIsGeneratingLevelUp(true)
    
    try {
      const response = await fetch("/api/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aspiration: appState.aspiration,
          mode: "levelup",
          previousGoal: appState.activeGoal?.text,
          previousLevel: appState.activeGoal?.level,
          streakAchieved: appState.activeGoal?.streakTarget,
          goalHistory: appState.history.slice(-5).map(g => g.goalText),
          reroll: true,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        setErrorMessage(data.error)
        return
      }
      
      setLevelUpData({
        newGoal: data.goal,
        rationale: data.rationale,
        level: (appState.activeGoal?.level || 0) + 1,
        streakTarget: data.streakTarget || getStreakTargetForLevel((appState.activeGoal?.level || 0) + 1),
      })
    } catch (error) {
      console.error("Error re-rolling goal:", error)
      setErrorMessage("Failed to generate new goal. Please try again.")
    } finally {
      setIsGeneratingLevelUp(false)
    }
  }

  const confirmReset = () => {
    setAppState(INITIAL_STATE)
    setAspirationInput("")
    setSuggestedGoals([])
    setSelectedGoal("")
    setLevelUpData(null)
    setShowResetConfirm(false)
    localStorage.removeItem("gremlin-goals-state")
    setCurrentScreen("welcome")
  }

  const resetApp = () => {
    setShowResetConfirm(true)
  }

  const devTriggerLevelUp = () => {
    if (!appState.activeGoal) {
      console.log("No active goal - set one first!")
      return
    }
    
    const completedGoal: GoalRecord = {
      id: appState.activeGoal.id,
      goalText: appState.activeGoal.text,
      level: appState.activeGoal.level,
      generatedBy: goalModeRef.current,
      startedAt: appState.activeGoal.startedAt,
      completedAt: new Date().toISOString(),
      streakAchieved: appState.activeGoal.streakTarget,
    }
    
    const newState: AppStateV2 = {
      ...appState,
      activeGoal: {
        ...appState.activeGoal,
        streak: appState.activeGoal.streakTarget,
      },
      history: [...appState.history, completedGoal],
    }
    
    setAppState(newState)
    triggerLevelUpWithState(newState)
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).devTriggerLevelUp = devTriggerLevelUp;
      (window as any).devShowJourney = () => setCurrentScreen("journey");
      (window as any).devShowTrophy = () => setCurrentScreen("trophy");
    }
  })

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

  if (showResetConfirm) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="animate-pop w-full max-w-sm">
          <Card className="rough-card border-2 border-destructive/50 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center text-6xl">
                🏳️
              </div>
              <CardTitle className="text-2xl font-display font-bold text-foreground">
                Giving up already?
              </CardTitle>
              <p className="text-muted-foreground">
                All your progress, your streak, your receipts... gone. Classic.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="gremlin"
                size="lg"
                className="w-full font-bold"
              >
                Wait, no. I'll keep going.
              </Button>
              <Button
                onClick={confirmReset}
                variant="outline"
                size="lg"
                className="w-full border-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                Yeah, wipe it all
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gremlin-purple/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 animate-bounce-subtle flex justify-center text-8xl">
              👾
            </div>
          </div>
          
          <Card className="rough-card border-2 border-primary/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-5xl font-display font-bold text-gradient-purple animate-gradient">
                Gremlin Goals
              </CardTitle>
              <div className="relative">
                <p className="text-foreground/80 text-lg leading-relaxed italic">
                  No fluff. No fake motivation.<br />
                  Just you, a goal, and your excuses.
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Button
                onClick={() => setCurrentScreen("aspiration")}
                variant="gremlin"
                size="xl"
                className="w-full font-bold"
              >
                <Zap className="w-5 h-5 mr-2" />
                Let's Go
              </Button>
              
              {appState.history.length > 0 && (
                <Button
                  onClick={() => setCurrentScreen("journey")}
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-primary/30 hover:bg-primary/10"
                >
                  <History className="w-4 h-4 mr-2" />
                  Show me the receipts ({appState.history.length} done)
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "aspiration") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mb-3 animate-wiggle flex justify-center text-7xl">
              🤔
            </div>
          </div>
          
          <Card className="rough-card border-2 border-accent/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-display font-bold text-foreground">
                What's something you wish you were doing more of, but aren't?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={aspirationInput}
                onChange={(e) => setAspirationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aspirationInput.trim()) {
                    setCurrentScreen("assistant")
                  }
                }}
                placeholder="Be honest..."
                className="bg-input/50 border-2 border-border focus:border-accent focus:ring-accent/50 text-foreground placeholder-muted-foreground text-lg py-6 rounded-xl transition-all duration-200"
              />
              <Button
                onClick={() => setCurrentScreen("assistant")}
                disabled={!aspirationInput.trim()}
                variant="gremlin"
                size="xl"
                className="w-full font-bold"
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
            <div className={`mb-3 flex justify-center text-7xl ${isGenerating ? "animate-spin" : ""}`}>
              🤔
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
                    <SegmentedControl
                      options={[
                        { value: "ai", label: "AI Generated", icon: <Sparkles className="w-4 h-4" /> },
                        { value: "manual", label: "Manual Entry", icon: <Target className="w-4 h-4" /> },
                      ]}
                      value={goalMode}
                      onChange={(value) => setGoalMode(value as GoalMode)}
                      className="w-full"
                    />
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && canGenerate) {
                                generateMicroGoals()
                              }
                            }}
                            placeholder={`e.g., ${index === 0 ? "Write one sentence" : index === 1 ? "Do 5 push-ups" : "Read one page"}`}
                            className="bg-input/50 border-2 border-border focus:border-accent focus:ring-accent/50 text-foreground placeholder-muted-foreground rounded-xl transition-all duration-200"
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
                    variant="gremlin"
                    size="lg"
                    className="w-full font-bold"
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
                        variant="gremlin-pink"
                        size="lg"
                        className="w-full font-bold"
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
    const canCheckInToday = appState.activeGoal && !isToday(appState.activeGoal.lastCheckIn)
    const hasCheckedInToday = appState.activeGoal && isToday(appState.activeGoal.lastCheckIn)
    const progressPercent = appState.activeGoal 
      ? Math.min((appState.activeGoal.streak / appState.activeGoal.streakTarget) * 100, 100)
      : 0

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mb-3 flex justify-center text-7xl">
              {hasCheckedInToday ? "🎉" : "🤨"}
            </div>
          </div>
          
          <Card className="rough-card border-2 border-primary/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-2 border-primary/50 bg-primary/10 text-primary px-3 py-1 text-sm font-bold rounded-xl shadow-md">
                    Level {appState.activeGoal?.level || 1}
                  </Badge>
                  <Badge variant="outline" className="border-2 border-accent/50 bg-accent/10 text-accent px-3 py-1 text-sm font-bold rounded-xl shadow-md">
                    <Calendar className="w-3 h-3 mr-1" />
                    {appState.activeGoal?.streak || 0}/{appState.activeGoal?.streakTarget || 3} 🔥
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {process.env.NODE_ENV === "development" && (
                    <button 
                      onClick={devTriggerLevelUp} 
                      className="text-xs text-accent hover:text-accent/80 transition-colors underline font-medium"
                      title="Dev: Test Level Up"
                    >
                      🧪 Test
                    </button>
                  )}
                  <button 
                    onClick={resetApp} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
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
                  <p className="text-foreground font-bold text-lg">"{appState.activeGoal?.text}"</p>
                </div>
              </div>
              
              {appState.history.length > 0 && (
                <button
                  onClick={() => setCurrentScreen("journey")}
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <History className="w-4 h-4" />
                  Show me the receipts ({appState.history.length} done)
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
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
                      variant="gremlin"
                      size="lg"
                      className="w-full font-bold"
                    >
                      ✅ Yes
                    </Button>
                    <Button
                      onClick={() => handleCheckIn(false)}
                      variant="gremlin-pink"
                      size="lg"
                      className="w-full font-bold"
                    >
                      ❌ No
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-4">
                  {hasCheckedInToday && (
                    <div className="relative inline-block mb-4">
                      <div className="bg-muted/90 backdrop-blur px-6 py-4 rounded-2xl border-2 border-primary/50 shadow-lg">
                        <p className="text-base font-medium text-foreground italic">
                          {getSnarkyFeedback(appState.activeGoal?.streak ? appState.activeGoal.streak > 0 : false, appState.activeGoal?.streak || 0)}
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

  if (currentScreen === "levelup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-accent/10 animate-gradient" />
        
        <div className="animate-pop relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mb-3 animate-bounce-subtle flex justify-center text-8xl">
              🚀
            </div>
          </div>
          
          <Card className="rough-card border-2 border-primary/50 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <Badge className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 text-lg font-bold rounded-full shadow-lg animate-glow">
                  <ArrowUp className="w-5 h-5 mr-2" />
                  LEVEL UP
                </Badge>
              </div>
              <CardTitle className="text-3xl font-display font-bold text-foreground">
                Fine. You actually did it.
              </CardTitle>
              <p className="text-muted-foreground">
                "{appState.activeGoal?.text}" for {appState.activeGoal?.streakTarget} days. Didn't think you had it in you.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isGeneratingLevelUp ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-lg font-medium text-foreground">Finding something harder...</p>
                </div>
              ) : levelUpData ? (
                <>
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border-2 border-primary/50 shadow-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        Level {levelUpData.level}
                      </Badge>
                      <Badge variant="outline" className="border-accent/50 text-accent">
                        {levelUpData.streakTarget} days this time
                      </Badge>
                    </div>
                    <p className="font-bold text-xl text-foreground">"{levelUpData.newGoal}"</p>
                    <p className="text-sm text-muted-foreground italic">{levelUpData.rationale}</p>
                  </div>
                  
                  {errorMessage && (
                    <Alert variant="destructive" className="animate-wiggle border-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-3">
                    <Button
                      onClick={acceptLevelUp}
                      variant="gremlin"
                      size="lg"
                      className="w-full font-bold"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Fine, I'll do it
                    </Button>
                    <Button
                      onClick={rerollLevelUp}
                      variant="outline"
                      size="lg"
                      className="w-full border-2 border-primary/30 hover:bg-primary/10"
                      disabled={isGeneratingLevelUp}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Nah, give me another one
                    </Button>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "journey") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        
        <div className="animate-slide-up relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mb-3 flex justify-center text-7xl">
              📈
            </div>
          </div>
          
          <Card className="rough-card border-2 border-primary/30 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-display flex items-center gap-2">
                  <History className="w-6 h-6 text-primary" />
                  The Receipts
                </CardTitle>
                <button 
                  onClick={() => setCurrentScreen(appState.activeGoal ? "checkin" : "welcome")} 
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ← Back
                </button>
              </div>
              <p className="text-muted-foreground mt-2">
                Proof you're not completely hopeless. Goal: "{appState.aspiration}"
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {appState.history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nothing here yet. Finish a streak first.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appState.history.map((goal, index) => (
                    <div 
                      key={goal.id} 
                      className="p-4 bg-muted/30 rounded-xl border border-border relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                      <div className="flex items-start gap-3 pl-3">
                        <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary shrink-0">
                          Lv.{goal.level}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">"{goal.goalText}"</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {goal.streakAchieved} days. Not bad.
                          </p>
                        </div>
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                  ))}
                  
                  {appState.activeGoal && (
                    <div className="p-4 bg-primary/10 rounded-xl border-2 border-primary/30 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-pulse" />
                      <div className="flex items-start gap-3 pl-3">
                        <Badge className="bg-primary text-primary-foreground shrink-0">
                          Lv.{appState.activeGoal.level}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">"{appState.activeGoal.text}"</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            In progress: {appState.activeGoal.streak}/{appState.activeGoal.streakTarget} days
                          </p>
                        </div>
                        <span className="text-2xl">🔥</span>
                      </div>
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

  if (currentScreen === "trophy") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-gremlin-yellow/10 to-gremlin-pink/10 animate-gradient" />
        
        <div className="animate-pop relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 animate-bounce-subtle flex justify-center text-8xl">
              🎉
            </div>
          </div>
          
          <Card className="rough-card border-2 border-gremlin-yellow/50 bg-card/95 backdrop-blur shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="flex justify-center">
                <div className="relative">
                  <Trophy className="w-24 h-24 text-gremlin-yellow animate-glow" />
                  <PartyPopper className="w-8 h-8 text-gremlin-pink absolute -top-2 -right-2 animate-wiggle" />
                </div>
              </div>
              <CardTitle className="text-4xl font-display font-bold text-gradient-purple">
                🐀 Rat of Routine
              </CardTitle>
              <div className="relative inline-block">
                <div className="bg-muted/90 backdrop-blur px-6 py-4 rounded-2xl border-2 border-gremlin-yellow/50 shadow-lg">
                  <p className="text-base font-medium text-foreground/90">
                    You did a thing for 3 days. Statistically rare. Please continue.
                  </p>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-muted/90 rotate-45 border-r-2 border-b-2 border-gremlin-yellow/50"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => setCurrentScreen("checkin")}
                variant="gremlin"
                size="xl"
                className="w-full font-bold"
              >
                Continue the Streak
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
