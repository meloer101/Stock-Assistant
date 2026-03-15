from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator

from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions

logger = logging.getLogger(__name__)


class EscalationChecker(BaseAgent):
    """Checks the research evaluation result and stops the loop when quality is sufficient.

    Reads `research_evaluation` from session state. If the evaluation contains
    grade == "pass", emits an escalation event to break out of the LoopAgent.
    Otherwise, yields a no-op event so the loop continues to the next iteration.
    """

    def __init__(self) -> None:
        super().__init__(name="escalation_checker")

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        raw = ctx.session.state.get("research_evaluation", "")

        grade = "fail"
        if isinstance(raw, str):
            try:
                parsed = json.loads(raw)
                grade = parsed.get("grade", "fail")
            except (json.JSONDecodeError, AttributeError):
                if "pass" in raw.lower():
                    grade = "pass"
        elif isinstance(raw, dict):
            grade = raw.get("grade", "fail")

        if grade == "pass":
            logger.info("[%s] Research passed. Escalating to stop loop.", self.name)
            yield Event(
                author=self.name,
                actions=EventActions(escalate=True),
            )
        else:
            logger.info("[%s] Research needs more work. Continuing loop.", self.name)
            yield Event(author=self.name)


escalation_checker = EscalationChecker()
