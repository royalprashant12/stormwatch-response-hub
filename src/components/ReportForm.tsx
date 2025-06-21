
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ReportForm = ({ disasters, onSubmit }) => {
  const [formData, setFormData] = useState({
    disasterId: "",
    description: "",
    imageUrl: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.disasterId || !formData.description) {
      toast({
        title: "Error",
        description: "Please select a disaster and provide a description",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    setFormData({ disasterId: "", description: "", imageUrl: "" });
    
    toast({
      title: "Success",
      description: "Report submitted successfully. It will be verified by our team.",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-green-700">
          📝 Submit Field Report
        </CardTitle>
        <CardDescription>
          Report what you're seeing on the ground
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
                    {disaster.title} - {disaster.location}
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
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Submit Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
