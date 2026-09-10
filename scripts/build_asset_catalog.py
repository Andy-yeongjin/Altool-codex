#!/usr/bin/env python3
"""Generate the searchable asset index and isolated upstream demo wrappers."""
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "designs/assets"
KRDS = BASE / "ui-kit/internal"
UPSTREAM = KRDS / "upstream"
COMMIT = "d6bb184c823e4757f05807ea4646a23e3133b6e6"


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    files = {str(p.relative_to(UPSTREAM)): hashlib.sha256(p.read_bytes()).hexdigest()
             for p in sorted(UPSTREAM.rglob("*")) if p.is_file()}
    manifest = json.loads((KRDS / "upstream-manifest.json").read_text())
    if manifest["commit"] != COMMIT or files != manifest["sha256"]:
        raise ValueError("Pinned upstream changed; restore the original source. Do not regenerate its trust manifest.")
    coverage = json.loads((KRDS / "coverage.json").read_text())
    mappings = {}
    for name in ("components/mapping.json", "patterns/basic/mapping.json", "patterns/services/mapping.json"):
        path = KRDS / name
        if not path.exists():
            continue
        data = json.loads(path.read_text())
        entries = data["items"]
        entries = entries if isinstance(entries, dict) else {item["id"]: item for item in entries}
        for identifier, value in entries.items():
            if identifier in mappings:
                raise ValueError(f"Duplicate ownership: {identifier}")
            value = dict(value)
            value["assets"] = [asset if asset.startswith("ui-kit/internal/") else "ui-kit/internal/" + asset for asset in value["assets"]]
            for asset in value["assets"]:
                file = (BASE / asset.split('#')[0]).resolve()
                if not file.is_relative_to(BASE) or not file.is_file():
                    raise ValueError(f"Missing/unsafe mapped asset: {asset}")
            mappings[identifier] = value
    codes = sorted((UPSTREAM / "html/code").glob("*.html"))
    records = []
    wrappers = KRDS / "examples"
    wrappers.mkdir(exist_ok=True)
    # Original snippets remain unchanged. Wrapper integration is separately named.
    for code in codes:
        content = code.read_text()
        destination = wrappers / code.name
        document = f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>{html.escape(code.stem)} · KRDS 참고 예제</title>
