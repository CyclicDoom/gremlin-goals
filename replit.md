# Gremlin Goals

A no-nonsense goal-tracking app that helps users build habits through micro-goals.

## Overview

Gremlin Goals is a Next.js application that helps users break down aspirations into tiny, achievable micro-goals (under 2 minutes each) and track daily progress with a snarky but motivating interface.

## Recent Changes (December 7, 2025)

### Progressive Goal Advancement System (December 7, 2025)

**New "Level Up" Feature**: Users can now progress through increasingly ambitious goals as they build consistency.

**How It Works**:
1. Complete your streak target (starts at 3 days)
2. AI generates a harder goal based on what you just mastered
3. Accept the new challenge or re-roll for a different option
4. Track your journey from tiny steps to your aspiration

**New Screens**:
- **Level Up Modal** (🚀): Celebratory screen when completing a streak, shows new goal with AI-generated rationale
- **Progression Journey** (📈): Timeline view of all completed goals showing progression

**Technical Implementation**:
- **localStorage Schema V2**: Upgraded from flat state to structured data with goal history
  - `activeGoal`: Tracks current goal with level, streak, and streakTarget
  - `history`: Array of completed GoalRecords with metadata
  - Automatic migration from V1 schema for existing users
- **Smart Streak Targets**: Days required increases with level (3→5→7)
- **Contextual AI Generation**: API now accepts previous goal context for smarter progression
- **Re-roll Capability**: Users can request alternative goals if they don't like the suggestion

**New Data Types**:
```typescript
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
```

---

### Major Framework Migration: Next.js 16 & Tailwind CSS 4

**Next.js 16 Upgrade** (December 7, 2025):
- Upgraded from Next.js 15.2.4 to **Next.js 16.0.7**
- Uses Turbopack by default for faster development builds
- Removed eslint config (now handled by next lint directly)
- Added allowedDevOrigins configuration for Replit proxy compatibility

**Tailwind CSS 4 Migration** (December 7, 2025):
- Upgraded from Tailwind CSS 3.x to **Tailwind CSS 4.0**
- **CSS-first configuration**: Removed `tailwind.config.ts` - all configuration now lives in CSS
- New CSS structure:
  - `@import "tailwindcss"` replaces `@tailwind base/components/utilities`
  - `@theme { }` block defines all theme tokens (colors, fonts, animations)
  - `@plugin "tailwindcss-animate"` registers plugins
- PostCSS updated to use `@tailwindcss/postcss` plugin
- Theme colors now use `--color-*` namespace (e.g., `--color-primary`)
- Custom animations defined in `@theme` with `--animate-*` namespace

**Configuration Changes**:
- `postcss.config.mjs`: Uses `@tailwindcss/postcss` instead of `tailwindcss` + `autoprefixer`
- `app/globals.css`: Contains all Tailwind configuration via CSS-first approach
- `tailwind.config.ts`: Deleted (no longer needed with v4)

---

## Recent Changes (October 28, 2025)

### Design System Refinement & AI Integration

**Check-in Screen Button Update** (October 28, 2025):
- Updated Yes/No buttons to match purple-pink brand colors
- Yes button uses "gremlin" purple gradient (replacing green)
- No button uses "gremlin-pink" hot pink gradient (replacing red)
- Maintains playful emoji design with brand-consistent styling

**Segmented Control Component Added** (October 28, 2025):
- Created custom segmented control UI component for mode selection
- Replaced button group on assistant screen (step 3) with iOS-style segmented control
- Control uses purple-to-pink gradient for active state with glow effect
- Inactive states show subtle hover effects without button appearance
- Manual entry input fields now use pink accent focus states (matching theme)

**Aspiration Screen Styling Fixed** (October 28, 2025): 
- Updated button to use "gremlin-pink" gradient variant (hot pink) instead of green "success" variant
- Applied proper Outfit font sizing (text-3xl) and weight (font-bold) to match design system
- Changed all green accents (borders, backgrounds, focus states) to purple/pink theme colors
- Background gradient changed from green to pink accent
- Speech bubble and card borders now use accent color (pink) instead of secondary (green)
- Input focus states now use pink accent instead of green
- Screen now fully adheres to established purple/pink design system

**AI Integration Status**: The app is configured to use Replit AI Integrations (Replit-managed OpenAI access), which provides OpenAI API access without requiring your own API key. 

**Important**: Replit AI Integrations requires a paid Replit plan. Free users will need to provide their own OpenAI API key. If you see "AI Gateway is not enabled for your account" errors, this means:
- You're on a free Replit plan, OR
- You're in a Team/Enterprise organization where AI Integrations are disabled

**Options**:
1. Upgrade to a paid Replit plan to use Replit-managed OpenAI (recommended - no API key needed)
2. Switch to using your own OpenAI API key (requires OPENAI_API_KEY environment variable)

**Typography Upgrade**: Replaced Fredoka with **Outfit** font - a more elegant, modern geometric typeface that maintains the playful feel while being less bold and more refined.

**Design System Standardization**:
- Created comprehensive button variant system with consistent states:
  - `gremlin`: Primary gradient (purple → pink → purple) with glow
  - `gremlin-pink`: Accent pink gradient for emphasis
  - `success`: Green gradient for positive actions
  - `secondary`: Green variant for secondary actions
  - `destructive`: Red gradient for negative actions
  - All variants include proper hover, active, and disabled states with scale animations
- Standardized input fields with consistent focus states, borders, and transitions
- All components now use design system tokens instead of custom classes

