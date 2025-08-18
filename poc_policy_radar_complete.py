#!/usr/bin/env python3
"""
Policy Radar PoC – Updated with working EP Open Data API connector

What it does (MVP):
- Pulls EURACTIV RSS feed 
- Runs SPARQL query on EUR‑Lex Cellar
- **NEW: Fetches procedures, documents & events from EP Open Data API**
- Normalizes to one schema and writes JSONL/CSV files
- Prints detailed console report

How to run:
  python poc_policy_radar.py --topic hydrogen --days 30 \
     --euractiv https://www.euractiv.com/section/energy-environment/feed/ \
     --ep-limit 30

Requirements: see requirements.txt
"""

import argparse
import datetime as dt
import hashlib
import json
import sys
import time
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

import feedparser  # RSS
import pandas as pd
import requests  # HTTP
from tqdm import tqdm

UA = "PolicyRadarPoC/0.1 (+contact: your-email@example.com)"

# -----------------------------
# Config & helpers
# -----------------------------

@dataclass
class DocItem:
    source: str                 # 'EURACTIV' | 'EUR-Lex' | 'EP Open Data'
    doc_type: str               # 'news' | 'proposal' | 'procedure' | 'event' | etc.
    id: str                     # stable id: link, CELEX, or procedure ID
    title: str
    summary: Optional[str]
    body_text: Optional[str]    # PoC keeps this None for RSS/API (could be enriched)
    language: Optional[str]
    url: str
    published: Optional[str]    # ISO date
    topics: List[str]
    extra: dict                 # any extra fields (e.g., celex, procedureId, committee)

def iso(dtobj: Optional[dt.datetime]) -> Optional[str]:
    return dtobj.isoformat() if dtobj else None

def sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()

def ensure_outdir(path: str) -> None:
    import os
    os.makedirs(path, exist_ok=True)

# -----------------------------
# EURACTIV RSS
# -----------------------------

def fetch_euractiv_rss(feed_url: str, since_days: int = 30, topic_filter: Optional[str] = None) -> List[DocItem]:
    """Fetch EURACTIV RSS and map to DocItem."""
    print(f"[EURACTIV] Pulling RSS: {feed_url}")
    d = feedparser.parse(feed_url)
    items: List[DocItem] = []
    cutoff = dt.datetime.utcnow() - dt.timedelta(days=since_days)

    for e in d.entries:
        # Try parse published date
        pub = None
        if getattr(e, "published_parsed", None):
            pub = dt.datetime.fromtimestamp(time.mktime(e.published_parsed))
        elif getattr(e, "updated_parsed", None):
            pub = dt.datetime.fromtimestamp(time.mktime(e.updated_parsed))

        if pub and pub < cutoff:
            continue

        title = getattr(e, "title", "").strip()
        summary = getattr(e, "summary", None)
        link = getattr(e, "link", "")
        lang = getattr(e, "language", None) or getattr(d.feed, "language", None)

        blob = (title + " " + (summary or "")).lower()
        if topic_filter and topic_filter.lower() not in blob:
            continue

        items.append(DocItem(
            source="EURACTIV",
            doc_type="news",
            id=sha1(link or title),
            title=title,
            summary=summary,
            body_text=None,
            language=lang,
            url=link,
            published=iso(pub) if pub else None,
            topics=[topic_filter] if topic_filter else [],
            extra={"rss_link": link}
        ))
    print(f"[EURACTIV] Collected {len(items)} items")
    return items

# -----------------------------
# EUR‑Lex SPARQL
# -----------------------------

CELLAR_SPARQL = "https://publications.europa.eu/webapi/rdf/sparql"

def query_eurlex_sparql(keywords: List[str], limit: int = 50, lang: str = "en") -> List[DocItem]:
    """Query EUR‑Lex Cellar SPARQL for recent legal resources matching keywords."""
    kw_filter = " || ".join([f"CONTAINS(LCASE(STR(?title)), '{k.lower()}')" for k in keywords])
    lbl_filter = " || ".join([f"CONTAINS(LCASE(STR(?lbl)), '{k.lower()}')" for k in keywords])

    query = f"""
PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
PREFIX dc:  <http://purl.org/dc/terms/>
PREFIX skos:<http://www.w3.org/2004/02/skos/core#>

SELECT ?work ?celex ?title ?date WHERE {{
  ?work a cdm:resource_legal ;
        cdm:resource_legal_id_celex ?celex ;
        dc:title ?title ;
        cdm:work_date_document ?date .
  FILTER (lang(?title) = "{lang}")
  FILTER ({kw_filter})
  OPTIONAL {{
    ?work cdm:resource_legal_is_about_concept ?concept .
    ?concept skos:prefLabel ?lbl .
    FILTER (lang(?lbl)="{lang}" && ({lbl_filter}))
  }}
}}
ORDER BY DESC(?date) LIMIT {limit}
"""

    headers = {"User-Agent": UA}
    params = {"query": query, "format": "application/sparql-results+json"}

    print("[EUR‑Lex] Running SPARQL…")
    r = requests.get(CELLAR_SPARQL, headers=headers, params=params, timeout=60)
    r.raise_for_status()
    data = r.json()

    items: List[DocItem] = []
    for b in data.get("results", {}).get("bindings", []):
        celex = b.get("celex", {}).get("value")
        title = b.get("title", {}).get("value")
        date = b.get("date", {}).get("value")
        url = f"https://eur-lex.europa.eu/eli/{celex}/oj" if celex else None
        items.append(DocItem(
            source="EUR-Lex",
            doc_type="legal",
            id=celex or sha1(title),
            title=title,
            summary=None,
            body_text=None,
            language=lang,
            url=url or f"https://eur-lex.europa.eu/search.html?text={celex}",
            published=date,
            topics=keywords,
            extra={"celex": celex}
        ))
    print(f"[EUR‑Lex] Collected {len(items)} items")
    return items

