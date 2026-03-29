# tools/__init__.py
try:
    from .arxiv_tool import search_arxiv
    from .code_runner import execute_python_code
except ImportError:
    search_arxiv = None
    execute_python_code = None

TOOLS = {}
TOOL_DESCRIPTIONS = {}

if search_arxiv is not None:
    TOOLS["search_arxiv"] = search_arxiv
    TOOLS["execute_python_code"] = execute_python_code
    TOOL_DESCRIPTIONS = {
        "search_arxiv": "Search ArXiv for papers. Input: query (str), max_results (int, default 20). Output: list of dicts with title, authors, summary, published_date, arxiv_url, categories.",
        "execute_python_code": "Execute Python code and return stdout/stderr. Input: code (str), data_path (str, optional). Output: dict with success, stdout, stderr, figures.",
    }