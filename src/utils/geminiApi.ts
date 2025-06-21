
import { supabase } from '@/integrations/supabase/client';

const GEMINI_API_KEY = 'AIzaSyBcPgnCna1r0rbgXcALdBrtAnTvT2nhOsw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Cache helper functions
const getCacheKey = (type: string, input: string): string => {
  return `${type}:${btoa(input)}`;
};

const getFromCache = async (cacheKey: string): Promise<string | null> => {
  try {
    // Use any to bypass TypeScript issues until types are regenerated
    const { data, error } = await (supabase as any)
      .from('api_cache')
      .select('response_data')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data.response_data.result;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
};

const saveToCache = async (cacheKey: string, result: string, ttlHours: number = 24): Promise<void> => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    // Use any to bypass TypeScript issues until types are regenerated
    await (supabase as any)
      .from('api_cache')
      .upsert({
        cache_key: cacheKey,
        response_data: { result },
        expires_at: expiresAt.toISOString()
      });
  } catch (error) {
    console.error('Cache save error:', error);
  }
};

const callGeminiAPI = async (prompt: string): Promise<string> => {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
};

export const extractLocation = async (description: string): Promise<string> => {
  const cacheKey = getCacheKey('location', description);
  
  // Check cache first
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Extract location from: ${description}. Return only the location name, nothing else. If no specific location is mentioned, return "Unknown".`;
    const result = await callGeminiAPI(prompt);
    const location = result.trim();
    
    // Save to cache
    await saveToCache(cacheKey, location);
    
    return location;
  } catch (error) {
    console.error('Location extraction error:', error);
    return 'Unknown';
  }
};

export const verifyImage = async (imageUrl: string): Promise<{ isAuthentic: boolean; confidence: number; analysis: string }> => {
  const cacheKey = getCacheKey('image_verify', imageUrl);
  
  // Check cache first
  const cached = await getFromCache(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const prompt = `Analyze image at ${imageUrl} for signs of manipulation or disaster context. Provide a JSON response with: {"isAuthentic": boolean, "confidence": 0-100, "analysis": "brief description"}`;
    const result = await callGeminiAPI(prompt);
    
    // Try to parse JSON response, fallback to default if invalid
    let verification;
    try {
      verification = JSON.parse(result);
    } catch {
      verification = {
        isAuthentic: true,
        confidence: 50,
        analysis: "Unable to analyze image automatically"
      };
    }
    
    // Save to cache
    await saveToCache(cacheKey, JSON.stringify(verification));
    
    return verification;
  } catch (error) {
    console.error('Image verification error:', error);
    return {
      isAuthentic: true,
      confidence: 50,
      analysis: "Verification failed"
    };
  }
};
