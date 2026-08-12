
import json
import re
import asyncio
import random
from groq import Groq
from config import settings

client = Groq(api_key=settings.groq_api_key)
MODEL = "llama-3.3-70b-versatile"


def get_groq_client():
    return client


def _clean_json(text: str) -> str:
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return text


def _safe_json(text: str, fallback: dict) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return fallback


# ─────────────────────────────────────────────────────────────────────────────
# LOG RESTRUCTURING
# ─────────────────────────────────────────────────────────────────────────────

async def restructure_log(raw_content: str) -> dict:
    prompt = f"""You are a learning log assistant for a tech mentorship platform.

A mentee has written their daily learning log below. Your job is to:
1. Give it a clear, professional title (e.g. "Introduction to Docker Containers")
2. Extract 3-6 key topics as short tags (e.g. ["Docker", "Containers", "Port Mapping"])
3. Rewrite the content as a structured professional log — MAXIMUM 700 characters total

Rules:
- Keep the meaning and substance of what the mentee wrote
- Use professional language without losing their voice
- Structure: What I Learned, Key Concepts, Challenges, Next Steps
- structured_content MUST be under 700 characters — be concise
- Do not pad or repeat information

Respond with ONLY valid JSON, no markdown:
{{
  "title": "...",
  "topics": ["...", "..."],
  "structured_content": "..."
}}

Raw log:
{raw_content}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())
    result = _safe_json(text, {
        "title": "Daily Learning Log",
        "topics": ["General Learning"],
        "structured_content": raw_content[:700]
    })

    if len(result.get("structured_content", "")) > 700:
        result["structured_content"] = result["structured_content"][:697] + "..."

    return result


# ─────────────────────────────────────────────────────────────────────────────
# DIFFICULTY DETECTION
# ─────────────────────────────────────────────────────────────────────────────

async def detect_difficulty(
    structured_content: str,
    mentee_hint: str = None
) -> str:
    valid_levels = ["beginner", "intermediate", "advanced"]

    hint_clause = ""
    if mentee_hint and mentee_hint.lower() in valid_levels:
        hint_clause = (
            f"\nThe mentee self-reported: {mentee_hint.upper()}. "
            f"Lean toward this if ambiguous. Override only if content clearly contradicts it."
        )

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{
                "role": "user",
                "content": f"""Classify the difficulty level of this learning log.

Respond with EXACTLY one word — no punctuation, no explanation, no other text.
Your answer must be one of: beginner, intermediate, advanced

Classification rules:
- beginner: definitions, first exposure, "I learned what X is", surface-level understanding
- intermediate: explains HOW or WHY things work, understands mechanisms, can apply concepts
- advanced: system design, architectural trade-offs, edge cases, deep implementation detail
{hint_clause}

Log to classify:
{structured_content[:1200]}

