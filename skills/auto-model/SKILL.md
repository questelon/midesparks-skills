---
name: auto-model
description: >
  Intelligently auto-select and execute tasks using the best Claude model — goes beyond
  the basic /model command (which only manually sets the model) by actively analyzing
  the task, routing it to the right model, executing it there, and explaining the routing
  decision. Trigger whenever the user types "/auto-model", "auto model", "use auto model",
  "pick the best model for this", "smart model routing", "which model should I use for X",
  or prefixes any task with a request for intelligent model selection. Unlike /model which
  requires the user to know which model to pick, /auto-model does the analysis for you —
  choosing between Opus (deep/complex), Sonnet (balanced/general), or Haiku (fast/simple),
  then executing on that model and showing a clear routing card so the user learns the logic.
  Trigger proactively whenever optimal model selection would benefit the user's task.
---

# Auto-Model Skill — Intelligent Task Router

> **What makes this different from `/model`:**
> The basic `/model` command lets you *manually set* which model to use — you still have
> to decide. `/auto-model` does the analysis *for you*: it reads your task, scores it
> across four dimensions, picks the right model with a reason, executes the work there,
> and shows you a routing card so you understand why. It's the difference between a gear
> selector and an automatic transmission.

---

## The Four Models

| Model | ID | Best For |
|-------|-----|----------|
| **Claude Opus 5** | `claude-opus-5` | Deepest reasoning, nuanced judgment, complex research, strategic decisions, architecture, high-stakes writing, ambiguous problems needing real insight |
| **Claude Sonnet 5** | `claude-sonnet-5` | Fast + highly capable — coding, documents, moderate analysis, most professional work. The reliable all-rounder. |
| **Claude Haiku 4.5** | `claude-haiku-4-5-20251001` | Fastest and lightest — quick Q&A, short summaries, classification, formatting, simple rewrites |
| **Claude Fable 5** | `claude-fable-5` | Current Claude 5 family model. Profile still being established - route to it like any other, and update this row once compared. |

*Fable 5 note: its strengths are not documented yet. Update the row above once you have compared it against Sonnet 5 on the same task.*

---

## Routing Framework

Score the task across all four dimensions, then make a decisive call:

### 1. Reasoning Depth
- Factual / simple → **Haiku**
- Moderate logic / some inference → **Sonnet**
- Multi-step reasoning, trade-offs, ambiguity, genuine judgment needed → **Opus**

### 2. Stakes & Quality Bar
- Casual, exploratory, low-risk → Haiku or Sonnet
- Professional output, external-facing, high-consequence → Sonnet or **Opus**

### 3. Domain Complexity
- Straightforward, well-defined → Haiku
- Technical with nuance (code, data, structured writing) → Sonnet
- Interdisciplinary, research-heavy, no clear right answer → **Opus**

### 4. Response Depth Needed
- Short answer → Haiku
- Medium, structured → Sonnet
- Long, comprehensive, detailed → Sonnet or **Opus**

---

## Hard Routing Rules (override the framework)

| Task Type | Model |
|-----------|-------|
| "Ultrathink" / deep analysis / strategic planning | **Opus** |
| Legal review, financial modeling, risk assessment | **Opus** |
| Complex debugging or system architecture | **Opus** |
| General coding, drafting, data tasks | **Sonnet** |
| Simple rewrites, quick summaries, classification | **Haiku** |
| Image / video / audio generation | Tool-based — route normally, model doesn't matter |

---

## Execution Flow

### Step 1: Show the Routing Card

Before doing anything else, display:

```
╔══════════════════════════════════════════╗
║  🤖 AUTO-MODEL ROUTING                  ║
╠══════════════════════════════════════════╣
║  Selected:  [Model Name]                ║
║  Model ID:  [model-id]                  ║
║  Reason:    [One clear sentence why]    ║
║  Scores:    Reasoning [H/M/H] · Stakes  ║
║             [L/M/H] · Domain [L/M/H]   ║
╚══════════════════════════════════════════╝
```

Use H = High, M = Medium, L = Low for the scores. This routing card is what makes
auto-model transparent and educational — don't skip it.

### Step 2: Execute

**If the task is self-contained** (no deep dependency on earlier conversation history):
- Spawn an Agent with `model` set to the chosen model ID
- Pass the full task and any necessary context in the prompt
- Return the result directly — no re-summarizing unless clarification is needed

**If the task needs full conversation context** (refers to earlier messages, uploaded files, ongoing work):
- State the recommended model clearly
- Say: *"This task needs full session context — I'll handle it here. For future tasks like this, switch to [Model] in Settings for best results."*
- Complete the task yourself at your best effort

### Step 3: Learn loop (optional, for repeat users)

If the user has used auto-model before and you can see a pattern (e.g., they always ask strategic questions), note it: *"You tend to ask strategy-level questions — Opus is your default for these."*

---

## Routing Card Examples

| User's task | Selected | Reason |
|-------------|----------|--------|
| "Analyze the competitive landscape for my startup" | **Opus** | Strategic, multi-dimensional, high-stakes |
| "Fix this Python bug" | **Sonnet** | Technical but well-defined |
| "What does GDP stand for?" | **Haiku** | Simple factual lookup |
| "Review this contract for legal risk" | **Opus** | High-stakes, nuanced legal judgment |
| "Write a blog post draft" | **Sonnet** | Creative but routine |
| "Translate this to French" | **Haiku** | Simple, mechanical |
| "Design a SaaS system architecture" | **Opus** | Complex, strategic, interdisciplinary |
| "Summarize this 3-sentence email" | **Haiku** | Trivially short |
| "Build a React form with validation" | **Sonnet** | Technical, well-defined scope |
| "Should I raise a Series A now?" | **Opus** | High-stakes strategic judgment |

---

## Decisiveness Rule

Pick one model. Don't hedge. When tasks are genuinely borderline, default to **Sonnet**.
But never downgrade to save tokens when the task genuinely warrants Opus — quality
matters more than speed for high-stakes work. The routing card keeps you accountable.
