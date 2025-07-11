
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TwitterPost {
  id: string;
  post_content: string;
  username: string;
  platform: string;
  disaster_keywords: string[];
  location_extracted: string | null;
  created_at: string;
  verified: boolean;
}

export const useTwitterData = () => {
  const [posts, setPosts] = useState<TwitterPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTwitterData = async () => {
    setLoading(true);
    try {
      console.log("Invoking Twitter fetch function...");
      
      const { data, error } = await supabase.functions.invoke('fetch-twitter-data', {
        body: {
          query: 'disaster OR earthquake OR flood OR hurricane OR wildfire OR emergency -RT'
        }
      });

      console.log("Function response:", { data, error });

      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }

      if (data?.tweets) {
        console.log("Received tweets:", data.tweets);
        
        // Save to database
        for (const tweet of data.tweets) {
          try {
            await (supabase as any)
              .from('social_media_posts')
              .upsert({
                id: tweet.id,
                post_content: tweet.post_content,
                username: tweet.username,
                platform: tweet.platform,
                disaster_keywords: tweet.disaster_keywords,
                location_extracted: tweet.location_extracted,
                created_at: tweet.created_at,
                verified: tweet.verified
              });
          } catch (dbError) {
            console.error('Error saving tweet to database:', dbError);
          }
        }

        setPosts(data.tweets);
        toast({
          title: "Success",
          description: `Fetched ${data.tweets.length} tweets from Twitter`,
        });
      } else {
        console.log("No tweets in response");
        toast({
          title: "No Data",
          description: "No tweets found for the current search query",
        });
      }
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Twitter data. Please check your API keys.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    posts,
    loading,
    fetchTwitterData
  };
};
