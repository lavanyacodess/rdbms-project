import { NextResponse } from "next/server";
import { ApiError } from "./errors.js";

export function apiSuccess(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleApiError(error) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status },
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
