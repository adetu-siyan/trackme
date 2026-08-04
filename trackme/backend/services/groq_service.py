import json
import re
import asyncio
import hashlib
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

    # Keyword-based fallback
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

async def generate_verification_question(
    structured_content: str,
    difficulty: str
) -> dict:
    difficulty_guide = {
        "beginner": (
            "Test whether the mentee understood the core idea well enough to explain "
            "it simply. Ground it in an everyday or entry-level work context. "
            "Avoid jargon-heavy questions."
        ),
        "intermediate": (
            "Test whether the mentee understands HOW or WHY something works — not "
            "just what it is. They should need to reason through a mechanism, a "
            "decision, or a cause-and-effect. Make it specific to the exact tool or "
            "concept in the log."
        ),
        "advanced": (
            "Test system-level reasoning, trade-off analysis, or architectural "
            "decision-making. The mentee should need to weigh options, consider "
            "constraints, or defend a design choice. Avoid questions with a single "
            "obvious answer."
        ),
    }

    frames = [
        {
            "label": "TROUBLESHOOTING",
            "instruction": "Something broke. Build a realistic incident scenario and ask the mentee to diagnose or fix it using knowledge from the log.",
            "opening": "Start after the problem has already happened — not a hypothetical."
        },
        {
            "label": "PEER EXPLANATION",
            "instruction": "A colleague or junior team member is confused. Ask the mentee to explain the concept clearly using an analogy or example.",
            "opening": "Make the asker specific — intern, PM, new hire."
        },
        {
            "label": "DECISION UNDER CONSTRAINT",
            "instruction": "Two options exist. Build a scenario with real constraints and ask the mentee to choose and justify.",
            "opening": "Start mid-decision — the team is already leaning one way."
        },
        {
            "label": "POST-MORTEM",
            "instruction": "Something went wrong after a decision was made. Ask the mentee to identify the root cause and how today's concept would have prevented it.",
            "opening": "Start after the failure — focus on the why, not the what."
        },
        {
            "label": "PLANNING AHEAD",
            "instruction": "A project is about to start. Ask the mentee to recommend an approach, anticipate a risk, or structure a plan using what they learned.",
            "opening": "Start before any code or decision has been made."
        },
    ]

    frame_index = int(
        hashlib.md5(structured_content[:300].encode()).hexdigest(), 16
    ) % len(frames)
    frame = frames[frame_index]
    guide = difficulty_guide.get(difficulty, difficulty_guide["intermediate"])

    prompt = f"""You are a sharp, friendly senior mentor reviewing your mentee's daily log.
You've just read what they studied and you want to test their understanding — but in a natural,
conversational way. Not like an exam. Like a mentor who's genuinely curious if they actually got it.

The mentee studied this today:
---
{structured_content}
---

Your question must follow this EXACT structure with line breaks between each part:

Line 1 — Genuine reaction (1 sentence):
Acknowledge something SPECIFIC they studied. Sound like you actually read it.
Example: "Oh nice, you got into Docker networking today — that's where things start clicking."
Example: "GNNs for fraud detection, solid pick — that's still very much production-relevant."

[BLANK LINE]

Line 2 — Casual bridge (1 sentence):
Signal you're about to test them but keep it light and natural.
Example: "Anyway, I've got one for you —"
Example: "Let me throw something at you though —"
Example: "Before you close the tab, picture this —"

[BLANK LINE]

Lines 3-4 — Grounded scenario + question:
Place them inside a real vivid context. Use a specific company or company type
(Google, Paystack, a Lagos fintech startup, a mid-size logistics company).
Put them in a role. Then ask ONE sharp question that requires real understanding.
Example: "You're a backend engineer at a Nigerian neobank — their fraud pipeline just
flagged 3x the usual transactions after a schema change upstream. The team is pointing
fingers at the model. What would you check first, and why?"

Difficulty: {difficulty.upper()}
What to test: {guide}
Question frame: {frame["label"]}
Frame instruction: {frame["instruction"]}

Hard rules:
- Never start with "What is", "Define", or "Explain what"
- Never include the answer or hints
- The reaction MUST reference something specific from the log — no generic praise
- Sound like a person texting a mentee, not writing an exam paper
- Keep the whole thing under 6 sentences total

Return ONLY valid JSON, no markdown.
The "question" field must preserve line breaks using \\n\\n between each part:
{{
  "question": "reaction sentence\\n\\nbridge sentence\\n\\nscenario + question",
  "correct_answer": "<accurate concise answer drawn from the log>"
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.85,
            top_p=0.95,
            max_tokens=400,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())

    return _safe_json(text, {
        "question": "Interesting log today.\n\nLet me throw one at you —\n\nA junior developer on your team asks you to walk them through the most important concept from your study session using a real example. How would you explain it?",
        "correct_answer": "Open-ended explanation based on log content."
    })


# ─────────────────────────────────────────────────────────────────────────────
# ANSWER EVALUATION
# ─────────────────────────────────────────────────────────────────────────────

async def evaluate_answer(
    question: str,
    correct_answer: str,
    user_answer: str,
    difficulty: str
) -> dict:
    prompt = f"""You are a fair and encouraging technical mentor evaluating a mentee's answer.

