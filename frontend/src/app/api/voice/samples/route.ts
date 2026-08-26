import { NextRequest, NextResponse } from "next/server";
import {
  addVoiceSample,
  listVoiceSamples,
  MAX_SAMPLE_WORDS,
  MIN_SAMPLE_WORDS,
} from "@/lib/db/voice";

async function requireUserId(req: NextRequest): Promise<string | null> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const samples = await listVoiceSamples(userId);
  return NextResponse.json({ samples });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { content } = (body ?? {}) as Record<string, unknown>;
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Please provide a writing sample." }, { status: 400 });
  }

  const result = await addVoiceSample(userId, content);
  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      too_short: `That sample is too short — add at least ${MIN_SAMPLE_WORDS} words so HUMANORA has enough to learn from.`,
      too_long: `That sample is too long — keep individual samples under ${MAX_SAMPLE_WORDS} words.`,
      limit_reached: "You've reached the maximum number of writing samples. Remove one to add another.",
    };
    return NextResponse.json({ error: messages[result.reason], reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ sample: result.sample });
}
