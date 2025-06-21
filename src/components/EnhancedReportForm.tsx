
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { extractLocation, verifyImage } from "@/utils/geminiApi";

interface EnhancedReportFormProps {
  disasters: any[];
  onSubmit: (report: any) => void;
}

const EnhancedReportForm = ({ disasters, onSubmit }: EnhancedReportFormProps) => {
  const [formData, setFormData] = useState({
    disasterId: "",
    description: "",
    imageUrl: ""
  });
  const [extractedLocation, setExtractedLocation] = useState<string>("");
  const [imageVerification, setImageVerification] = useState<any>(null);
  const [loading, setLoading] = useState({
    location: false,
    image: false
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.disasterId || !formData.description) {
      toast({
        title: "Error",
        description: "Please select a disaster and provide a description",
        variant: "destructive"
      });
      return;
    }

    const enhancedReport = {
      ...formData,
      extractedLocation,
      imageVerification
    };

    onSubmit(enhancedReport);
    setFormData({ disasterId: "", description: "", imageUrl: "" });
    setExtractedLocation("");
    setImageVerification(null);
  };

  const handleExtractLocation = async () => {
    if (!formData.description) {
      toast({
        title: "Error",
        description: "Please enter a description first",
        variant: "destructive"
      });
      return;
    }

    setLoading({ ...loading, location: true });
    try {
      const location = await extractLocation(formData.description);
      setExtractedLocation(location);
      toast({
        title: "Success",
        description: `Location extracted: ${location}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract location",
        variant: "destructive"
      });
    } finally {
      setLoading({ ...loading, location: false });
    }
  };

  const handleVerifyImage = async () => {
    if (!formData.imageUrl) {
      toast({
        title: "Error",
        description: "Please enter an image URL first",
        variant: "destructive"
      });
      return;
    }

    setLoading({ ...loading, image: true });
    try {
      const verification = await verifyImage(formData.imageUrl);
      setImageVerification(verification);
      toast({
        title: "Image Verified",
        description: `Confidence: ${verification.confidence}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify image",
        variant: "destructive"
      });
    } finally {
      setLoading({ ...loading, image: false });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-green-700">
          📝 Enhanced Field Report
        </CardTitle>
        <CardDescription>
          Report with AI-powered location extraction and image verification
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="disasterId">Related Disaster *</Label>
            <Select value={formData.disasterId} onValueChange={(value) => setFormData({...formData, disasterId: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a disaster event" />
              </SelectTrigger>
              <SelectContent>
                {disasters.map((disaster) => (
                  <SelectItem key={disaster.id} value={disaster.id.toString()}>
                    {disaster.title} - {disaster.location_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">What's happening? *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you're observing..."
              className="mt-1 min-h-20"
            />
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                onClick={handleExtractLocation}
                disabled={loading.location}
                variant="outline"
                size="sm"
              >
                {loading.location ? 'Extracting...' : 'Extract Location'}
              </Button>
              {extractedLocation && (
                <Badge variant="secondary">📍 {extractedLocation}</Badge>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                onClick={handleVerifyImage}
                disabled={loading.image}
                variant="outline"
                size="sm"
              >
                {loading.image ? 'Verifying...' : 'Verify Image'}
              </Button>
              {imageVerification && (
                <Badge 
                  variant={imageVerification.isAuthentic ? "default" : "destructive"}
                >
                  {imageVerification.isAuthentic ? '✅ Authentic' : '❌ Suspicious'} 
                  ({imageVerification.confidence}%)
                </Badge>
              )}
            </div>
            {imageVerification && (
              <p className="text-xs text-gray-600 mt-1">
                {imageVerification.analysis}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Submit Enhanced Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedReportForm;