Question: {question}
Reference answer: {correct_answer}
Mentee's answer: {user_answer}
Difficulty level: {difficulty}

Evaluate whether the mentee demonstrated sufficient understanding.
- beginner: core concept right (>60%)
- intermediate: clear explanation (>70%)
- advanced: depth and accuracy (>75%)

Be encouraging. If they failed, hint at what they missed without giving the full answer.

Respond with ONLY valid JSON, no markdown:
{{
  "passed": true or false,
  "score": 0-100,
  "feedback": "Your encouraging specific feedback here..."
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())

    return _safe_json(text, {
        "passed": False,
        "score": 0,
        "feedback": "Could not evaluate your answer. Please try again."
    })


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

    log_summaries = "\n".join([
        f"[{l.get('log_date', '?')}] "
        f"{l.get('structured_title', 'Untitled')} | "
        f"Topics: {', '.join(l.get('structured_topics', []))} | "
        f"Difficulty: {l.get('difficulty_level', 'unknown')} | "
        f"Test: {'Passed' if l.get('test_passed') else ('Failed' if l.get('test_attempted') else 'Not taken')} | "
        f"Signed: {'Yes' if l.get('signed') else 'No'}"
        for l in logs[:20]
    ])

    prompt = f"""You are a senior technical mentor reviewing {mentee_name}'s learning logs.

Log data ({total} most recent entries):
{log_summaries}

Stats:
- Sign rate: {signed_count}/{total}
- Tests passed: {passed_count}/{total}
- Tests failed: {failed_count}/{total}
- Longest gap between logs: {longest_gap} days

Generate a mentor diagnostic. Be honest, specific, and grounded in the data.
Do not give generic advice. Every recommendation must be tied to something visible in the logs.

Return ONLY valid JSON with EXACTLY these keys — no extras, no markdown:

{{
  "focus_areas": ["topic1", "topic2", "topic3"],
  "overview": "2-3 sentences summarising what they have been learning and their overall trajectory",
  "recommendations": "2-3 specific actionable recommendations grounded in this mentee's data",
  "activity_pattern": "One sentence describing their logging frequency and consistency pattern",
  "consistency_signal": "Strong | Moderate | Inconsistent | At Risk",
  "learning_depth_pattern": "Deepening | Broadening | Surface-level | Mixed",
  "risk_flags": ["risk1", "risk2"],
  "strength_signals": ["strength1", "strength2"],
  "session_agenda": ["agenda item 1", "agenda item 2", "agenda item 3"],
  "where_they_are_going": "2-3 sentences on whether topics build toward a coherent technical direction",
  "how_they_are_going": "2-3 sentences on actual trajectory — difficulty progression and test results",
  "what_mentor_should_do_next": "3-4 concrete actions the mentor should take this week"
}}"""

    def _call():
        return client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.35,
            max_tokens=1200,
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
        log_context = "Recent logs from mentee:\n" + "\n".join([
            f"- [{l.get('log_date')}] {l.get('structured_title', 'Untitled')} "
            f"— {', '.join(l.get('structured_topics', []))}"
            for l in mentee_logs[:5]
        ])

    carry_context = ""
    if previous_incomplete:
        carry_context = (
            "\nCarry these over from last week (mark carried_over: true):\n"
            + "\n".join([f"- {t.get('title')}" for t in previous_incomplete])
        )

    prompt = f"""You are a technical mentor. Your mentee is {mentee_name}.
You have written a note about what you want them to focus on this week.
Your job is to turn that note into a clean weekly focus — a summary and a list of focus areas.

This is NOT a to-do list. Each item is a meaningful area of work or learning the mentee 
should make real progress on by end of week. Let the mentor's words guide how many items 
there are — don't pad, don't invent.

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
EXAMPLE 3

Mentor input:
"Keep pushing on the GNN implementation. Still needs to finish training loop and evaluation."

Output:
{{
  "summary": "Push the GNN implementation forward — training loop and evaluation",
  "tasks": [
    {{
      "title": "Complete the GNN training loop",
      "description": "Implement the full training cycle — forward pass, loss computation, backprop, and optimizer step. Run it on the dataset and confirm loss is decreasing.",
      "carried_over": true
    }},
    {{
      "title": "Build the model evaluation pipeline",
      "description": "Add evaluation logic — accuracy, F1, or AUC depending on the task. Run on a validation split and log the results clearly.",
      "carried_over": true
    }}
  ]
}}

---
Now do the same for this mentor's input.

Mentor's note:
{raw_input}

{log_context}
{carry_context}

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
- Honest about the completion rate (don't sugarcoat low rates)
- Specific about what carries over if anything
- Encouraging without being generic
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
    tasks_summary = "\n".join([
        f"- [{'DONE' if t['completed'] else 'PENDING'}] {t['title']} ({t['category']})"
        for t in tasks
    ])
    logs_summary = "\n".join([
        f"- {l.get('structured_title', 'Untitled')}: "
        f"{(l.get('structured_content') or '')[:200]}"
        for l in logs
    ]) or "No logs submitted this week."

    prompt = f"""You are reviewing a mentee's week for their mentor.

Week: {focus['week_start']} to {focus['week_end']}
Weekly goal: {focus['summary']}

Tasks:
{tasks_summary}

Logs submitted this week:
{logs_summary}

Write a weekly review with four sections. Each section must be a full paragraph of
prose — no bullet points, no lists, no task titles repeated verbatim.

Return ONLY valid JSON with these exact keys:
{{
  "summary": "A paragraph summarising what the mentee accomplished this week overall",
  "progress": "A paragraph on their task completion rate and what it reflects about their effort",
  "recommendations": "A paragraph with specific actionable advice based on what was pending or missed",
  "next_week_focus": "A paragraph previewing what they should prioritise next week",
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
            temperature=0.7,
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
# REMINDER EMAIL GENERATION
# ─────────────────────────────────────────────────────────────────────────────

async def generate_reminder_message(
    name: str,
    slot: str,  # 'morning' | 'evening' | 'mentor'
    day_of_week: str,
) -> dict:
    slot_context = {
        "morning": (
            f"Write a warm, energetic good morning message for {name}. "
            f"Today is {day_of_week}. Tell them good morning by name, mention the day, "
            f"hype them up to accomplish great things today. Add a smiling emoji naturally. "
            f"End with a line: 'Dôti cares about your mental health 💜' "
            f"Keep it under 3 sentences. Sound human and warm, not corporate."
        ),
        "evening": (
            f"Write a casual evening nudge for {name}. "
            f"The day is almost over. Remind them to log today's activity before they sleep. "
            f"Start with 'Hey hey' — keep it breezy and friendly. "
            f"Under 2 sentences. No emojis except one at the end."
        ),
        "mentor": (
            f"Write a friendly reminder for a mentor named {name}. "
            f"Remind them their mentees need them — specifically to check and sign pending logs. "
            f"Tell them to stay alert and available. Start with 'Hi there'. "
            f"Under 2 sentences. Keep it warm but professional."
        ),
    }

    context = slot_context.get(slot, slot_context["morning"])

    def _call():
        return Groq(api_key=settings.groq_api_key).chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{
                "role": "user",
                "content": f"""{context}

Return ONLY valid JSON, no markdown:
{{
  "subject": "<short email subject line>",
  "body": "<the message body>"
}}"""
            }],
            temperature=0.85,
            max_tokens=200,
        )

    response = await asyncio.to_thread(_call)
    text = _clean_json(response.choices[0].message.content.strip())

    slot_defaults = {
        "morning": {
            "subject": f"Good morning {name} 😊 — {day_of_week} starts now",
            "body": f"Good morning {name}! Today is {day_of_week} — let's make it count. Dôti cares about your mental health 💜"
        },
        "evening": {
            "subject": f"Hey hey {name} — don't forget to log today",
            "body": f"Hey hey {name}, the day is almost over — don't forget to log your activity before you sleep! 🌙"
        },
        "mentor": {
            "subject": f"Hi {name} — your mentees need you",
            "body": f"Hi there {name}, your mentees are counting on you — check for any unsigned logs and stay on high alert 📋"
        },
    }

    return _safe_json(text, slot_defaults.get(slot, slot_defaults["morning"]))