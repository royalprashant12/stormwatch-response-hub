
import { createHmac } from "node:crypto";

const TWITTER_API_KEY = Deno.env.get("TWITTER_API_KEY")?.trim();
const TWITTER_API_SECRET = Deno.env.get("TWITTER_API_SECRET")?.trim();

function validateEnvironmentVariables() {
  console.log("Validating environment variables...");
  console.log("API Key present:", !!TWITTER_API_KEY);
  console.log("API Key length:", TWITTER_API_KEY?.length || 0);
  console.log("API Secret present:", !!TWITTER_API_SECRET);
  console.log("API Secret length:", TWITTER_API_SECRET?.length || 0);
  
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
  // Sort parameters alphabetically
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&`;
  
  console.log("Signature Base String:", signatureBaseString);
  console.log("Signing Key length:", signingKey.length);
  
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  
  console.log("Generated Signature:", signature);
  return signature;
}

function generateOAuthHeader(method: string, url: string, queryParams: Record<string, string>): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2) + timestamp;
  
  const oauthParams = {
    oauth_consumer_key: TWITTER_API_KEY!,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_version: "1.0",
  };

  // Combine OAuth params with query params for signature generation
  const allParams = { ...oauthParams, ...queryParams };
  const signature = generateOAuthSignature(method, url, allParams, TWITTER_API_SECRET!);

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const authHeader = "OAuth " + Object.entries(signedOAuthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");

  console.log("Generated OAuth Header:", authHeader);
  return authHeader;
}

async function searchTwitter(query: string): Promise<any> {
  const baseUrl = "https://api.twitter.com/1.1/search/tweets.json";
  const queryParams = {
    q: query,
    count: "10",
    result_type: "recent",
    include_entities: "false"
  };

  const fullUrl = `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;
  const oauthHeader = generateOAuthHeader("GET", baseUrl, queryParams);

  console.log("Making request to Twitter API:", fullUrl);
  console.log("Using API Key:", TWITTER_API_KEY?.substring(0, 10) + "...");

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: oauthHeader,
        "User-Agent": "DisasterResponseApp/1.0",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (!response.ok) {
      console.error(`Twitter API error: ${response.status} - ${responseText}`);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.errors && errorData.errors.length > 0) {
          const error = errorData.errors[0];
          throw new Error(`Twitter API Error ${error.code}: ${error.message}`);
        }
      } catch (parseError) {
        // If we can't parse the error, throw the original response
        throw new Error(`Twitter API error: ${response.status} - ${responseText}`);
      }
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
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
    console.log("=== Twitter API Function Started ===");
    console.log("Using API Key from env:", TWITTER_API_KEY?.substring(0, 10) + "...");
    console.log("Using API Secret from env:", TWITTER_API_SECRET?.substring(0, 10) + "...");
    
    validateEnvironmentVariables();
    
    const { query = "disaster OR earthquake OR flood OR hurricane OR wildfire OR emergency -RT" } = await req.json();
    
    console.log("Searching Twitter for:", query);
    const tweets = await searchTwitter(query);
    
    console.log("Twitter API response received, status count:", tweets.statuses?.length || 0);
    
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

    console.log("Transformed tweets count:", transformedTweets.length);

    return new Response(JSON.stringify({ tweets: transformedTweets }), {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error("=== Twitter API Function Error ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Check function logs for more information"
    }), {
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
