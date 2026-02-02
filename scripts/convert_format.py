#!/usr/bin/env python3
"""
Convert flashcard export format to backup format.

Source: Plain JSON array
Target: Object with flashcards and presetDomains keys
"""

import json
from datetime import datetime
from pathlib import Path


def convert_date_format(date_str: str) -> str:
    """Convert 'YYYY-MM-DD HH:MM:SS.sss' to ISO 8601 format."""
    if not date_str:
        return datetime.utcnow().isoformat() + "Z"
    # Parse the input format and output ISO format with T and Z
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f")
        return dt.isoformat() + "Z"
    except ValueError:
        return date_str


def convert_flashcard(card: dict) -> dict:
    """Convert a single flashcard to the new format."""
    return {
        "id": card["id"],
        "sentence": card["sentence"],
        "word": card["word"],
        "translation": card["translation"],
        "definition": card["definition"] or "",
        "domain": card["domain"] or "通用",
        "mastery": card["mastery"],
        "review_count": card["review_count"],
        "next_review": convert_date_format(card["next_review"]),
        "created_at": convert_date_format(card["created_at"]),
    }


def main():
    # File paths
    source_file = Path("public_flashcards_export_2026-02-02_193631.json")
    target_file = Path("public_flashcards_export_converted.json")

    # Read source file
    with open(source_file, "r", encoding="utf-8") as f:
        source_cards = json.load(f)

    # Extract unique domains from source for presetDomains
    unique_domains = set()
    for card in source_cards:
        if card["domain"]:
            unique_domains.add(card["domain"])

    # Build presetDomains
    preset_domains = [
        {"id": i + 1, "name": domain, "created_at": datetime.utcnow().isoformat() + "Z"}
        for i, domain in enumerate(sorted(unique_domains))
    ]

    # Always include "通用" as first domain if not present
    if "通用" not in unique_domains:
        preset_domains.insert(0, {"id": 1, "name": "通用", "created_at": datetime.utcnow().isoformat() + "Z"})
        # Re-index
        for i, domain in enumerate(preset_domains):
            domain["id"] = i + 1

    # Convert flashcards
    converted_cards = [convert_flashcard(card) for card in source_cards]

    # Build output format
    output = {
        "flashcards": converted_cards,
        "presetDomains": preset_domains
    }

    # Write output file
    with open(target_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Converted {len(converted_cards)} flashcards")
    print(f"Created {len(preset_domains)} preset domains")
    print(f"Output written to: {target_file}")


if __name__ == "__main__":
    main()