Your single-word answer:"""
            }],
            temperature=0.0,
            max_tokens=10,
        )

    response = await asyncio.to_thread(_call)
    raw = response.choices[0].message.content.strip().lower()
    print(f"[DIFFICULTY] Raw response: '{raw}'")

    result = raw.replace(".", "").replace(",", "").replace("*", "").strip()

    for level in valid_levels:
        if level in result:
            print(f"[DIFFICULTY] Detected: {level}")
            return level

    content_lower = structured_content.lower()
    advanced_signals = [
        "trade-off", "tradeoff", "architecture", "system design", "scalability",
        "distributed", "kernel", "concurrency", "race condition", "bottleneck",
        "latency", "throughput", "fault tolerance", "sharding", "replication"
    ]
    beginner_signals = [
        "what is", "introduction to", "first time", "i learned what",
        "i didn't know", "basic", "getting started", "for the first time",
        "i now understand what", "definition of"
    ]

    advanced_hits = sum(1 for s in advanced_signals if s in content_lower)
    beginner_hits = sum(1 for s in beginner_signals if s in content_lower)

    if advanced_hits >= 2:
        print(f"[DIFFICULTY] Keyword fallback: advanced ({advanced_hits} signals)")
        return "advanced"
    if beginner_hits >= 2:
        print(f"[DIFFICULTY] Keyword fallback: beginner ({beginner_hits} signals)")
        return "beginner"

    if mentee_hint and mentee_hint.lower() in valid_levels:
        print(f"[DIFFICULTY] Falling back to hint: {mentee_hint}")
        return mentee_hint.lower()

    print("[DIFFICULTY] Defaulting to intermediate")
    return "intermediate"


# ─────────────────────────────────────────────────────────────────────────────
# VERIFICATION QUESTION
# ─────────────────────────────────────────────────────────────────────────────

# Scenario frames — mentor puts the mentee inside a vivid real context
_SCENARIO_FRAMES = [
    {
        "label": "PRODUCTION INCIDENT",
        "instruction": (
            "Something just broke in production and the team is paging. "
            "Drop the mentee mid-crisis using exactly what they studied today. "
            "They need to diagnose, not theorise."
        ),
        "opening": "Start after the alert has fired — the incident is live."
    },
    {
        "label": "PEER EXPLANATION",
        "instruction": (
            "A colleague — intern, PM, or new hire — is confused about the exact "
            "concept from today's log. The mentee has to explain it clearly, "
            "using a concrete analogy or example, not jargon."
        ),
        "opening": "Name the confused person specifically. Make the gap in their understanding clear."
    },
    {
        "label": "DESIGN DECISION",
        "instruction": (
            "Two technical approaches exist for solving a problem rooted in today's topic. "
            "Give real constraints — deadline, team size, scale. "
            "Ask the mentee to pick one and justify it."
        ),
        "opening": "Start mid-decision. The team is already leaning one way — make the mentee push back or agree with evidence."
    },
    {
        "label": "CODE REVIEW",
        "instruction": (
            "A junior dev submitted a PR that misuses or misunderstands the exact concept "
            "from today's log. Describe what the code does wrong without showing code. "
            "Ask the mentee to spot the issue and explain the fix."
        ),
        "opening": "Start after the PR is already open. The CI passed but something is semantically wrong."
    },
    {
        "label": "POST-MORTEM",
        "instruction": (
            "A failure already happened because someone didn't understand today's concept. "
            "Describe the outcome and ask the mentee to trace the root cause "
            "back to the gap in understanding."
        ),
        "opening": "Start after the failure. The team is in the post-mortem meeting."
    },
    {
        "label": "CLIENT CONSTRAINT",
        "instruction": (
            "A client or stakeholder has added a constraint that directly challenges "
            "how today's concept works at scale or in their specific context. "
            "Ask the mentee to adapt their approach."
        ),
        "opening": "Start with the client's constraint already stated — the mentee must respond."
    },
    {
        "label": "ONBOARDING A JUNIOR",
        "instruction": (
            "The mentee has been asked to write the documentation or onboarding guide "
            "section that explains today's concept to someone joining the team next week. "
            "Ask them to draft the key points, not the full doc."
        ),
        "opening": "Start with the team lead's Slack message assigning the task."
    },
    {
        "label": "PLANNING AHEAD",
        "instruction": (
            "A new project phase is about to start and today's concept is critical to it. "
            "Ask the mentee to anticipate one risk, recommend an approach, "
            "or structure the first step using what they learned."
        ),
        "opening": "Start before any code has been written — in the planning meeting."
    },
]

# Bloom's level guidance per difficulty
_BLOOM_GUIDE = {
    "beginner": {
        "level": "Level 2 — Understand",
        "instruction": (
            "Test whether the mentee can explain WHY the concept matters or HOW it works "
            "at a basic level — not just what it's called. They should be able to give "
            "an example without copying their log verbatim."
        ),
    },
    "intermediate": {
        "level": "Level 3 — Apply",
        "instruction": (
            "Test whether the mentee can use the concept in a situation they haven't seen before. "
            "They should need to reason through a real decision, not recall a definition. "
            "Make it specific to the exact tool or mechanism in their log."
        ),
    },
    "advanced": {
        "level": "Level 4 — Analyze",
        "instruction": (
            "Test system-level reasoning, trade-off analysis, or root-cause identification. "
            "The mentee should weigh options, consider constraints, or defend a design choice. "
            "There should be no single obvious answer."
        ),
    },
}

# Reflection question pool — Type E, always appended as second question
_REFLECTION_QUESTIONS = [
    "What's the one thing from today's study session that still feels fuzzy? Be specific.",
    "If you had to teach exactly what you studied today to someone in 3 sentences, what would you say?",
    "What would break if you misunderstood the core concept from today's log?",
    "Rate your actual confidence in what you studied today from 1–5. What's sitting behind that number?",
    "What question did today's session open up that you haven't answered yet?",
    "What's the difference between what you understood at the start of today versus right now?",
    "Which part of today's topic would you least want to be asked about in a technical interview, and why?",
    "If you had to apply today's concept tomorrow in a real project, what would you need to look up first?",
]

# Company contexts for scenario grounding — picked randomly per call
_COMPANY_CONTEXTS = [
    "a Lagos-based fintech startup (20-person eng team)",
    "Paystack's backend infrastructure team",
    "a mid-size Nigerian logistics company scaling nationally",
    "a healthtech startup building for West African hospitals",
    "a remote-first product team with engineers across Africa and Europe",
    "Google's SRE team (Nigerian office)",
    "a Kenyan e-commerce platform handling Black Friday scale",
    "an early-stage edtech company in Abuja",
    "Flutterwave's platform reliability team",
    "a data engineering team at a pan-African bank",
]

async def generate_verification_question(
    structured_content: str,
    difficulty: str
) -> dict:
    frame = random.choice(_SCENARIO_FRAMES)
    bloom = _BLOOM_GUIDE.get(difficulty, _BLOOM_GUIDE["intermediate"])
    reflection = random.choice(_REFLECTION_QUESTIONS)

    prompt = f"""You are a sharp, experienced mentor who just read your mentee's daily log.
Your job is to write ONE question that tests whether they actually understood what they studied.

What they studied today:
---
{structured_content}
---

Read the log carefully. Before writing anything:
- What field or domain is this mentee working in? (tech, design, business, healthcare, writing, finance — infer it from the log)
- What's the most interesting thing they studied that could trip someone up in real life?
- What context would make this feel real — a company, a team, a client situation, a deadline?

Now write a question. It must:
- Feel like a message from a real person who actually read the log — not a teacher setting an exam
- Drop the mentee into a realistic situation that fits THEIR domain (not always tech)
- Ask ONE clear question that requires them to actually think, not just recall
- Be under 100 words total
- Vary in how it opens — sometimes start with the scenario, sometimes with a short observation, sometimes just the question itself

Do NOT follow a fixed template. Do NOT always open with praise. Do NOT use "Oh nice" or "I've got one for you" as fixed phrases. Let the content drive the opening.

Bad example (too robotic and templated):
"Oh nice, you got into X today. Anyway, I've got one for you — you're a backend engineer at a Lagos fintech startup..."

Good example (natural, domain-appropriate, varied):
"Quick one — you're three days into onboarding at a mid-size design agency and the creative director asks you to walk the team through [concept from log]. The junior designer in the room has zero context. How do you frame it without losing them?"

