import { NextResponse } from "next/server";
import { searchRepository } from "@/lib/data/repositories";
import type { SearchType } from "@/lib/data/types";

const searchTypes: SearchType[] = ["all", "vehicle", "brand", "manufacturer", "technology", "news"];

function parseType(value: string | null): SearchType {
  return value && searchTypes.includes(value as SearchType) ? (value as SearchType) : "all";
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").slice(0, 200);
  const type = parseType(url.searchParams.get("type"));
  return NextResponse.json(
    { query, type, results: searchRepository.search(query, { type, limit: 20 }) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