# -----------------------------
# EP Open Data API
# -----------------------------

class EPConnector:
    """European Parliament Open Data API Connector"""
    
    def __init__(self, base_url: str = "https://data.europarl.europa.eu/api/v2"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': UA,
            'Accept': 'application/json'
        })
        
    def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make API request with error handling"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            time.sleep(0.1)  # Basic rate limiting
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"[EP API] Request error for {url}: {e}")
            return {"data": []}
        except json.JSONDecodeError as e:
            print(f"[EP API] JSON decode error: {e}")
            return {"data": []}
    
    def fetch_procedures(self, keywords: List[str], limit: int = 30) -> List[DocItem]:
        """Fetch legislative procedures matching keywords"""
        items = []
        search_query = ' OR '.join(keywords)
        
        params = {
            'q': search_query,
            'limit': limit,
            'sort': '-created_date',
            'format': 'json'
        }
        
        print(f"[EP] Fetching procedures for: {search_query}")
        data = self._make_request('/procedures', params)
        
        for proc in data.get('data', []):
            procedure_id = proc.get('id', '')
            title = proc.get('title', {})
            
            # Handle multilingual titles
            if isinstance(title, dict):
                title = title.get('en') or title.get('fr') or title.get('de') or list(title.values())[0] if title.values() else ''
            
            summary = proc.get('summary', {})
            if isinstance(summary, dict):
                summary = summary.get('en') or summary.get('fr') or ''
            
            ep_url = f"https://www.europarl.europa.eu/oeil/popups/ficheprocedure.do?lang=en&reference={procedure_id}"
            created_date = proc.get('created_date') or proc.get('date_created')
            
            # Extract committee info
            committees = proc.get('committees', [])
            committee_names = []
            for c in committees:
                if isinstance(c, dict) and c.get('name'):
                    name = c['name']
                    if isinstance(name, dict):
                        committee_names.append(name.get('en', ''))
                    else:
                        committee_names.append(str(name))
            
            # Match topics
            matched_topics = [kw for kw in keywords 
                            if kw.lower() in (str(title) + ' ' + str(summary)).lower()]
            
            stage = proc.get('stage', {})
            if isinstance(stage, dict):
                stage = stage.get('en') or stage.get('label') or 'Unknown'
            
            items.append(DocItem(
                source="EP Open Data",
                doc_type="procedure",
                id=procedure_id,
                title=str(title),
                summary=str(summary) if summary else None,
                body_text=None,
                language="en",
                url=ep_url,
                published=created_date,
                topics=matched_topics,
                extra={
                    "procedure_id": procedure_id,
                    "stage": str(stage),
                    "committees": committee_names,
                    "origin": "ep_procedures_api"
                }
            ))
        
        print(f"[EP] Collected {len(items)} procedures")
        return items
    
    def fetch_documents(self, keywords: List[str], limit: int = 20) -> List[DocItem]:
        """Fetch parliamentary documents matching keywords"""
        items = []
        search_query = ' OR '.join(keywords)
        
        params = {
            'q': search_query,
            'limit': limit,
            'sort': '-date',
            'format': 'json'
        }
        
        print(f"[EP] Fetching documents for: {search_query}")
        data = self._make_request('/documents', params)
        
        for doc in data.get('data', []):
            doc_id = doc.get('id', '')
            title = doc.get('title', {})
            
            if isinstance(title, dict):
                title = title.get('en') or title.get('fr') or title.get('de') or str(title)
            
            doc_type = doc.get('type', {})
            if isinstance(doc_type, dict):
                doc_type = doc_type.get('en') or doc_type.get('label') or 'document'
            
            doc_url = doc.get('url') or f"https://www.europarl.europa.eu/doceo/document/{doc_id}_EN.html"
            date = doc.get('date') or doc.get('publication_date')
            
            matched_topics = [kw for kw in keywords 
                            if kw.lower() in str(title).lower()]
            
            items.append(DocItem(
                source="EP Open Data",
                doc_type=str(doc_type).lower().replace(' ', '_'),
                id=doc_id,
                title=str(title),
                summary=None,
                body_text=None,
                language="en",
                url=doc_url,
                published=date,
                topics=matched_topics,
                extra={
                    "document_id": doc_id,
                    "document_type": str(doc_type),
                    "origin": "ep_documents_api"
                }
            ))
        
        print(f"[EP] Collected {len(items)} documents")
        return items

