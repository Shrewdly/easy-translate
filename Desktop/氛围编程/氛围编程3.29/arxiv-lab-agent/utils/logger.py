# utils/logger.py
import json
from pathlib import Path
from datetime import datetime

LOG_FILE = Path(__file__).parent.parent / "output" / "agent.log"
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

def log(level: str, msg: str):
    ts = datetime.now().isoformat(timespec="seconds")
    line = f"[{ts}] [{level.upper()}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def log_agent_thought(thought: str):
    log("AGENT", f"THOUGHT: {thought}")

def log_tool_call(tool: str, inp: dict):
    log("TOOL", f"CALL: {tool}({json.dumps(inp, ensure_ascii=False)[:200]})")

def log_error(error: str):
    log("ERROR", error)