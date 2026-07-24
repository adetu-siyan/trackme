import json
import re
from groq import Groq
from config import settings

client = Groq(api_key=settings.groq_api_key)
MODEL = "llama-3.3-70b-versatile"


def get_groq_client():
    """Returns the module-level Groq client for use in routes."""
    return client


def _clean_json(text: str) -> str:
    """Strip markdown fences and thinking tags from LLM output."""
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return text


async def restructure_log(raw_content: str) -> dict:
    prompt = f"""You are a learning log assistant for a tech mentorship platform.

A mentee has written their daily learning log below. Your job is to:
1. Give it a clear, professional title (e.g. "Introduction to Docker Containers")
2. Extract 3-6 key topics as short tags (e.g. ["Docker", "Containers", "Port Mapping"])
3. Rewrite the content as a structured professional log — MAXIMUM 700 characters total for structured_content

Rules:
- Keep the meaning and substance of what the mentee wrote
- Use professional language without losing their voice
- Structure: What I Learned, Key Concepts, Challenges, Next Steps
- structured_content MUST be under 700 characters — be concise, capture only key points
- Do not pad or repeat information

Respond with ONLY valid JSON, no markdown:
{{
  "title": "...",
  "topics": ["...", "..."],
  "structured_content": "..."
}}

Raw log:
{raw_content}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800,
    )

    text = _clean_json(response.choices[0].message.content.strip())

    try:
        result = json.loads(text)
        if len(result.get("structured_content", "")) > 700:
            result["structured_content"] = result["structured_content"][:697] + "..."
        return result
    except json.JSONDecodeError:
        return {
            "title": "Daily Learning Log",
            "topics": ["General Learning"],
            "structured_content": raw_content[:700]
        }


async def detect_difficulty(structured_content: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{
            "role": "user",
            "content": f"""Read this learning log and respond with ONE word only: beginner, intermediate, or advanced.

Rules:
- beginner: surface-level concepts, definitions, first exposure
- intermediate: understands how things work, can explain why
- advanced: deep implementation detail, edge cases, system design thinking

Log:
{structured_content[:1000]}

One word:"""
        }],
        temperature=0.1,
        max_tokens=5,
    )
    result = _clean_json(response.choices[0].message.content.strip()).lower()
    if result not in ['beginner', 'intermediate', 'advanced']:
        return 'intermediate'
    return result


async def generate_verification_question(
    structured_content: str,
    difficulty: str
) -> dict:
    difficulty_guide = {
        "beginner": (
            "Create a simple real-world scenario that a beginner would relate to. "
            "The question should test basic understanding of one core concept from the log. "
            "Example style: 'A small business owner wants to X. They are told Y is the solution. "
            "Question: What is Y and why does it solve their problem?'"
        ),
        "intermediate": (
            "Create a workplace or technical scenario that tests genuine understanding. "
            "The question should require the mentee to explain HOW something works or WHY "
            "a specific choice is made. Not just what it is. "
            "Example style: 'A developer at a startup notices X happening in their system. "
            "Question: What is causing this and how would you fix it using [concept from log]?'"
        ),
        "advanced": (
            "Create a complex system design or decision-making scenario. "
            "The question should test trade-off analysis, implementation decisions, or "
            "comparisons between approaches. "
            "Example style: 'A company is choosing between X and Y for their Z use case. "
            "They have constraints A and B. Question: Which would you recommend and why, "
            "considering the trade-offs?'"
        ),
    }

    guide = difficulty_guide.get(difficulty, difficulty_guide["intermediate"])

    prompt = f"""You are a senior technical interviewer creating a certification-level practice question.

Study this learning log carefully:
{structured_content}

Your task:
1. Identify the SINGLE most important concept or technology from this log
2. Build a SHORT, realistic real-world scenario around it (2-3 sentences max)
3. Ask ONE sharp, focused question that tests genuine understanding

Difficulty level: {difficulty.upper()}
{guide}

Critical rules:
- The scenario must feel real — use company names, roles, business contexts
- The question must be directly answerable from the log content
- Do NOT ask trivia or definition questions like "What is X?" — ask situational questions
- The correct answer should be 3-5 sentences, specific and technical
- Keep the scenario SHORT — the question does the heavy lifting

Respond with ONLY valid JSON, no markdown:
{{
  "question": "Scenario: [2-3 sentence real context]. Question: [sharp focused question]?",
  "correct_answer": "[specific technical answer drawing from the log content]"
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=600,
    )

    text = _clean_json(response.choices[0].message.content.strip())

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "question": "Scenario: A junior developer joins your team and asks about the main concept you studied today. Question: How would you explain it using a real example?",
            "correct_answer": "Open-ended explanation based on log content."
        }


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

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=300,
    )

    text = _clean_json(response.choices[0].message.content.strip())

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "passed": False,
            "score": 0,
            "feedback": "Could not evaluate your answer. Please try again."
        }


