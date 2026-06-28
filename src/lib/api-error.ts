import { NextResponse } from "next/server";
import { NotFoundError } from "@/lib/services/debts";

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = error.cause as Error & { code?: string } | undefined;
  return (
    error.message.includes("fetch failed") ||
    cause?.message?.includes("unable to verify") === true ||
    cause?.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (isNetworkError(error)) {
    return NextResponse.json(
      {
        error:
          "Gagal hubung ke Supabase. Coba restart dengan npm run dev (fix SSL lokal).",
      },
      { status: 503 }
    );
  }

  console.error("[API]", error);
  return NextResponse.json(
    { error: "Ada yang error di server, coba lagi nanti" },
    { status: 500 }
  );
}
