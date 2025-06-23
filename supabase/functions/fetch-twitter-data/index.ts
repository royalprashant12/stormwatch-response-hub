
import { createHmac } from "node:crypto";

const TWITTER_API_KEY = Deno.env.get("TWITTER_API_KEY")?.trim();
const TWITTER_API_SECRET = Deno.env.get("TWITTER_API_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!TWITTER_API_KEY) {
    throw new Error("Missing TWITTER_API_KEY environment variable");
  }
  if (!TWITTER_API_SECRET) {
    throw new Error("Missing TWITTER_API_SECRET environment variable");
  }
}

// Generate OAuth signature for Twitter API v1.1
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  return signature;
}

function generateOAuthHeader(method: string, url: string, queryParams: Record<string, string>): string {
  const oauthParams = {
    oauth_consumer_key: TWITTER_API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams, ...queryParams };
  const signature = generateOAuthSignature(method, url, allParams, TWITTER_API_SECRET!);

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(signedOAuthParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function searchTwitter(query: string): Promise<any> {
  const baseUrl = "https://api.twitter.com/1.1/search/tweets.json";
  const queryParams = {
    q: query,
    count: "20",
    result_type: "recent",
    include_entities: "true"
  };

  const url = `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;
  const oauthHeader = generateOAuthHeader("GET", baseUrl, queryParams);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    validateEnvironmentVariables();
    
    const { query = "disaster OR earthquake OR flood OR hurricane OR wildfire OR emergency" } = await req.json();
    
    console.log("Searching Twitter for:", query);
    const tweets = await searchTwitter(query);
    
    // Transform Twitter data to our format
    const transformedTweets = tweets.statuses?.map((tweet: any) => ({
      id: tweet.id_str,
      post_content: tweet.text,
      username: tweet.user.screen_name,
      platform: "twitter",
      disaster_keywords: extractDisasterKeywords(tweet.text),
      location_extracted: tweet.user.location || null,
      created_at: new Date(tweet.created_at).toISOString(),
      verified: tweet.user.verified || false
    })) || [];

    return new Response(JSON.stringify({ tweets: transformedTweets }), {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error("Twitter API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

function extractDisasterKeywords(text: string): string[] {
  const keywords = ['disaster', 'earthquake', 'flood', 'hurricane', 'wildfire', 'emergency', 'evacuation', 'warning', 'alert', 'damage', 'rescue', 'relief'];
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword));
}
