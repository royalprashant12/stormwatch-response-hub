
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const DisasterList = ({ disasters }) => {
  const [filter, setFilter] = useState("");

  const filteredDisasters = disasters.filter(disaster =>
    disaster.tags.some(tag => 
      tag.toLowerCase().includes(filter.toLowerCase())
    ) || disaster.title.toLowerCase().includes(filter.toLowerCase()) ||
    disaster.location.toLowerCase().includes(filter.toLowerCase())
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          📋 Active Disasters
        </CardTitle>
        <CardDescription>
          Current disaster situations requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <Input
            placeholder="Filter by tag or location..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredDisasters.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No disasters found matching your filter.</p>
          ) : (
            filteredDisasters.map((disaster) => (
              <div
                key={disaster.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{disaster.title}</h3>
                  <Badge className={getSeverityColor(disaster.severity)}>
                    {disaster.severity}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-2">📍 {disaster.location}</p>
                <p className="text-sm text-gray-700 mb-3">{disaster.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {disaster.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(disaster.timestamp))} ago
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisasterList;
