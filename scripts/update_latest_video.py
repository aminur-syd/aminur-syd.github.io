import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET


def fetch_text(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; GitHubActions/1.0)"
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_channel_id(channel_url: str) -> str:
    channel_url = channel_url.strip()

    m = re.search(r"/channel/(UC[\w-]{10,})", channel_url)
    if m:
        return m.group(1)

    html = fetch_text(channel_url)

    # Common patterns in YouTube HTML/JSON blobs
    for pattern in [
        r'"channelId"\s*:\s*"(UC[\w-]{10,})"',
        r'channelId\s*"\s*:\s*"(UC[\w-]{10,})"',
    ]:
        m2 = re.search(pattern, html)
        if m2:
            return m2.group(1)

    raise RuntimeError(
        "Could not resolve channelId. Please use a /channel/UC... URL or provide CHANNEL_ID explicitly."
    )


def parse_latest_from_feed(feed_xml: str) -> dict:
    root = ET.fromstring(feed_xml)

    # Namespaces used in the YouTube feed
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
    }

    entry = root.find("atom:entry", ns)
    if entry is None:
        raise RuntimeError("No entries found in YouTube feed")

    video_id = entry.findtext("yt:videoId", default="", namespaces=ns).strip()
    title = entry.findtext("atom:title", default="", namespaces=ns).strip()
    published = entry.findtext("atom:published", default="", namespaces=ns).strip()

    if not video_id:
        raise RuntimeError("Could not find yt:videoId in feed entry")

    return {
        "type": "youtube",
        "id": video_id,
        "title": title,
        "published": published,
    }


def main() -> int:
    channel_url = os.environ.get("CHANNEL_URL", "").strip()
    channel_id = os.environ.get("CHANNEL_ID", "").strip()

    if not channel_id:
        if not channel_url:
            print("Missing CHANNEL_URL or CHANNEL_ID", file=sys.stderr)
            return 2
        channel_id = extract_channel_id(channel_url)

    feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    feed_xml = fetch_text(feed_url)
    latest = parse_latest_from_feed(feed_xml)

    out_path = os.environ.get("OUT_PATH", "data/latest.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(latest, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote {out_path}: {latest['id']} ({latest.get('title','')})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
