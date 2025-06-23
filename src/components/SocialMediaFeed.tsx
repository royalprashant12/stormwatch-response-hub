
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { extractLocation } from "@/utils/geminiApi";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useTwitterData } from "@/hooks/useTwitterData";

interface SocialPost {
  id: string;
  post_content: string;
  username: string;
  platform: string;
  disaster_keywords: string[];
  location_extracted: string | null;
  created_at: string;
  verified: boolean;
}

const SocialMediaFeed = () => {
  const [dbPosts, setDbPosts] = useState<SocialPost[]>([]);
  const [extractingLocation, setExtractingLocation] = useState<string | null>(null);
  const { toast } = useToast();
  const { posts: twitterPosts, loading: twitterLoading, fetchTwitterData } = useTwitterData();

  // Combine database posts and Twitter posts
  const allPosts = [...twitterPosts, ...dbPosts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Fetch posts from database
  const fetchDbPosts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('social_media_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDbPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load social media posts",
        variant: "destructive"
      });
    }
  };

  // Extract location for a post
  const handleExtractLocation = async (postId: string, content: string) => {
    setExtractingLocation(postId);
    try {
      const location = await extractLocation(content);
      
      // Update the post with extracted location
      const { error } = await (supabase as any)
        .from('social_media_posts')
        .update({ location_extracted: location })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setDbPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, location_extracted: location } : post
      ));

      toast({
        title: "Success",
        description: `Location extracted: ${location}`,
      });
    } catch (error) {
      console.error('Error extracting location:', error);
      toast({
        title: "Error",
        description: "Failed to extract location",
        variant: "destructive"
      });
    } finally {
      setExtractingLocation(null);
    }
  };

  useEffect(() => {
    fetchDbPosts();
  }, []);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'bg-blue-100 text-blue-800';
      case 'bluesky': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-purple-50">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          📱 Social Media Feed
        </CardTitle>
        <CardDescription>
          Real-time disaster-related posts from Twitter and other platforms
        </CardDescription>
        <div className="flex gap-2">
          <Button 
            onClick={fetchTwitterData} 
            disabled={twitterLoading}
            variant="outline" 
            size="sm"
          >
            {twitterLoading ? 'Fetching Twitter...' : 'Fetch Live Twitter Data'}
          </Button>
          <Button onClick={fetchDbPosts} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-6">
          <div className="space-y-4">
            {twitterLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Fetching live Twitter data...</p>
              </div>
            )}
            
            {allPosts.length === 0 && !twitterLoading ? (
              <p className="text-gray-500 text-center py-8">
                No social media posts available. Click "Fetch Live Twitter Data" to load real tweets.
              </p>
            ) : (
              allPosts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">@{post.username}</span>
                      <Badge className={getPlatformColor(post.platform)}>
                        {post.platform}
                      </Badge>
                      {post.verified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at))} ago
                    </span>
                  </div>
                  
                  <p className="text-sm mb-3">{post.post_content}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.disaster_keywords?.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      {post.location_extracted ? (
                        <span>📍 {post.location_extracted}</span>
                      ) : (
                        <span className="text-gray-400">📍 Location not extracted</span>
                      )}
                    </div>
                    
                    {!post.location_extracted && (
                      <Button
                        onClick={() => handleExtractLocation(post.id, post.post_content)}
                        disabled={extractingLocation === post.id}
                        variant="outline"
                        size="sm"
                      >
                        {extractingLocation === post.id ? 'Extracting...' : 'Extract Location'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SocialMediaFeed;
