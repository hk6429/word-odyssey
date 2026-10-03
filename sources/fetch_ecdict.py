"""Cache complete ECDICT and derive corpus matches and ranked candidates."""
from pathlib import Path
import subprocess
import csv
import json
import re
import hashlib

base = Path(__file__).resolve().parent
words = {row["word"] for row in json.loads((base / "official-primary-headwords.json").read_text())}
url = "https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv"
cache = base / "ecdict-full.csv"
if not cache.exists():
    partial = base / "ecdict-full.csv.part"
    print("Fetching complete ECDICT into file cache; deadline 360 seconds.", flush=True)
    result = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--compressed", "--max-time", "360", "--speed-time", "30", "--speed-limit", "1000", "--output", str(partial), url],
    )
    print("download", result.returncode, "bytes", partial.stat().st_size if partial.exists() else 0, flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)
    with partial.open(encoding="utf-8-sig", newline="") as stream:
        header = next(csv.reader(stream))
    assert {"word", "definition", "translation", "bnc"}.issubset(header), header
    partial.replace(cache)
else:
    print("Using complete local CSV cache:", cache, cache.stat().st_size, flush=True)

matches, candidates, count = [], [], 0
fields = ["word", "phonetic", "definition", "translation", "pos", "bnc", "frq", "exchange", "collins"]
for row in csv.DictReader(cache.open(encoding="utf-8-sig", newline="")):
    count += 1
    word = row["word"].lower()
    record = {key: row[key] for key in fields}
    if word in words:
        matches.append(record)
    elif (
        re.fullmatch("[a-z]{3,}", row["word"])
        and row["translation"]
        and int(row["collins"] or 0) > 0
        and int(row["bnc"] or 0) > 0
        and not re.search(r"(?:^|/)0:", row["exchange"])
    ):
        candidates.append(record)
candidates.sort(key=lambda row: (int(row["bnc"]), row["word"]))
for name, data in [("ecdict-official-matches.json", matches), ("ecdict-supplement-candidates.json", candidates[:2000])]:
    (base / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
metadata = {
    "sourceUrl": url,
    "sourceCache": str(cache.relative_to(base.parent)),
    "sourceBytes": cache.stat().st_size,
    "sourceSha256": hashlib.sha256(cache.read_bytes()).hexdigest(),
    "ecdictRows": count,
    "matchedRows": len(matches),
    "matchedUnique": len({row["word"].lower() for row in matches}),
    "notMatched": sorted(words - {row["word"].lower() for row in matches}),
    "extensionAvailable": len(candidates),
    "savedExtension": min(2000, len(candidates)),
    "matchedDefinitions": sum(bool(row["definition"].strip()) for row in matches),
    "matchedMissingDefinitions": [row["word"] for row in matches if not row["definition"].strip()],
    "candidateDefinitions": sum(bool(row["definition"].strip()) for row in candidates[:2000]),
    "candidateMissingDefinitions": [row["word"] for row in candidates[:2000] if not row["definition"].strip()],
}
(base / "ecdict-extraction-metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(metadata, ensure_ascii=False, indent=2), flush=True)
