import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET ?? "";
const TOKEN_URL = "https://api.fitbit.com/oauth2/token";

export async function POST(req: NextRequest) {
  try {
    const { code, codeVerifier, redirectUri } = (await req.json()) as {
      code: string;
      codeVerifier: string;
      redirectUri: string;
    };

    if (!code || !codeVerifier || !redirectUri) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    });

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const resp = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.message ?? "Token exchange failed" },
        { status: resp.status },
      );
    }

    return NextResponse.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: data.user_id,
      expiresIn: data.expires_in,
      scope: data.scope,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
