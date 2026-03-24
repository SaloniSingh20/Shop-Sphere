import { NextResponse } from "next/server";

export async function GET(req) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ message: "Query must be at least 2 characters" }, { status: 400 });
  }

  const backendBase = process.env.API_PROXY_TARGET || "http://localhost:5000";
  const token = req.headers.get("authorization");

  const response = await fetch(`${backendBase}/api/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: token ? { Authorization: token } : undefined,
    cache: "no-store",
  });

  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
