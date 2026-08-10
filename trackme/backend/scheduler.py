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