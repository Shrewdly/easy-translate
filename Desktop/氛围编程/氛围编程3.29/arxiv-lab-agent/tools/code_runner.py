import subprocess
import shutil
import re
from pathlib import Path
from typing import List, Dict, Optional

OUTPUT_DIR = Path(__file__).parent.parent / "output" / "figures"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def _find_generated_figures(stdout: str, stderr: str) -> List[str]:
    """Detect figure paths that were saved by the user's code."""
    combined = stdout + stderr
    patterns = [
        r"Figure saved to: (.+\.png)",
        r"Saved figure: (.+\.png)",
        r"Figure path: (.+\.png)",
        r"(\S+\.png)",
        r"(\S+\.pdf)",
    ]
    found = []
    for p in patterns:
        found.extend(re.findall(p, combined))
    result = []
    for f in found:
        path = Path(f)
        if path.exists() and path.parent == OUTPUT_DIR:
            result.append(str(path))
    return result

def execute_python_code(code: str, data_path: Optional[str] = None) -> Dict:
    """
    Execute Python code via subprocess.

    Args:
        code: Python code string to execute
        data_path: Optional path to data file

    Returns:
        Dict with:
        - success: bool
        - stdout: str
        - stderr: str
        - figures: List[str] of generated figure paths
    """
    prefix = ""
    if data_path:
        prefix = f"""
import sys
data_path = '{data_path.replace("'", "\\'")}'
"""
    full_code = prefix + code

    try:
        result = subprocess.run(
            ["python", "-c", full_code],
            capture_output=True,
            text=True,
            timeout=60,
        )
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": "Execution timed out after 60 seconds",
            "figures": [],
        }
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": str(e),
            "figures": [],
        }

    stdout = result.stdout
    stderr = result.stderr
    success = result.returncode == 0 and not stderr.strip()
    figures = _find_generated_figures(stdout, stderr)

    return {
        "success": success,
        "stdout": stdout,
        "stderr": stderr,
        "figures": figures,
    }