def fetch_ep_data(keywords: List[str], limit: int = 50) -> List[DocItem]:
    """
    Replacement for fetch_ep_placeholder() - now fully functional!
    """
    connector = EPConnector()
    all_items = []
    
    try:
        # Procedures are most important for policy tracking
        procedures = connector.fetch_procedures(keywords, limit=int(limit * 0.6))
        all_items.extend(procedures)
        
        # Recent documents
        documents = connector.fetch_documents(keywords, limit=int(limit * 0.4))
        all_items.extend(documents)
        
    except Exception as e:
        print(f"[EP] Error in fetch_ep_data: {e}")
    
    return all_items

# -----------------------------
# Normalize + Write
# -----------------------------

def to_frame(items: List[DocItem]) -> pd.DataFrame:
    recs = []
    for it in items:
        d = asdict(it)
        d["topics"] = ",".join(it.topics)
        d["extra_json"] = json.dumps(it.extra, ensure_ascii=False)
        recs.append(d)
    cols = ["source","doc_type","id","title","summary","body_text","language","url","published","topics","extra_json"]
    return pd.DataFrame(recs, columns=cols)

def write_outputs(items: List[DocItem], outdir: str) -> None:
    ensure_outdir(outdir)
    # JSONL
    jl = outdir + "/items.jsonl"
    with open(jl, "w", encoding="utf-8") as f:
        for it in items:
            obj = asdict(it)
            obj["topics"] = it.topics  # keep as list in jsonl
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")
    # CSV
    df = to_frame(items)
    df.to_csv(outdir + "/items.csv", index=False)
    print(f"[OUT] Wrote {len(items)} items -> {outdir}/items.jsonl & items.csv")

# -----------------------------
# CLI
# -----------------------------

def main():
    ap = argparse.ArgumentParser(description="Policy Radar PoC (EURACTIV + EUR‑Lex + EP Open Data)")
    ap.add_argument("--euractiv", default="https://www.euractiv.com/section/energy-environment/feed/",
                    help="EURACTIV RSS feed URL")
    ap.add_argument("--topic", default="hydrogen", help="Keyword filter (e.g., hydrogen, ammonia, battery)")
    ap.add_argument("--days", type=int, default=30, help="How many past days to pull from RSS")
    ap.add_argument("--limit", type=int, default=40, help="Max EUR‑Lex results via SPARQL")
    ap.add_argument("--ep-limit", type=int, default=30, help="Max EP Open Data results")
    ap.add_argument("--lang", default="en", help="Language code for EUR‑Lex titles (en/fr/de/nl/…)")
    ap.add_argument("--out", default="./out", help="Output directory")
    args = ap.parse_args()

    all_items: List[DocItem] = []

    # 1) EURACTIV
    try:
        rss_items = fetch_euractiv_rss(args.euractiv, since_days=args.days, topic_filter=args.topic)
        all_items.extend(rss_items)
    except Exception as e:
        print(f"[EURACTIV] ERROR: {e}", file=sys.stderr)

    # 2) EUR‑Lex SPARQL
    try:
        lex_items = query_eurlex_sparql([args.topic], limit=args.limit, lang=args.lang)
        all_items.extend(lex_items)
    except Exception as e:
        print(f"[EUR‑Lex] ERROR: {e}", file=sys.stderr)

    # 3) EP Open Data (now fully functional!)
    try:
        ep_items = fetch_ep_data([args.topic], limit=args.ep_limit)
        all_items.extend(ep_items)
    except Exception as e:
        print(f"[EP] ERROR: {e}", file=sys.stderr)

    # Write outputs
    write_outputs(all_items, args.out)

    # Enhanced console report
    by_source = {}
    by_doc_type = {}
    
    for it in all_items:
        by_source[it.source] = by_source.get(it.source, 0) + 1
        by_doc_type[it.doc_type] = by_doc_type.get(it.doc_type, 0) + 1

    print("\n=== SUMMARY ===")
    print("By source:")
    for src, n in sorted(by_source.items()):
        print(f"  {src:15s}: {n:3d}")
    
    print("\nBy document type:")
    for dtype, n in sorted(by_doc_type.items()):
        print(f"  {dtype:15s}: {n:3d}")
    
    print(f"\nTOTAL           : {len(all_items)}")
    print(f"Output dir      : {args.out}")
    
    # Show sample items for verification
    if all_items:
        print("\n=== SAMPLE ITEMS ===")
        for i, item in enumerate(all_items[:3]):
            print(f"{i+1}. [{item.source}] {item.doc_type}")
            print(f"   {item.title[:80]}...")
            print(f"   URL: {item.url}")
            if item.extra.get('procedure_id'):
                print(f"   Procedure: {item.extra['procedure_id']}")
            if item.extra.get('committees'):
                print(f"   Committees: {', '.join(item.extra['committees'][:2])}")
            print()

if __name__ == "__main__":
    main()
