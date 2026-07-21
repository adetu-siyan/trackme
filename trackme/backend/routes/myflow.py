from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from groq import Groq
from config import settings
import json

router = APIRouter(prefix="/api/myflow", tags=["myflow"])
client = Groq(api_key=settings.groq_api_key)

class StructureTasksRequest(BaseModel):
    input: str
    with_time: bool = False

@router.post("/structure")
async def structure_tasks(body: StructureTasksRequest):
    time_instruction = (
        "Provide realistic HH:MM – HH:MM time slots assuming a 9am–6pm workday."
        if body.with_time
        else "Set suggestedTime to null for all tasks."
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a task structuring assistant. Return ONLY a valid JSON array. No markdown, no explanation, no preamble."
            },
            {
                "role": "user",
                "content": f"""Structure these tasks: "{body.input}". {time_instruction}
Return this exact shape:
[{{ "title": "string", "subtasks": ["string"], "priority": "high|medium|low", "suggestedTime": "string or null" }}]"""
            }
        ],
        temperature=0.3,
        max_tokens=1000,
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()

    try:
        parsed = json.loads(text)
        return {"tasks": parsed}
    except json.JSONDecodeError:
        return {"tasks": [], "error": "Could not parse tasks"}