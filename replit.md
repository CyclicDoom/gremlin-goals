# Gremlin Goals

A no-nonsense goal-tracking app that helps users build habits through micro-goals.

## Overview

Gremlin Goals is a Next.js application that helps users break down aspirations into tiny, achievable micro-goals (under 2 minutes each) and track daily progress with a snarky but motivating interface.

## Recent Changes (October 28, 2025)

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
  - Fredoka font for playful display headings
  - Inter font for clean body text
  - Better hierarchy with gradient text effects

- **Animation System**:
  - Custom animations: slide-up, pop, wiggle, bounce-subtle, glow, gradient
  - Smooth transitions on all interactive elements
  - Button hover effects with scale and glow
  - Accessibility: Full `prefers-reduced-motion` support

- **Visual Elements**:
  - Placeholder gremlin character (👺 emoji) throughout
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

- **Replit AI Integrations**: 
  - Uses Replit-managed OpenAI access (gpt-5 model)
  - No API key required from users
  - Seamless authentication via Replit environment variables
  - Costs billed to developer's Replit credits
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
- **Framework**: Next.js 15.2.4 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom UI components
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
5. **Streak Tracking**: Monitor consecutive days of completion
6. **Trophy System**: Unlock "Rat of Routine" trophy at 3-day streak
7. **Snarky Feedback**: Brutally honest responses to keep users motivated

## Notes

- The app uses localStorage to persist user state between sessions
- AI generation uses Replit AI Integrations - no user API keys needed
- The interface includes snarky, motivational feedback to encourage consistency
- AI costs are billed to the developer's Replit credits, making it seamless for end users
