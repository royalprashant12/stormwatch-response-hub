
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ResourceFinder = ({ disasters }) => {
  const [formData, setFormData] = useState({
    disasterId: "",
    latitude: "",
    longitude: ""
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock resources data
  const mockResources = [
    {
      id: 1,
      name: "Emergency Shelter - Community Center",
      type: "shelter",
      distance: "0.8 km",
      address: "123 Main St",
      contact: "(555) 123-4567",
      capacity: "200 people",
      status: "open"
    },
    {
      id: 2,
      name: "Medical Station - General Hospital",
      type: "medical",
      distance: "1.2 km",
      address: "456 Health Ave",
      contact: "(555) 987-6543",
      capacity: "50 beds available",
      status: "open"
    },
    {
      id: 3,
      name: "Supply Distribution - Red Cross",
      type: "supplies",
      distance: "2.1 km",
      address: "789 Relief Blvd",
      contact: "(555) 456-7890",
      capacity: "Food & water available",
      status: "limited"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.disasterId || !formData.latitude || !formData.longitude) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResources(mockResources);
      setLoading(false);
      toast({
        title: "Success",
        description: "Found nearby resources for your location",
      });
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "shelter": return "🏠";
      case "medical": return "🏥";
      case "supplies": return "📦";
      default: return "📍";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "limited": return "bg-yellow-100 text-yellow-800";
      case "closed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="bg-purple-50">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          🏥 Find Nearby Resources
        </CardTitle>
        <CardDescription>
          Locate emergency services and supplies near you
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="disasterId">Related Disaster</Label>
            <Select value={formData.disasterId} onValueChange={(value) => setFormData({...formData, disasterId: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select disaster event" />
              </SelectTrigger>
              <SelectContent>
                {disasters.map((disaster) => (
                  <SelectItem key={disaster.id} value={disaster.id.toString()}>
                    {disaster.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="18.4655"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="-66.1057"
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
            {loading ? "Searching..." : "Find Resources"}
          </Button>
        </form>

        {resources.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Nearby Resources</h3>
            {resources.map((resource) => (
              <div key={resource.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getResourceIcon(resource.type)}</span>
                    <h4 className="font-medium text-sm">{resource.name}</h4>
                  </div>
                  <Badge className={getStatusColor(resource.status)} variant="outline">
                    {resource.status}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600 mb-1">📍 {resource.address}</p>
                <p className="text-xs text-gray-600 mb-1">📞 {resource.contact}</p>
                <p className="text-xs text-gray-600 mb-1">📏 {resource.distance} away</p>
                <p className="text-xs font-medium text-gray-700">{resource.capacity}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceFinder;
