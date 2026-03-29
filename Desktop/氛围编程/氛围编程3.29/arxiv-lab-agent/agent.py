import json
import anthropic
from pathlib import Path

from tools import TOOLS, TOOL_DESCRIPTIONS
from prompts.system_prompt import SYSTEM_PROMPT
from utils.logger import log, log_agent_thought, log_tool_call, log_error

MODEL = "claude-haiku-4-5"

class Agent:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.tools = TOOLS
        self.state = {
            "messages": [],
            "context": {},
            "iterations": 0,
            "last_error": None,
            "retry_count": 0,
        }

    def _build_prompt(self) -> str:
        tool_desc_lines = [f"- {k}: {v}" for k, v in TOOL_DESCRIPTIONS.items()]
        tool_descriptions = "\n".join(tool_desc_lines)

        prompt = SYSTEM_PROMPT.format(tool_descriptions=tool_descriptions)

        if self.state["last_error"]:
            prompt += f"\n\n## Previous Error (for self-correction)\n{self.state['last_error']}\n"

        if self.state["context"].get("arxiv_results"):
            prompt += "\n\n## ArXiv Search Results\n"
            for p in self.state["context"]["arxiv_results"][:5]:
                prompt += f"- **{p['title']}** ({p['published_date'][:10]})\n"
                prompt += f"  Authors: {', '.join(p['authors'][:3])}\n"
                prompt += f"  Summary: {p['summary'][:300]}...\n\n"

        if self.state["context"].get("file_preview"):
            prompt += f"\n## File Preview\n{self.state['context']['file_preview']}\n"

        prompt += "\n\n## Conversation History\n"
        for m in self.state["messages"][-5:]:
            prompt += f"{m['role']}: {m['content'][:500]}\n"

        return prompt

    def reason(self, user_input: str) -> dict:
        self.state["messages"].append({"role": "user", "content": user_input})

        prompt = self._build_prompt()

        response = self.client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=prompt,
            messages=[{"role": "user", "content": user_input}],
        )

        raw = response.content[0].text.strip()
        log_agent_thought(raw)

        try:
            decision = json.loads(raw)
        except json.JSONDecodeError:
            decision = {"thought": raw, "action": "final_answer", "action_input": {"answer": raw}}

        return decision

    def run(self):
        print("=" * 60)
        print("ArXiv-Lab Agent 就绪 (输入 q 退出)")
        print("=" * 60)

        while True:
            try:
                user_input = input("\n> ")
            except EOFError:
                break

            if user_input.strip().lower() in ("q", "quit", "exit"):
                print("再见!")
                break

            if not user_input.strip():
                continue

            self.state["iterations"] += 1
            self.state["retry_count"] = 0
            self.state["last_error"] = None

            answer = None
            max_loops = 10

            while self.state["iterations"] <= max_loops:
                decision = self.reason(user_input if self.state["iterations"] == 1 else "continue")

                thought = decision.get("thought", "")
                action = decision.get("action", "final_answer")
                action_input = decision.get("action_input", {})

                if action == "final_answer":
                    answer = action_input.get("answer", action_input.get("text", str(action_input)))
                    break

                if action not in self.tools:
                    log_error(f"Unknown tool: {action}")
                    answer = f"错误: 未知工具 '{action}'"
                    break

                log_tool_call(action, action_input)
                tool_fn = self.tools[action]

                try:
                    result = tool_fn(**action_input)
                except Exception as e:
                    result = {"error": str(e), "success": False}

                if action == "search_arxiv":
                    self.state["context"]["arxiv_results"] = result

                if not isinstance(result, dict):
                    result = {"result": result}

                result_str = json.dumps(result, ensure_ascii=False, indent=2)[:2000]
                self.state["messages"].append({
                    "role": "user",
                    "content": f"Tool result: {result_str}"
                })

                if not result.get("success", True) and action == "execute_python_code":
                    error_msg = result.get("stderr", result.get("error", "Unknown error"))
                    self.state["last_error"] = error_msg
                    self.state["retry_count"] += 1
                    log_error(f"Retry {self.state['retry_count']}/3: {error_msg[:200]}")
                    if self.state["retry_count"] >= 3:
                        answer = f"代码执行失败（已达最大重试次数）:\n{error_msg}"
                        break
                    continue

                if result.get("success", True) is False and result.get("stderr"):
                    self.state["last_error"] = result["stderr"]

                self.state["iterations"] += 1

            print(f"\n{answer or '处理完成'}\n")

def main():
    agent = Agent()
    agent.run()

if __name__ == "__main__":
    main()