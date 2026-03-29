from typing import List, Dict
import urllib.request
import urllib.parse
import ssl
import certifi
import xml.etree.ElementTree as ET

ARXIV_API = "https://export.arxiv.org/api/query"

def search_arxiv(query: str, max_results: int = 20) -> List[Dict]:
    """
    Search ArXiv API and return list of paper metadata.

    Args:
        query: ArXiv search query string (e.g., "cond-mat.quant-gas AND optical lattice")
        max_results: Maximum number of results to return (default 20)

    Returns:
        List of dicts, each containing:
        - title: str
        - authors: List[str]
        - summary: str
        - published_date: str (ISO format)
        - arxiv_url: str
        - categories: List[str]
    """
    params = {
        "search_query": query,
        "max_results": str(max_results),
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    url = f"{ARXIV_API}?{urllib.parse.urlencode(params)}"
    context = ssl.create_default_context(cafile=certifi.where())

    with urllib.request.urlopen(url, timeout=30, context=context) as response:
        data = response.read().decode("utf-8")

    root = ET.fromstring(data)
    ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}

    papers = []
    for entry in root.findall("atom:entry", ns):
        def text(tag):
            el = entry.find(f"atom:{tag}", ns)
            return el.text.strip() if el is not None else ""

        authors = [
            a.find("atom:name", ns).text
            for a in entry.findall("atom:author", ns)
            if a.find("atom:name", ns) is not None
        ]
        categories = [c.get("term") for c in entry.findall("atom:category", ns)]

        papers.append({
            "title": text("title"),
            "authors": authors,
            "summary": text("summary"),
            "published_date": text("published"),
            "arxiv_url": text("id"),
            "categories": categories,
        })

    return papers