Good example (direct, no preamble):
"Your client just rejected the [concept from log] approach because 'it feels complicated.' They want something simpler but the simpler option has a real tradeoff. What do you tell them?"

Good example (observation-led):
"The tricky part about [concept from log] is that most people get it wrong in exactly the same way. What's the mistake, and what does getting it right actually look like in practice?"

Difficulty: {difficulty.upper()}
What to test: {bloom["instruction"]}
Question frame: {frame["label"]}
Frame instruction: {frame["instruction"]}

Return ONLY valid JSON, no markdown:
{{
  "scenario_question": "<the full question, under 100 words>",
  "reflection_question": "{reflection}",
  "correct_answer": "<accurate concise answer drawn from the log content>",
  "bloom_level": "{bloom["level"]}",
  "frame": "{frame["label"]}"
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.92,
            top_p=0.95,
            max_tokens=500,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())

    fallback_reflection = random.choice(_REFLECTION_QUESTIONS)
    return _safe_json(text, {
        "scenario_question": (
            "Quick one — walk me through the most important concept from today's session "
            "using a real example from your field. What does getting it wrong actually look like?"
        ),
        "reflection_question": fallback_reflection,
        "correct_answer": "Open-ended explanation based on log content.",
        "bloom_level": bloom["level"],
        "frame": frame["label"],
    })
# async def generate_verification_question(
#     structured_content: str,
#     difficulty: str
# ) -> dict:
#     # True randomness — no hash determinism
#     frame = random.choice(_SCENARIO_FRAMES)
#     bloom = _BLOOM_GUIDE.get(difficulty, _BLOOM_GUIDE["intermediate"])
#     company = random.choice(_COMPANY_CONTEXTS)
#     reflection = random.choice(_REFLECTION_QUESTIONS)

#     prompt = f"""You are a sharp, direct senior mentor. You just read your mentee's daily log.
# Now you want to test whether they actually understood it — not whether they can copy it back.

# What they studied today:
# ---
# {structured_content}
# ---

# Generate ONE scenario question and return it along with the reflection question already provided.

# YOUR SCENARIO QUESTION must follow this exact structure, with blank lines between each part:

# Part 1 — Genuine reaction (1 sentence):
# Reference something SPECIFIC from the log. Sound like you read it, not like you skimmed it.
# Good: "Oh nice, you got into connection pooling today — that's exactly where most apps quietly bleed performance."
# Bad: "Great work today!" (too generic)
# Bad: "I see you learned about X" (robotic)

# [blank line]

# Part 2 — Casual bridge (1 sentence):
# Signal you're about to test them. Keep it conversational.
# Examples: "Anyway, I've got one for you —" / "Let me throw something at you —" / "Before you close the laptop —"

# [blank line]

# Part 3 — Grounded scenario + question (2-3 sentences):
# Set the scene at: {company}
# Put the mentee in a specific role.
# Ground the problem directly in what they studied today.
# Ask ONE sharp question that requires real understanding — not recall.

# Cognitive target: {bloom["level"]}
# What to test: {bloom["instruction"]}
# Question frame: {frame["label"]}
# Frame instruction: {frame["instruction"]}
# Frame opening: {frame["opening"]}

# Hard rules:
# - Never open with "What is", "Define", or "Explain what X is"
# - Never include hints or partial answers
# - The reaction MUST name something specific from the log — no generic praise
# - The scenario MUST be at {company} — name it explicitly
# - Total length: under 120 words
# - Sound like a mentor texting their mentee, not writing an exam

# Return ONLY valid JSON, no markdown:
# {{
#   "scenario_question": "reaction\\n\\nbridge\\n\\nscenario + question",
#   "reflection_question": "{reflection}",
#   "correct_answer": "<accurate concise answer drawn from the log content>",
#   "bloom_level": "{bloom["level"]}",
#   "frame": "{frame["label"]}"
# }}"""

#     def _call():
#         return client.chat.completions.create(
#             model=MODEL,
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.92,
#             top_p=0.95,
#             max_tokens=500,
#         )

#     response = await asyncio.to_thread(_call)
#     text = _clean_json(response.choices[0].message.content.strip())

#     fallback_reflection = random.choice(_REFLECTION_QUESTIONS)
#     return _safe_json(text, {
#         "scenario_question": (
#             "Interesting log today.\n\n"
#             "Let me throw one at you —\n\n"
#             f"You're a backend engineer at {company}. A junior dev on the team asks you "
#             "to walk them through the most important concept from your study session using "
#             "a real example from your stack. How would you explain it?"
#         ),
#         "reflection_question": fallback_reflection,
#         "correct_answer": "Open-ended explanation based on log content.",
#         "bloom_level": bloom["level"],
#         "frame": frame["label"],
#     })


# ─────────────────────────────────────────────────────────────────────────────
# ANSWER EVALUATION
# ─────────────────────────────────────────────────────────────────────────────

# Scoring rubric per Bloom's level and difficulty
_SCORING_RUBRIC = {
    "beginner": {
        "pass_threshold": 58,
        "dimensions": [
            ("Core concept accuracy", 40, "Did they get the fundamental idea right?"),
            ("Clarity of explanation", 35, "Could someone else understand this?"),
            ("Use of example or analogy", 25, "Did they ground it in something concrete?"),
        ],
    },
    "intermediate": {
        "pass_threshold": 65,
        "dimensions": [
            ("Conceptual accuracy", 35, "Is the mechanism or reasoning correct?"),
            ("Application to the scenario", 40, "Did they actually engage with the specific situation?"),
            ("Depth beyond the obvious", 25, "Did they say something non-trivial?"),
        ],
    },
    "advanced": {
        "pass_threshold": 72,
        "dimensions": [
            ("Technical accuracy", 30, "Are the specifics correct?"),
            ("Trade-off or constraint awareness", 35, "Did they acknowledge complexity?"),
            ("Reasoning quality", 35, "Is the logic sound and defensible?"),
        ],
    },
}


async def evaluate_answer(
    question: str,
    correct_answer: str,
    user_answer: str,
    difficulty: str,
    question_type: str = "scenario",  # "scenario" | "reflection"
) -> dict:
    rubric = _SCORING_RUBRIC.get(difficulty, _SCORING_RUBRIC["intermediate"])
    threshold = rubric["pass_threshold"]
    dimensions_text = "\n".join([
        f"- {name} ({weight} pts): {desc}"
        for name, weight, desc in rubric["dimensions"]
    ])

    if question_type == "reflection":
        eval_instruction = """This is a reflection question — there is no single correct answer.
Evaluate on:
- Honesty and self-awareness (40 pts): Did they genuinely reflect or give a safe, vague answer?
- Specificity (35 pts): Did they name something concrete — a concept, a gap, a moment of confusion?
- Growth signal (25 pts): Does the answer show they're thinking about their own learning process?

A score above 60 means they reflected meaningfully. Below 60 means the answer was too generic or surface-level.
Feedback should affirm genuine reflection and gently push for more depth where missing."""
    else:
        eval_instruction = f"""Evaluate using these dimensions (total 100 pts):
{dimensions_text}

Pass threshold for {difficulty.upper()}: {threshold}/100
If they pass, say what specifically they got right.
If they fail, identify the exact gap — do NOT give the full answer away.
Hint at what they missed without solving it for them."""

    prompt = f"""You are a senior technical mentor evaluating your mentee's answer.
Be fair, direct, and specific. Generic feedback is useless.

Question asked: {question}
Reference answer: {correct_answer}
Mentee's answer: {user_answer}
Difficulty: {difficulty.upper()}
Question type: {question_type.upper()}

{eval_instruction}

Feedback structure — write THREE distinct parts separated by blank lines:

Part 1 — Verdict (1 sentence):
Be direct. "You got this." / "Close, but one thing is off." / "You missed the core of it."
Do not sugarcoat a fail or undersell a pass.

Part 2 — Specific observation (2-3 sentences):
Point to something exact in their answer. Quote or paraphrase what they said.
If they passed: name the strongest part. If they failed: name the specific gap.
Never say "good effort" or "great attempt" — those are filler.

Part 3 — Feed-forward (1-2 sentences):
Tell them what to do next — not what they got wrong, but what to do about it.
Start with: "To sharpen this —" / "Next, go look at —" / "The thing to explore now is —"
Be specific. Name a concept, a resource type, or an action.

Respond with ONLY valid JSON, no markdown:
{{
  "passed": true or false,
  "score": <integer 0-100>,
  "feedback": "verdict\\n\\nspecific observation\\n\\nfeed-forward"
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.25,
            max_tokens=400,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())

    result = _safe_json(text, {
        "passed": False,
        "score": 0,
        "feedback": "Could not evaluate your answer. Please try again."
    })

    # Enforce threshold — don't let the AI pass someone below the floor
    if result.get("score", 0) < threshold:
        result["passed"] = False
    elif result.get("score", 0) >= threshold:
        result["passed"] = True

    return result


# ─────────────────────────────────────────────────────────────────────────────
# MENTEE LOG SUMMARY (MENTOR VIEW)
# ─────────────────────────────────────────────────────────────────────────────

async def summarise_mentee_logs(logs: list, mentee_name: str) -> dict:
    empty_response = {
        "focus_areas": [],
        "overview": "No logs available yet — mentee has not submitted any entries.",
        "recommendations": "Encourage your mentee to start logging daily before anything else.",
        "activity_pattern": "No data available.",
        "consistency_signal": "No logs",
        "learning_depth_pattern": "Unknown",
        "risk_flags": ["No logs submitted — engagement at zero"],
        "strength_signals": [],
        "session_agenda": [],
        "where_they_are_going": "Cannot assess — no activity.",
        "how_they_are_going": "Cannot assess — no activity.",
        "what_mentor_should_do_next": "Establish a daily logging habit first.",
    }

    if not logs:
        return empty_response

    total = len(logs[:20])
    signed_count = sum(1 for l in logs[:20] if l.get("signed"))
    passed_count = sum(1 for l in logs[:20] if l.get("test_passed"))
    failed_count = sum(
        1 for l in logs[:20]
        if l.get("test_attempted") and not l.get("test_passed")
    )
    not_attempted = sum(1 for l in logs[:20] if not l.get("test_attempted"))

    from datetime import datetime
    dates = []
    for l in logs[:20]:
        d = l.get("log_date")
        if d:
            try:
                dates.append(datetime.strptime(d, "%Y-%m-%d"))
            except Exception:
                pass
    dates.sort(reverse=True)
    gaps = []
    for i in range(len(dates) - 1):
        gap = (dates[i] - dates[i + 1]).days
        if gap > 2:
            gaps.append(gap)
    longest_gap = max(gaps) if gaps else 0
    gap_count = len(gaps)

    # Word count trend for quality signal
    word_counts = []
    for l in logs[:20]:
        content = l.get("structured_content") or l.get("raw_content") or ""
        word_counts.append(len(content.split()))
    avg_words = round(sum(word_counts) / len(word_counts)) if word_counts else 0
    recent_avg = round(sum(word_counts[:5]) / len(word_counts[:5])) if len(word_counts) >= 5 else avg_words
    depth_declining = recent_avg < (avg_words * 0.6) if avg_words > 0 else False

    # Topic repetition signal
    all_topics = []
    for l in logs[:20]:
        all_topics.extend(l.get("structured_topics", []))
    unique_topic_ratio = len(set(all_topics)) / len(all_topics) if all_topics else 1.0
    topics_repetitive = unique_topic_ratio < 0.4

    log_summaries = "\n".join([
        f"[{l.get('log_date', '?')}] "
        f"{l.get('structured_title', 'Untitled')} | "
        f"Topics: {', '.join(l.get('structured_topics', []))} | "
        f"Difficulty: {l.get('difficulty_level', 'unknown')} | "
        f"Words: {len((l.get('structured_content') or l.get('raw_content') or '').split())} | "
        f"Test: {'Passed' if l.get('test_passed') else ('Failed' if l.get('test_attempted') else 'Not taken')} | "
        f"Signed: {'Yes' if l.get('signed') else 'No'}"
        for l in logs[:20]
    ])

    prompt = f"""You are a senior technical mentor reviewing {mentee_name}'s learning logs.
Your job is to give an honest, data-grounded diagnostic — not generic encouragement.
Every observation must be tied to something visible in the log data below.

Log data ({total} most recent entries):
{log_summaries}

Computed signals:
- Sign rate: {signed_count}/{total}
- Tests passed: {passed_count}/{total} | Failed: {failed_count}/{total} | Not attempted: {not_attempted}/{total}
- Longest gap between logs: {longest_gap} days | Number of gaps > 2 days: {gap_count}
- Average log word count: {avg_words} words | Recent 5-log average: {recent_avg} words
- Log depth declining (recent logs significantly shorter): {"YES — flag this" if depth_declining else "No"}
- Topic variety: {round(unique_topic_ratio * 100)}% unique topics across all logs — {"LOW — mentee may be stuck or avoiding new areas" if topics_repetitive else "Healthy variety"}

Disengagement signals to actively check for:
TIER 1 (frequency): Gaps > 3 days, zero task completions, low sign rate
TIER 2 (quality): Declining word count, repetitive topics, logs not matching weekly focus
TIER 3 (structural): Same topics week over week, no self-identified questions or blockers

Feed-up / Feed-back / Feed-forward framing:
- "where_they_are_going" = Feed-up: Are their learning topics building toward a coherent goal?
- "how_they_are_going" = Feed-back: What does their actual trajectory — depth, consistency, test results — show?
- "what_mentor_should_do_next" = Feed-forward: Specific actions the mentor should take THIS WEEK

Return ONLY valid JSON with EXACTLY these keys — no extras, no markdown:

{{
  "focus_areas": ["topic1", "topic2", "topic3"],
  "overview": "2-3 sentences on what they have been learning and overall trajectory. Be specific.",
  "recommendations": "2-3 specific actionable recommendations grounded in THIS mentee's data. No generic advice.",
  "activity_pattern": "One honest sentence on logging frequency and consistency.",
  "consistency_signal": "Strong | Moderate | Inconsistent | At Risk",
  "learning_depth_pattern": "Deepening | Broadening | Surface-level | Mixed | Declining",
  "risk_flags": ["flag tied to specific data point", "another flag if present"],
  "strength_signals": ["strength tied to specific data point"],
  "session_agenda": ["agenda item 1 tied to a gap or strength", "item 2", "item 3"],
  "where_they_are_going": "2-3 sentences: are topics coherent? Is there a clear technical direction?",
  "how_they_are_going": "2-3 sentences: honest read of trajectory based on depth, consistency, test results.",
  "what_mentor_should_do_next": "3-4 concrete feed-forward actions the mentor should take this week. Start each with a verb."
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.35,
            max_tokens=1400,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())
    result = _safe_json(text, empty_response)

    result.setdefault("focus_areas", [])
    result.setdefault("overview", "Analysis complete.")
    result.setdefault("recommendations", "Review logs manually.")
    result.setdefault("activity_pattern", "See log data.")
    result.setdefault("consistency_signal", "Unknown")
    result.setdefault("learning_depth_pattern", "Unknown")
    result.setdefault("risk_flags", [])
    result.setdefault("strength_signals", [])
    result.setdefault("session_agenda", [])
    result.setdefault("where_they_are_going", "")
    result.setdefault("how_they_are_going", "")
    result.setdefault("what_mentor_should_do_next", "")

    return result


# ─────────────────────────────────────────────────────────────────────────────
# WEEKLY TASKS GENERATION
# ─────────────────────────────────────────────────────────────────────────────

async def generate_weekly_tasks(
    raw_input: str,
    mentee_name: str,
    mentee_logs: list,
    previous_incomplete: list
) -> dict:
    log_context = ""
    if mentee_logs:
        recent = mentee_logs[:5]
        log_context = (
            f"Recent activity from {mentee_name} (use this to avoid repeating "
            f"what they've already covered and to build on genuine momentum):\n"
            + "\n".join([
                f"- [{l.get('log_date')}] {l.get('structured_title', 'Untitled')} "
                f"— {', '.join(l.get('structured_topics', []))} "
                f"(difficulty: {l.get('difficulty_level', 'unknown')})"
                for l in recent
            ])
        )

    carry_context = ""
    if previous_incomplete:
        carry_context = (
            "\nThese tasks were NOT completed last week — carry them forward "
            "(mark carried_over: true). Don't rewrite them extensively; keep the intent:\n"
            + "\n".join([f"- {t.get('title')}: {t.get('description', '')}" for t in previous_incomplete])
        )

    prompt = f"""You are a technical mentor setting a weekly focus for {mentee_name}.
You wrote a note about what you want them to work on. Turn it into a clean focus plan.

This is NOT a to-do list. Each item is a meaningful area of work or learning the mentee
should make real progress on by end of week. Quality over quantity — 3-5 strong items
is better than 8 shallow ones. Let the mentor's words guide how many items there are.

Use the mentee's recent log context to:
- Avoid assigning something they clearly already covered well
- Build tasks that extend from where they actually are — not where you assumed they'd be
- Spot if they've been avoiding a topic and factor that in

{log_context}
{carry_context}

---
EXAMPLE 1

Mentor input:
"This week I want Tunde to get comfortable with how FastAPI handles authentication.
He should understand JWT, how middleware works, and be able to protect routes properly."

Output:
{{
  "summary": "Get solid on FastAPI authentication — JWT, middleware, and protected routes",
  "tasks": [
    {{
      "title": "Understand JWT authentication flow",
      "description": "Learn how JWTs are issued, signed, and verified. Understand the difference between access and refresh tokens and when each is used.",
      "carried_over": false
    }},
    {{
      "title": "Implement FastAPI middleware for auth",
      "description": "Build and test middleware that intercepts requests and validates Bearer tokens before they hit protected endpoints.",
      "carried_over": false
    }},
    {{
      "title": "Protect routes and handle auth errors cleanly",
      "description": "Apply authentication dependencies to routes. Handle 401 and 403 responses properly with meaningful error messages.",
      "carried_over": false
    }}
  ]
}}

---
EXAMPLE 2

Mentor input:
"Amara should finish the dashboard UI she started. Also wants her to look into how
websockets work since we'll need it next sprint."

Output:
{{
  "summary": "Finish dashboard UI and get a working understanding of WebSockets",
  "tasks": [
    {{
      "title": "Complete the dashboard UI",
      "description": "Finish all incomplete components from last week — charts, filters, and the data table. Make sure it's connected to real API responses.",
      "carried_over": false
    }},
    {{
      "title": "Learn how WebSockets work",
      "description": "Understand the WebSocket protocol, how it differs from HTTP, and when to use it. Build a basic working example — even a simple chat or live counter.",
      "carried_over": false
    }}
  ]
}}

---
Now do the same for this mentor's input.

Mentor's note:
{raw_input}

Return ONLY valid JSON. No markdown. No extra keys. Match the structure exactly:
{{
  "summary": "...",
  "tasks": [
    {{
      "title": "...",
      "description": "...",
      "carried_over": false
    }}
  ]
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())
    return _safe_json(text, {"summary": "Weekly focus set by mentor", "tasks": []})


# ─────────────────────────────────────────────────────────────────────────────
# WEEKLY REVIEW EMAIL PARAGRAPH
# ─────────────────────────────────────────────────────────────────────────────

async def generate_weekly_review(
    mentee_name: str,
    tasks: list,
    week_start: str,
    week_end: str
) -> str:
    total = len(tasks)
    completed = sum(1 for t in tasks if t.get("completed"))
    incomplete = [t for t in tasks if not t.get("completed")]
    completion_rate = round((completed / total * 100) if total > 0 else 0)
    incomplete_titles = ", ".join([t.get("title", "") for t in incomplete[:3]])

    prompt = f"""Write a weekly review paragraph for a mentorship accountability platform.

Mentee: {mentee_name}
Week: {week_start} to {week_end}
Tasks planned: {total}
Tasks completed: {completed} ({completion_rate}%)
{"Incomplete: " + incomplete_titles if incomplete_titles else "All tasks completed!"}

Write 2-3 sentences that are:
- Honest about the completion rate (don't sugarcoat anything below 70%)
- Specific about what carries over if anything
- Forward-looking — end with what they should do about it, not just what happened
- Written as if from a mentor to their mentee

Do not use greetings or sign-offs. Just the paragraph."""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=200,
        )

    response = await asyncio.to_thread(_call)
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────────────────────────────────────
# WEEKLY REVIEW PREVIEW
# ─────────────────────────────────────────────────────────────────────────────

async def generate_review_preview(
    focus: dict,
    tasks: list,
    logs: list
) -> dict:
    total = len(tasks)
    completed = sum(1 for t in tasks if t.get("completed"))
    completion_rate = round((completed / total * 100) if total > 0 else 0)

    tasks_summary = "\n".join([
        f"- [{'DONE' if t['completed'] else 'PENDING'}] {t['title']}"
        + (f" — mentor note: {t['mentor_note']}" if t.get("mentor_note") else "")
        for t in tasks
    ])
    logs_summary = "\n".join([
        f"- {l.get('structured_title', 'Untitled')} "
        f"[{l.get('log_date', '?')}]: "
        f"{(l.get('structured_content') or '')[:200]}"
        for l in logs
    ]) or "No logs submitted this week."

    prompt = f"""You are writing a weekly review that will be sent from a mentor to their mentee.
The mentee will read this. Write for them, not about them.

Week: {focus['week_start']} to {focus['week_end']}
Weekly goal: {focus['summary']}
Completion rate: {completion_rate}% ({completed}/{total} tasks done)

Tasks:
{tasks_summary}

Logs submitted:
{logs_summary}

Write four sections. Each must be a full paragraph — no bullet points, no task titles copied verbatim.

Tone rules:
- "summary": Brief and honest. What actually happened this week in one paragraph.
- "progress": Direct read of the completion rate. Don't sugarcoat below 60%. Don't over-celebrate 100%.
- "recommendations": Feed-forward ONLY. What should the mentee DO next — specific actions, not reflections on the past. Start with a verb. Name concepts or skills explicitly.
- "next_week_focus": Forward-looking direction. What matters most going into next week and why. Ground it in what was incomplete or what momentum exists.

Return ONLY valid JSON with these exact keys:
{{
  "summary": "...",
  "progress": "...",
  "recommendations": "...",
  "next_week_focus": "...",
  "week_label": "{focus['week_start']} – {focus['week_end']}"
}}"""

    fallback = {
        "summary": "Could not generate summary.",
        "progress": "Could not generate progress review.",
        "recommendations": "Could not generate recommendations.",
        "next_week_focus": "Could not generate next week focus.",
        "week_label": f"{focus['week_start']} – {focus['week_end']}"
    }

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.65,
            max_tokens=1000,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())
    return _safe_json(text, fallback)


# ─────────────────────────────────────────────────────────────────────────────
# PROJECT DESCRIPTION RESTRUCTURING
# ─────────────────────────────────────────────────────────────────────────────

async def restructure_project_description(title: str, raw_description: str) -> str:
    if not raw_description or len(raw_description.strip()) < 10:
        return raw_description or title

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{
                "role": "user",
                "content": f"""You are rewriting a project description for a mentorship platform.

Project title: {title}
Original description: {raw_description}

Rewrite this as a clear, structured list of what the mentee is expected to learn or build.
Use specific technical terms. Make it scannable and comparable against daily learning logs.
Keep it under 200 words.

Return ONLY the rewritten description as plain text. No JSON, no headers, no bullet symbols —
just clean sentences separated by newlines."""
            }],
            temperature=0.2,
            max_tokens=300,
        )

    response = await asyncio.to_thread(_call)
    return _clean_json(response.choices[0].message.content.strip())


# ─────────────────────────────────────────────────────────────────────────────
# PROJECT COMPLETION ESTIMATION
# ─────────────────────────────────────────────────────────────────────────────

async def estimate_project_completion(
    project_title: str,
    project_description: str,
    logs: list
) -> dict:
    if not logs:
        return {
            "completion_rate": 0,
            "covered_areas": [],
            "missing_areas": [],
            "assessment": "No logs submitted for this project yet."
        }

    log_summaries = "\n".join([
        f"[{l.get('log_date', '?')}] {l.get('structured_title', 'Untitled')}: "
        f"{', '.join(l.get('structured_topics', []))}"
        for l in logs[:15]
    ])

    prompt = f"""You are evaluating a mentee's progress on a project based on their daily learning logs.

Project: {project_title}
Project scope and expectations:
{project_description}

Mentee's logged work so far:
{log_summaries}

Analyse how much of the project scope the mentee has covered.

Respond with ONLY valid JSON, no markdown:
{{
  "completion_rate": <integer 0-100>,
  "covered_areas": ["area1", "area2"],
  "missing_areas": ["area1", "area2"],
  "assessment": "<2-3 sentence honest assessment of progress>"
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=400,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())

    return _safe_json(text, {
        "completion_rate": 0,
        "covered_areas": [],
        "missing_areas": [],
        "assessment": "Could not generate assessment."
    })


# ─────────────────────────────────────────────────────────────────────────────
# TASK MATCHING
# ─────────────────────────────────────────────────────────────────────────────

async def match_log_to_tasks(
    log_title: str,
    log_topics: list,
    log_content: str,
    tasks: list
) -> list:
    if not tasks:
        return []

    tasks_text = "\n".join([
        f"- ID: {t['id']} | Title: {t['title']} | Category: {t.get('category', '')}"
        for t in tasks
    ])

    prompt = f"""You are matching a mentee's daily log to their weekly tasks.

Log title: {log_title}
Log topics: {', '.join(log_topics)}
Log content: {log_content[:500]}

Weekly tasks:
{tasks_text}

Return the IDs of tasks this log clearly covers. Only include tasks with a strong match.
If none match, return an empty list.

Respond with ONLY valid JSON, no markdown:
{{
  "matched_task_ids": ["id1", "id2"]
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=200,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())
    result = _safe_json(text, {"matched_task_ids": []})
    return result.get("matched_task_ids", [])


# ─────────────────────────────────────────────────────────────────────────────
# ROADMAP EXCEL PARSING
# ─────────────────────────────────────────────────────────────────────────────
FAST_MODEL = "llama-3.1-8b-instant"
async def parse_roadmap_excel(raw_data: list, mentee_name: str) -> dict:
    """
    raw_data: list of dicts from openpyxl — each row from the Excel sheet
    Returns structured roadmap with title, duration_type, units[]
    """
    rows_text = "\n".join([
        f"Row {i+1}: {json.dumps(row)}"
        for i, row in enumerate(raw_data[:120])  # cap at 120 rows
    ])

    prompt = f"""You are parsing a mentorship roadmap uploaded as an Excel sheet for {mentee_name}.

The mentor uploaded rows from a spreadsheet. Each row represents a learning unit (a day or a week).
Your job is to:
1. Detect if this is a daily or weekly roadmap (look at column headers or row patterns)
2. Extract each unit cleanly
3. Return a structured JSON roadmap

Excel rows:
{rows_text}

Rules:
- duration_type must be "daily" or "weekly"
- total_units = number of units you extracted
- Each unit must have: unit_number (int), title (str), goal (str), tasks (list of str), resources (str), links (str)
- tasks should be extracted from any task/activity column — split by comma or newline if multiple
- If a column is missing, use empty string or empty list
- title for each unit should be descriptive, not just "Day 1" — infer from content if possible
- Keep the mentor's original intent — don't rewrite their content, just structure it

Return ONLY valid JSON, no markdown:
{{
  "roadmap_title": "...",
  "duration_type": "daily" or "weekly",
  "total_units": <int>,
  "units": [
    {{
      "unit_number": 1,
      "title": "...",
      "goal": "...",
      "tasks": ["task1", "task2"],
      "resources": "...",
      "links": "..."
    }}
  ]
}}"""

    def _call():
        return client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=4000,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())
    return _safe_json(text, {
        "roadmap_title": "Mentorship Roadmap",
        "duration_type": "daily",
        "total_units": 0,
        "units": []
    })


# ─────────────────────────────────────────────────────────────────────────────
# TASK TEST GENERATION (10 QUESTIONS)
# ─────────────────────────────────────────────────────────────────────────────



async def generate_task_test(task_title: str, task_description: str, unit_goal: str) -> list:
    """
    Generates 10 MCQ questions for a completed roadmap task.
    Returns list of {question, options: [A,B,C,D], answer}
    """
    prompt = f"""You are generating a 10-question multiple choice test for a mentee who just completed a learning task.

Task title: {task_title}
Task description: {task_description}
Unit goal: {unit_goal}

Generate exactly 10 multiple choice questions that test real understanding of this task.
Each question must have 4 options (A, B, C, D) and one correct answer.

Rules:
- Questions must test understanding, not just recall
- Mix difficulty: 3 easy, 4 medium, 3 hard
- Options must be plausible — wrong answers should not be obviously silly
- Answer must be exactly "A", "B", "C", or "D"
- Cover different aspects of the task across the 10 questions

Return ONLY valid JSON, no markdown:
{{
  "questions": [
    {{
      "question": "...",
      "options": {{
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      }},
      "answer": "A"
    }}
  ]
}}"""

    def _call():
        return client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=2000,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())
    result = _safe_json(text, {"questions": []})
    return result.get("questions", [])


# ─────────────────────────────────────────────────────────────────────────────
# ROADMAP DELAY ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────

async def analyze_roadmap_delay(
    mentee_name: str,
    unit_title: str,
    unit_number: int,
    days_behind: int,
    tasks_incomplete: list
) -> str:
    """Short in-app notification message for mentor when mentee is behind."""
    prompt = f"""Write a short in-app alert for a mentor.

Their mentee {mentee_name} is {days_behind} day(s) behind on Unit {unit_number}: "{unit_title}".
Incomplete tasks: {', '.join(tasks_incomplete[:3]) if tasks_incomplete else 'multiple tasks'}

Write ONE sentence that:
- States the delay clearly with the unit name
- Is direct but not alarming
- Ends with a simple suggested action (check in, review, etc.)
- Under 25 words

Return plain text only, no JSON, no quotes."""

    def _call():
        return client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=60,
        )

    response = await asyncio.to_thread(_call)
    return response.choices[0].message.content.strip()


# # ─────────────────────────────────────────────────────────────────────────────
# # REMINDER EMAIL GENERATION
# # ─────────────────────────────────────────────────────────────────────────────

# async def generate_reminder_message(
#     name: str,
#     slot: str,
#     day_of_week: str,
# ) -> dict:
#     slot_context = {
#         "morning": (
#             f"Write a warm, energetic good morning message for {name}. "
#             f"Today is {day_of_week}. Tell them good morning by name, mention the day, "
#             f"hype them up to accomplish great things today. Add a smiling emoji naturally. "
#             f"End with a line: 'Dôti cares about your mental health 💜' "
#             f"Keep it under 3 sentences. Sound human and warm, not corporate."
#         ),
#         "evening": (
#             f"Write a casual evening nudge for {name}. "
#             f"The day is almost over. Remind them to log today's activity before they sleep. "
#             f"Start with 'Hey hey' — keep it breezy and friendly. "
#             f"Under 2 sentences. No emojis except one at the end."
#         ),
#         "mentor": (
#             f"Write a friendly reminder for a mentor named {name}. "
#             f"Remind them their mentees need them — specifically to check and sign pending logs. "
#             f"Tell them to stay alert and available. Start with 'Hi there'. "
#             f"Under 2 sentences. Keep it warm but professional."
#         ),
#     }

#     context = slot_context.get(slot, slot_context["morning"])

#     def _call():
#         return Groq(api_key=settings.groq_api_key).chat.completions.create(
#             model="llama-3.1-8b-instant",
#             messages=[{
#                 "role": "user",
#                 "content": f"""{context}

# Return ONLY valid JSON, no markdown:
# {{
#   "subject": "<short email subject line>",
#   "body": "<the message body>"
# }}"""
#             }],
#             temperature=0.85,
#             max_tokens=200,
#         )

#     response = await asyncio.to_thread(_call)
#     text = _clean_json(response.choices[0].message.content.strip())

#     slot_defaults = {
#         "morning": {
#             "subject": f"Good morning {name} 😊 — {day_of_week} starts now",
#             "body": f"Good morning {name}! Today is {day_of_week} — let's make it count. Dôti cares about your mental health 💜"
#         },
#         "evening": {
#             "subject": f"Hey hey {name} — don't forget to log today",
#             "body": f"Hey hey {name}, the day is almost over — don't forget to log your activity before you sleep! 🌙"
#         },
#         "mentor": {
#             "subject": f"Hi {name} — your mentees need you",
#             "body": f"Hi there {name}, your mentees are counting on you — check for any unsigned logs and stay on high alert 📋"
#         },
#     }

#     return _safe_json(text, slot_defaults.get(slot, slot_defaults["morning"]))
