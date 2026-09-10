#!/usr/bin/env python3
"""Build a page-complete, auditable reference index from the user-supplied PDF.

Authoring utility only; installed projects do not need pypdf. Extraction is not
semantic validation and never marks a component implemented or verified.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader


def group(page):
    for boundary, name in [(45, "introduction"), (61, "principles"),
                           (114, "styles"), (553, "components"),
                           (686, "basic-patterns"), (979, "service-patterns")]:
        if page < boundary:
            return name
    return "glossary"


def outline_pages(reader, items):
    result = set()
    for item in items:
        if isinstance(item, list):
            result.update(outline_pages(reader, item))
        else:
            result.add(reader.get_destination_page_number(item) + 1)
    return result


def build(pdf, output):
    reader = PdfReader(pdf)
    pages = [page.extract_text() or "" for page in reader.pages]
    toc = []
    for text in pages[1:6]:
        for line in text.splitlines():
            match = re.match(r"^(.*?)\s*[·.]{3,}\s*(\d+)\s*$", line)
            if match:
                toc.append((int(match[2]), match[1].strip()))
    if len(toc) != 95 or len(pages) != 988:
        raise ValueError("This importer expects the supplied 2024.02 PDF (95 TOC items / 988 pages)")
    if set(page for page, _ in toc) - outline_pages(reader, reader.outline):
        raise ValueError("Printed TOC and embedded outline disagree")
    if toc != sorted(toc) or len({p for p, _ in toc}) != len(toc):
        raise ValueError("TOC is not strictly ordered")
    source_hash = hashlib.sha256(pdf.read_bytes()).hexdigest()
    destination = output / "coverage.json"
    previous = json.loads(destination.read_text()) if destination.exists() else None
    if previous and previous["source"]["sha256"] != source_hash:
        raise ValueError("Different source PDF; use a new version directory")
    output.mkdir(parents=True, exist_ok=True)
    reference = output / "reference"
    reference.mkdir(exist_ok=True)
    records = []
    all_sections = [(1, "표지·전체 목차·장 안내")] + toc
    page_map = []
    for index, (start, title) in enumerate(all_sections):
        end = all_sections[index + 1][0] - 1 if index + 1 < len(all_sections) else len(pages)
        identifier = f"krds-p{start:04d}"
        record = {"id": identifier, "title": title, "category": group(start),
                  "startPage": start, "endPage": end,
                  "reference": f"reference/{identifier}.md",
                  "assets": [], "implementation": "pending",
                  "verification": "not-verified", "notes": []}
        body = [f"# {title}", "", f"출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.{start}-{end}.",
                "공공누리 제1유형 출처표시. 이 파일은 원문 텍스트 추출이며 그림·표 배치와 구현 준수는 원본 PDF로 별도 대조한다.",
                "https://www.krds.go.kr/", ""]
        for number in range(start, end + 1):
            text = pages[number - 1]
            body.extend([f"## PDF p.{number}", "", text, ""])
            page_map.append({"page": number, "section": identifier,
                             "textCharacters": len(text.strip()),
                             "sha256": hashlib.sha256(text.encode()).hexdigest(),
                             "visualReview": "pending"})
        (output / record["reference"]).write_text("\n".join(body), encoding="utf-8")
        records.append(record)
    assert [p["page"] for p in page_map] == list(range(1, 989))
    data = {"version": 1, "source": {"title": "디지털 정부서비스 UI/UX 가이드라인(2024.02)",
            "sha256": source_hash, "pageCount": len(pages), "tocCount": len(toc),
            "license": "KOGL Type 1; see ATTRIBUTION.md", "url": "https://www.krds.go.kr/"},
            "items": records, "pages": page_map}
    if previous:
        old = {item["id"]: item for item in previous["items"]}
        for item in records:
            if item["id"] in old:
                for key in ("assets", "implementation", "verification", "notes"):
                    item[key] = old[item["id"]][key]
        old_pages = {p["page"]: p for p in previous["pages"]}
        for page in page_map:
            if page["page"] in old_pages and old_pages[page["page"]]["sha256"] == page["sha256"]:
                page["visualReview"] = old_pages[page["page"]]["visualReview"]
    destination.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {len(pages)} pages, {len(toc)} TOC items, {len(records)} reference sections. Implementation remains pending.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build(args.pdf, args.output)
