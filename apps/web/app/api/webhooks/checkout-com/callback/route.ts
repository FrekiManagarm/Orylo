import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("signature");

  console.log(body);
  console.log(signature);

  return NextResponse.json({ received: true }, { status: 200 });
}