<link rel="stylesheet" href="../upstream/resources/css/component/output.css">
<link rel="stylesheet" href="../upstream/resources/css/common/common.css">
<link rel="stylesheet" href="../upstream/resources/css/plugin/swiper-bundle.min.css">
<script src="../upstream/resources/js/plugin/swiper-bundle.min.js"></script>
<style>body{{padding:24px}}.altool-demo-notice{{display:block;background:#fff3cd;color:#473500;padding:12px;font:14px/1.6 system-ui;margin-bottom:24px}}:focus-visible{{outline:3px solid #005fcc;outline-offset:3px}}</style>
</head><body><aside class="altool-demo-notice">KRDS 공식 키트 1.1.0 참고 예제 · 실제 정부 서비스가 아닙니다. 로그인·신청·저장 등의 서버 동작은 연결하지 않았습니다. 2024 PDF와의 개별 준수 검증은 별도입니다.</aside>
{content}
<script src="../upstream/resources/js/component/ui-script.js"></script>
</body></html>'''
        destination.write_text(document, encoding="utf-8")
        records.append({"id": f"krds-{code.stem}", "category": "components",
                        "name": code.stem.replace("_", " "),
                        "path": str(code.relative_to(BASE)),
                        "preview": str(destination.relative_to(BASE)),
                        "source": "KRDS 1.1.0", "verified": False})
    for category, directory in [("brand", BASE / "brand"), ("images", BASE / "images"),
                                ("icons", BASE / "icons/directions"),
                                ("icons", UPSTREAM / "resources/img/component/icon"),
                                ("icons", UPSTREAM / "resources/img/component/favicon")]:
        for asset in sorted(directory.glob("*.svg")):
            records.append({"id": f"{category}-{asset.stem}", "category": category,
                            "name": asset.stem.replace("ico_", "").replace("_", " "),
                            "path": str(asset.relative_to(BASE)),
                            "source": "KRDS 1.1.0" if asset.is_relative_to(UPSTREAM) else ("Altool derived from KRDS 1.1.0" if category == "icons" else "Altool original"),
                            "restrictedIdentity": bool(re.search(r"(?:^|_)(logo|flag|favicon|youtube|instagram|facebook|sns_x|blog|figma|sketch|xd)(?:_|$)", asset.stem))})
    for item in coverage["items"]:
        matches = re.search(r"\(([^)]+)\)", item["title"])
        if item["category"] == "components" and matches:
            stem = matches[1].lower().replace(" ", "_").replace("-", "_")
            variants = [r["path"] for r in records if r["category"] == "components" and
                        (Path(r["path"]).stem == stem or Path(r["path"]).stem.startswith(stem + "_"))]
            if stem == "side_navigation":
                variants = ["ui-kit/internal/upstream/html/code/side_navigation.html"]
            item["assets"] = variants
            item["implementation"] = "upstream-reference" if variants else "pending"
            if variants and not item["notes"]:
                item["notes"] = ["공식 키트 1.1.0 제공 자산; PDF 2024.02 대비 세부 상태·변형·접근성 대조 필요"]
        if item["id"] in mappings:
            mapping = mappings[item["id"]]
            item["assets"] = sorted(set(item["assets"] + mapping["assets"]))
            item["implementation"] = mapping["implementation"]
            item["notes"] = list(dict.fromkeys(mapping.get("notes", []) + mapping.get("gaps", [])))
            item["verification"] = mapping["verification"]
        elif item["category"] in ("introduction", "glossary"):
            item["assets"] = ["ui-kit/internal/" + item["reference"]]
            item["implementation"] = "reference-document"
            item["notes"] = ["소개·활용 안내·용어집은 읽는 참고 자산이며 실행 UI가 아니다. 그림/강조의 시각 대조는 별도."]
        records.append({"id": item["id"], "category": "guideline", "name": item["title"],
                        "path": "ui-kit/internal/" + item["reference"],
                        "pages": [item["startPage"], item["endPage"]],
                        "group": item["category"], "implementation": item["implementation"],
                        "verification": item["verification"]})
    # Index authored examples and contracts without duplicating shared CSS/JS in every card.
    for folder, category in [("patterns/basic", "patterns"), ("patterns/services", "patterns"),
                             ("components", "components"), ("foundations", "foundations")]:
        for path in sorted((KRDS / folder).rglob("*")):
            if path.suffix not in (".html", ".md", ".json", ".css", ".svg") or path.name in ("mapping.json",):
                continue
            relative = str(path.relative_to(BASE))
            title_match = re.search(r"<title>(.*?)</title>", path.read_text(), re.S)
            record = {"id": "derived-" + str(path.relative_to(KRDS)).replace('/', '-'),
                      "category": "images" if path.suffix == ".svg" else category, "name": html.unescape(title_match[1]) if title_match else path.stem,
                      "path": relative, "source": "Altool derived from KRDS 2024.02", "verified": False}
            if path.suffix == ".html":
                record["preview"] = relative
            records.append(record)
    write_json(KRDS / "coverage.json", coverage)
    write_json(BASE / "catalog.json", {"version": 1, "assets": records})
    components = [i for i in coverage["items"] if i["category"] == "components"]
    missing = [i["title"] for i in components if not i["assets"]]
    print(f"Catalog: {len(records)} entries, {len(codes)} HTML examples, {len(files)} upstream files")
    print(f"PDF component mapping: {len(components)-len(missing)}/{len(components)}; missing: {missing}")
    print("Source mapping is not behavior/semantic verification.")


if __name__ == "__main__":
    main()