async def summarise_mentee_logs(logs: list, mentee_name: str) -> dict:
    if not logs:
        return {
            "focus_areas": [],
            "overview": "No logs available yet.",
            "recommendations": "Encourage your mentee to start logging daily.",
            "activity_pattern": "No data"
        }

    log_summaries = []
    for log in logs[:20]:
        log_summaries.append(
            f"[{log.get('log_date', 'unknown date')}] "
            f"{log.get('structured_title', 'Untitled')} — "
            f"Topics: {', '.join(log.get('structured_topics', []))} — "
            f"Signed: {'Yes' if log.get('signed') else 'No'}"
        )

    logs_text = "\n".join(log_summaries)

    prompt = f"""You are an experienced mentor reviewing your mentee {mentee_name}'s learning history.

Here are their recent daily logs:
{logs_text}

Analyse this data and provide:
1. focus_areas: List of 3-5 topics/areas they've been concentrating on most
2. overview: 2-3 sentence summary of what they've been learning and their progress pattern
3. recommendations: 2-3 specific, actionable recommendations for you as their mentor
4. activity_pattern: One sentence describing when and how consistently they log

Respond with ONLY valid JSON, no markdown:
{{
  "focus_areas": ["...", "..."],
  "overview": "...",
  "recommendations": "...",
  "activity_pattern": "..."
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=600,
    )

    text = _clean_json(response.choices[0].message.content.strip())

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "focus_areas": [],
            "overview": "Could not generate overview.",
            "recommendations": "Review logs manually.",
            "activity_pattern": "Unknown"
        }


async def generate_weekly_tasks(
    raw_input: str,
    mentee_name: str,
    mentee_logs: list,
    previous_incomplete: list
) -> dict:
    log_context = ""
    if mentee_logs:
        recent = mentee_logs[:5]
        log_context = "Recent activity from mentee's logs:\n" + "\n".join([
            f"- [{l.get('log_date')}] {l.get('structured_title', 'Untitled')} — Topics: {', '.join(l.get('structured_topics', []))}"
            for l in recent
        ])

    carry_context = ""
    if previous_incomplete:
        carry_context = "\nIncomplete tasks from last week (carry these over as high priority):\n" + "\n".join([
            f"- {t.get('title')} [{t.get('category', '')}]"
            for t in previous_incomplete
        ])

    prompt = f"""You are an experienced technical mentor creating a weekly learning plan.

Mentor's weekly focus for {mentee_name}:
{raw_input}

{log_context}
{carry_context}

Your job:
1. Write a one-line summary of this week's focus (max 100 chars)
2. Break the focus into 5-8 specific, actionable tasks
3. Assign each task a category (Backend, Frontend, Database, AI/ML, DevOps, Reading, Writing, Other)
4. Suggest a time block for each task (e.g. "Monday morning", "Tuesday 2-4PM")
5. Set priority (1=highest, 5=lowest)
6. Mark carried_over=true for any task derived from incomplete previous week items

Rules:
- Tasks must be concrete and completable in 1-3 hours
- If there are carried-over items, place them at priority 1
- Be realistic — don't overload the week
- Categories should be short single words or short phrases

Respond with ONLY valid JSON, no markdown:
{{
  "summary": "...",
  "tasks": [
    {{
      "title": "...",
      "description": "...",
      "category": "...",
      "suggested_time": "...",
      "priority": 1,
      "carried_over": false
    }}
  ]
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=1500,
    )

    text = _clean_json(response.choices[0].message.content.strip())

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "summary": "Weekly focus plan",
            "tasks": []
        }


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

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=200,
    )

    return response.choices[0].message.content.strip()


async def generate_review_preview(
    focus: dict,
    tasks: list,
    logs: list
) -> dict:
    """
    Generates the four-paragraph weekly review for mentor preview.
    Called before send — mentor sees and approves first.
    Returns: { summary, progress, recommendations, next_week_focus, week_label }
    """
    tasks_summary = "\n".join([
        f"- [{'DONE' if t['completed'] else 'PENDING'}] {t['title']} ({t['category']})"
        for t in tasks
    ])
    logs_summary = "\n".join([
        f"- {l.get('structured_title', 'Untitled')}: {(l.get('structured_content') or '')[:200]}"
        for l in logs
    ]) or "No logs submitted this week."

    prompt = f"""You are reviewing a mentee's week for their mentor.

Week: {focus['week_start']} to {focus['week_end']}
Weekly goal: {focus['summary']}

Tasks:
{tasks_summary}

Logs submitted this week:
{logs_summary}

Write a weekly review for the mentee with these four sections. Each section must be a full paragraph of prose — no bullet points, no lists, no task titles repeated verbatim.

Return ONLY valid JSON with these exact keys:
{{
  "summary": "A paragraph summarising what the mentee accomplished this week overall",
  "progress": "A paragraph on their task completion rate and what it reflects about their effort and consistency",
  "recommendations": "A paragraph with specific, actionable advice for next week based on what was pending or missed",
  "next_week_focus": "A paragraph previewing what they should prioritise going into next week",
  "week_label": "{focus['week_start']} – {focus['week_end']}"
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1000,
    )

    text = _clean_json(response.choices[0].message.content.strip())

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "summary": "Could not generate summary.",
            "progress": "Could not generate progress review.",
            "recommendations": "Could not generate recommendations.",
            "next_week_focus": "Could not generate next week focus.",
            "week_label": f"{focus['week_start']} – {focus['week_end']}"
        }


async def restructure_project_description(title: str, raw_description: str) -> str:
    if not raw_description or len(raw_description.strip()) < 10:
        return raw_description or title

    response = client.chat.completions.create(
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

    result = _clean_json(response.choices[0].message.content.strip())
    return result


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

Analyse how much of the project scope the mentee has covered based on their logs.

Respond with ONLY valid JSON, no markdown:
{{
  "completion_rate": <integer 0-100>,
  "covered_areas": ["area1", "area2"],
  "missing_areas": ["area1", "area2"],
  "assessment": "<2-3 sentence honest assessment of progress>"
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=400,
    )

    text = _clean_json(response.choices[0].message.content.strip())

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "completion_rate": 0,
            "covered_areas": [],
            "missing_areas": [],
            "assessment": "Could not generate assessment."
        }