import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { url: string | null; ts: number }>();
const CACHE_TTL = 86400_000; // 24 hours

async function tryWikipediaSummary(query: string): Promise<string | null> {
  try {
    // Replace spaces with underscores for Wikipedia
    const wikiTitle = query.replace(/\s+/g, "_");
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
      { next: { revalidate: 86400 } }
    );
    if (res.ok) {
      const data = await res.json();
      const url = data.originalimage?.source || data.thumbnail?.source;
      if (url) return url.replace(/\/\d+px-/, "/800px-");
    }
  } catch { /* ignore */ }
  return null;
}

async function tryWikipediaSearch(query: string): Promise<string | null> {
  try {
    // Search Wikipedia for the query
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3&origin=*`,
      { next: { revalidate: 86400 } }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData.query?.search;
    if (!results?.length) return null;

    // Try each search result for an image
    for (const result of results) {
      const title = result.title;
      const imgRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
        { next: { revalidate: 86400 } }
      );
      if (!imgRes.ok) continue;
      const imgData = await imgRes.json();
      const pages = imgData.query?.pages;
      if (!pages) continue;
      const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
      if (page?.thumbnail?.source) return page.thumbnail.source;
    }
  } catch { /* ignore */ }
  return null;
}

async function tryWikimediaSearch(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + " Thailand")}&gsrlimit=3&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    for (const page of Object.values(pages) as Array<{ imageinfo?: Array<{ thumburl?: string }> }>) {
      if (page.imageinfo?.[0]?.thumburl) return page.imageinfo[0].thumburl;
    }
  } catch { /* ignore */ }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "Thailand";

  // Check cache
  const cached = cache.get(query);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ imageUrl: cached.url });
  }

  // Try multiple strategies
  let imageUrl: string | null = null;

  // 1. Direct Wikipedia summary (fastest)
  imageUrl = await tryWikipediaSummary(query);

  // 2. Wikipedia search
  if (!imageUrl) {
    imageUrl = await tryWikipediaSearch(query);
  }

  // 3. Wikimedia Commons search
  if (!imageUrl) {
    imageUrl = await tryWikimediaSearch(query);
  }

  // Cache result (even null to avoid repeated failures)
  cache.set(query, { url: imageUrl, ts: Date.now() });

  return NextResponse.json({ imageUrl });
}