**Visual Characters**: App uses emojis for character expressions across screens:
- Welcome screen: 👾 (space invader - playful gremlin mascot)
- Aspiration screen: 🤔 (thinking face)
- Assistant screen: 🤔 (thinking face, spins while generating)
- Check-in screen: 🎉 (celebration) when completed, 🤨 (skeptical) when pending
- Trophy screen: 🎉 (celebration) for unlocking achievements

**UX Improvements**:
- Added Enter key handlers to aspiration input and manual goal fields for faster form submission
- Optimized image loading with Next.js Image component and priority flags
- Fixed CSS pointer-events issue that was blocking button clicks

### Complete UI Redesign with Personality & Brand

Transformed the app from a minimal dark theme to a vibrant, playful experience that embodies the snarky gremlin personality.

#### Design System:

- **Vibrant Color Palette**:
  - Electric purple (primary): `hsl(271 81% 56%)`
  - Neon green (secondary): `hsl(142 76% 73%)`
  - Hot pink (accent): `hsl(330 81% 60%)`
  - Yellow highlights: `hsl(48 96% 53%)`
  - Deep charcoal background with subtle gradients

- **Typography**:
  - Outfit font for elegant display headings
  - Inter font for clean body text
  - Better hierarchy with gradient text effects

- **Animation System**:
  - Custom animations: slide-up, pop, wiggle, bounce-subtle, glow, gradient
  - Smooth transitions on all interactive elements
  - Button hover effects with scale and glow
  - Accessibility: Full `prefers-reduced-motion` support

- **Visual Elements**:
  - Custom gremlin character illustrations across all screens
  - Speech bubbles for snarky comments
  - Rough card borders with gradient effects
  - Backdrop blur on cards for depth
  - Glow effects on interactive elements

#### Screen Redesigns:

1. **Welcome Screen**: Bouncing gremlin, gradient title, glowing CTA button
2. **Aspiration Screen**: Gremlin with speech bubble, styled input with focus states
3. **Assistant Screen**: AI/Manual toggle with vibrant colors, animated goal cards
4. **Check-in Screen**: Big satisfying buttons, streak counter with fire emoji
5. **Trophy Screen**: Celebration with glowing trophy, bouncing animations

### Dynamic Goal Generation Feature

Replaced hardcoded fallback values with a flexible system that allows users to choose between:

1. **AI-Generated Goals**: Instant AI-powered goal generation using Replit AI Integrations (no API key needed!)
2. **Manual Entry**: Users can enter their own custom 3 micro-goals

#### Key Implementation Details:

- **Replit AI Integrations** (requires paid Replit plan):
  - Uses Replit-managed OpenAI access (gpt-5 model)
  - No API key required from users
  - Seamless authentication via Replit environment variables
  - Costs billed to your Replit credits at public API prices
  - Available to paying users only (free users must use their own API key)
- **Standard OpenAI API** (for external deployments like Netlify):
  - Uses gpt-5-mini model with your own OPENAI_API_KEY
  - Works on any hosting platform
  - Costs billed directly to your OpenAI account
  - gpt-5-mini is faster and more cost-efficient than gpt-5
- **Mode Selection UI**: Simple toggle between "AI Generated" and "Manual Entry" modes
  - AI mode is the default for best user experience
  - No authentication barriers for users
- **Manual Goal Entry**: Three input fields with example placeholders
  - Inline validation shows helper text when fields are incomplete
  - Button disabled until all 3 goals are filled
- **Error Handling**: 
  - AI mode displays clear error messages for API failures
  - Users can retry without reloading the page
  - Manual mode provides immediate guidance when fields are incomplete
- **API Route**: Uses Replit AI Integrations environment variables
  - Returns descriptive errors for API failures
  - No hardcoded fallback values
  - Upgraded to gpt-5 (latest OpenAI model)

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16.0.7 with React 19 (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0 (CSS-first config) with custom UI components
- **AI Integration**: OpenAI SDK with user-provided API keys
- **State Management**: React hooks with localStorage persistence

### Project Structure
```
app/
├── api/
│   └── generate-goals/
│       └── route.ts          # API endpoint for goal generation
├── globals.css
├── layout.tsx
└── page.tsx                   # Main application component

components/
└── ui/                        # Shadcn UI components

lib/
└── utils.ts                   # Utility functions
```

## Development

### Running the App
```bash
npm install
npm run dev
```

The app runs on port 5000 and is accessible at http://0.0.0.0:5000

### User Preferences

- **Coding Style**: TypeScript with React functional components
- **UI Components**: Shadcn UI with Tailwind CSS
- **State Management**: React hooks with localStorage for persistence
- **Error Handling**: User-friendly error messages with retry capability

## Features

1. **Aspiration Input**: Users describe what they want to do more of
2. **Micro-Goal Generation**: 
   - AI mode: Generate 3 micro-goals using OpenAI (user's API key)
   - Manual mode: Enter custom goals
3. **Goal Selection**: Pick one goal to commit to
4. **Daily Check-in**: Track daily completion (Yes/No)
5. **Streak Tracking**: Monitor consecutive days of completion with progress bar
6. **Trophy System**: Unlock "Rat of Routine" trophy at 3-day streak
7. **Progressive Goal System**: 
   - Level up to harder goals after completing streak targets
   - AI generates contextually harder goals based on progress
   - Re-roll option for alternative goal suggestions
8. **Journey View**: Timeline showing all completed goals and progression
9. **Snarky Feedback**: Brutally honest responses to keep users motivated

## Notes

- The app uses localStorage to persist user state between sessions
- AI generation uses Replit AI Integrations (requires paid plan) or user's own OpenAI API key
- The interface includes snarky, motivational feedback to encourage consistency
- AI costs are billed to the developer's Replit credits, making it seamless for end users
