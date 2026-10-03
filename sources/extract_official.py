"""Rebuild English source records from the two downloaded official PDFs.

Run from the repository root: python3 sources/extract_official.py
Requires the already available pymupdf package. No network, dictionary, or AI.
"""

from collections import Counter
from pathlib import Path
import hashlib
import json
import re

import pymupdf

BASE = Path(__file__).resolve().parent


def write_json(name, value):
    (BASE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def primary(entry):
    """An explicit orthographic counting rule, not a linguistic lemma claim."""
    return re.sub(r"\([^)]*\)", "", entry).split("/")[0].strip().lower()


def ceec():
    doc = pymupdf.open(BASE / "ceec-111.pdf")
    records = []
    for page_index in range(64, 115):
        pending = ""
        for line in doc[page_index].get_text().splitlines():
            line = line.strip()
            if not line or re.fullmatch(r"[A-Z]", line):
                continue
            if re.fullmatch(r"\d+", line) and not pending:
                continue
            if not (re.search("[A-Za-z]", line) or (pending and re.fullmatch("[1-6]", line))):
                continue
            pending += " " + line
            # The source spells calm's last POS as n without a final period.
            match = re.fullmatch(
                r"\s*(.+?)\s+((?:art|n|v|adj|adv|prep|conj|pron|aux|interj)[a-z/(). ]*)\s+([1-6])",
                pending,
            )
            if match:
                records.append({"entry": match[1], "pos": match[2], "ceecLevel": int(match[3]), "page": page_index + 1})
                pending = ""
        assert not pending, (page_index, pending)
    assert len(records) == 6012
    assert Counter(row["ceecLevel"] for row in records) == {i: 1002 for i in range(1, 7)}
    assert len({row["entry"] for row in records}) == len(records)
    assert not any(re.search(r"\b(?:n|v|adj|adv)\.", row["entry"]) for row in records)

    # Independent extraction of the earlier, by-level presentation: same entries.
    by_level = []
    for page_index in range(12, 63):
        pending = ""
        for line in doc[page_index].get_text().splitlines():
            line = line.strip()
            if not re.search("[a-zA-Z]", line):
                continue
            pending += " " + line
            if pending.endswith("/"):
                continue
            match = re.fullmatch(r"\s*(.+?)\s+((?:art|n|v|adj|adv|prep|conj|pron|aux|interj)[a-z/(). ]*)", pending)
            if match:
                by_level.append(match[1])
                pending = ""
        assert not pending, (page_index, pending)
    assert Counter(by_level) == Counter(row["entry"] for row in records)
    return records


def moe():
    doc = pymupdf.open(BASE / "moe-108-english.pdf")
    text = "\n".join(doc[i].get_text() for i in range(55, 61))
    text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.M)
    table_one, table_two = text.split("表一、")[1].split("表三、")[0].split("表二、")
    records = []
    for section, table in [("moe1200", table_one), ("moe800", table_two)]:
        letters = list(re.finditer(r"^\s*([A-Z])-\s*", table, re.M))
        for i, match in enumerate(letters):
            end = letters[i + 1].start() if i + 1 < len(letters) else len(table)
            content = " ".join(table[match.end():end].split())
            for entry in re.split(r",\s*(?![^()]*\))", content):
                if entry.strip():
                    records.append({"entry": entry.strip(), "section": section, "letter": match[1]})
    assert Counter(row["section"] for row in records) == {"moe1200": 1211, "moe800": 794}
    assert all(row["entry"][0].upper() == row["letter"] for row in records)
    return records


def main():
    ceec_rows, moe_rows = ceec(), moe()
    write_json("ceec-111-entries.json", ceec_rows)
    write_json("moe-108-entries.json", moe_rows)
    combined = {}
    for row in moe_rows:
        word = primary(row["entry"])
        item = combined.setdefault(word, {"word": word, "sourceEntries": [], "officialTags": []})
        item["sourceEntries"].append({"source": "moe-108", **row})
        item["officialTags"].append(row["section"])
    for row in ceec_rows:
        word = primary(row["entry"])
        item = combined.setdefault(word, {"word": word, "sourceEntries": [], "officialTags": []})
        item["sourceEntries"].append({"source": "ceec-111", **row})
        item["officialTags"].append(f"ceec-{row['ceecLevel']}")
    for item in combined.values():
        item["officialTags"] = sorted(set(item["officialTags"]))
    write_json("official-primary-headwords.json", sorted(combined.values(), key=lambda row: row["word"]))
    counts = {
        "ceecEntries": len(ceec_rows),
        "ceecEntriesByLevel": dict(Counter(row["ceecLevel"] for row in ceec_rows)),
        "ceecPrimaryHeadwords": len({primary(row["entry"]) for row in ceec_rows}),
        "moeEntriesBySection": dict(Counter(row["section"] for row in moe_rows)),
        "moeBasicPrimaryHeadwords": len({primary(row["entry"]) for row in moe_rows if row["section"] == "moe1200"}),
        "moeAllPrimaryHeadwords": len({primary(row["entry"]) for row in moe_rows}),
        "unionPrimaryHeadwords": len(combined),
        "supplementNeededFor7000": 7000 - len(combined),
        "sourceSha256": {name: hashlib.sha256((BASE / name).read_bytes()).hexdigest() for name in ["ceec-111.pdf", "moe-108-english.pdf"]},
        "countingRule": "Remove parentheses and their contents, take first slash-delimited form, trim, lowercase; phrases remain one target. This is not full lemma/alias normalization.",
    }
    write_json("official-counts.json", counts)
    print(json.dumps(counts, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
