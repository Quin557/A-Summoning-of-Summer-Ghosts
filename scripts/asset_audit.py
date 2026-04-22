#!/usr/bin/env python3
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_DIR = ROOT / "reports"
TEXT_EXTS = {".js", ".json", ".html", ".css", ".md", ".webmanifest"}


def load_story():
    story_path = DATA_DIR / "story.json"
    story = json.loads(story_path.read_text(encoding="utf-8"))
    return story.get("nodes", {})


def scan_static_references():
    refs = defaultdict(set)
    pattern = re.compile(r"assets/(?:img|bgm|voice)/[^\s\"')>`]+")
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTS:
            continue
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for match in pattern.findall(content):
            refs[match].add(str(path.relative_to(ROOT)))
    return refs


def summarize_assets():
    nodes = load_story()
    static_refs = scan_static_references()

    bgr_counts = Counter()
    char_counts = Counter()
    bgm_counts = Counter()
    voice_counts = Counter()

    for node in nodes.values():
        if node.get("bgr"):
            bgr_counts[f"assets/img/bgr/{node['bgr']}.png"] += 1
        if node.get("lCharactor"):
            char_counts[f"assets/img/character/{node['lCharactor']}.png"] += 1
        if node.get("rCharactor"):
            char_counts[f"assets/img/character/{node['rCharactor']}.png"] += 1
        if node.get("bgm"):
            bgm_counts[f"assets/bgm/{node['bgm']}.mp3"] += 1
        if node.get("voice") and node.get("voice") != "null":
            voice_counts[f"assets/voice/{node['voice']}.mp3"] += 1

    dynamic_counts = Counter()
    dynamic_counts.update(bgr_counts)
    dynamic_counts.update(char_counts)
    dynamic_counts.update(bgm_counts)
    dynamic_counts.update(voice_counts)

    scoped_files = []
    for scope in ["assets/img", "assets/bgm", "assets/voice"]:
        scoped_files.extend([p for p in (ROOT / scope).rglob("*") if p.is_file()])

    records = []
    for file_path in scoped_files:
        rel = str(file_path.relative_to(ROOT))
        size = file_path.stat().st_size
        dynamic_ref_count = dynamic_counts.get(rel, 0)
        static_ref_count = len(static_refs.get(rel, set()))
        records.append({
            "path": rel,
            "scope": rel.split("/")[1],
            "size_bytes": size,
            "size_mb": round(size / (1024 * 1024), 2),
            "dynamic_ref_count": dynamic_ref_count,
            "static_ref_count": static_ref_count,
            "total_ref_count": dynamic_ref_count + static_ref_count,
            "referenced": (dynamic_ref_count + static_ref_count) > 0,
            "static_ref_sources": sorted(static_refs.get(rel, set())),
        })

    referenced = sorted(
        [r for r in records if r["referenced"]],
        key=lambda item: (-item["size_bytes"], -item["total_ref_count"], item["path"]),
    )
    unreferenced = sorted(
        [r for r in records if not r["referenced"]],
        key=lambda item: (-item["size_bytes"], item["path"]),
    )

    summary = {
        "generated_from": "data/story.json + source static reference scan",
        "top_referenced_img": [r for r in referenced if r["path"].startswith("assets/img/")][:40],
        "top_referenced_bgm": [r for r in referenced if r["path"].startswith("assets/bgm/")][:40],
        "top_referenced_voice": [r for r in referenced if r["path"].startswith("assets/voice/")][:40],
        "top_unreferenced": unreferenced[:80],
        "totals": {
            "assets_img_mb": round(sum(r["size_bytes"] for r in records if r["path"].startswith("assets/img/")) / (1024 * 1024), 2),
            "assets_bgm_mb": round(sum(r["size_bytes"] for r in records if r["path"].startswith("assets/bgm/")) / (1024 * 1024), 2),
            "assets_voice_mb": round(sum(r["size_bytes"] for r in records if r["path"].startswith("assets/voice/")) / (1024 * 1024), 2),
            "referenced_files": sum(1 for r in records if r["referenced"]),
            "unreferenced_files": sum(1 for r in records if not r["referenced"]),
        },
    }

    REPORT_DIR.mkdir(exist_ok=True)
    json_path = REPORT_DIR / "asset-audit.json"
    md_path = REPORT_DIR / "asset-audit.md"
    json_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    def format_rows(title, rows):
        lines = [f"## {title}", "", "| 文件 | 大小(MB) | 引用次数 |", "|---|---:|---:|"]
        for row in rows:
            lines.append(f"| `{row['path']}` | {row['size_mb']} | {row['total_ref_count']} |")
        lines.append("")
        return lines

    md_lines = [
        "# Asset Audit",
        "",
        "- 数据源：`data/story.json` 动态资源字段 + 源码静态文本引用扫描",
        f"- `assets/img`: {summary['totals']['assets_img_mb']} MB",
        f"- `assets/bgm`: {summary['totals']['assets_bgm_mb']} MB",
        f"- `assets/voice`: {summary['totals']['assets_voice_mb']} MB",
        f"- 已引用文件数：{summary['totals']['referenced_files']}",
        f"- 未引用文件数：{summary['totals']['unreferenced_files']}",
        "",
        "建议优先压缩顺序：先 `assets/img/bgr` 中已引用的大图，再 `assets/bgm` 中已引用的大音乐，最后 `assets/voice` 中已引用的大语音。",
        "",
    ]
    md_lines += format_rows("Top Referenced Images", summary["top_referenced_img"][:20])
    md_lines += format_rows("Top Referenced BGM", summary["top_referenced_bgm"][:20])
    md_lines += format_rows("Top Referenced Voice", summary["top_referenced_voice"][:20])
    md_lines += format_rows("Top Unreferenced Files", summary["top_unreferenced"][:20])

    md_path.write_text("\n".join(md_lines), encoding="utf-8")
    print(f"Wrote {json_path.relative_to(ROOT)}")
    print(f"Wrote {md_path.relative_to(ROOT)}")


if __name__ == "__main__":
    summarize_assets()
