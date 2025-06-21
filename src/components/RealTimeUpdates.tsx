
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const RealTimeUpdates = ({ reports, disasters }) => {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    // Combine reports and disasters into a unified feed
    const allUpdates = [
      ...reports.map(report => ({
        ...report,
        type: "report",
        title: disasters.find(d => d.id === parseInt(report.disasterId))?.title || "Unknown Disaster"
      })),
      ...disasters.map(disaster => ({
        ...disaster,
        type: "disaster",
        description: `New disaster event: ${disaster.description.substring(0, 100)}...`
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setUpdates(allUpdates);
  }, [reports, disasters]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newUpdate = {
        id: Math.random(),
        type: "status",
        title: "System Update",
        description: "Emergency services are coordinating response efforts. Stay tuned for more updates.",
        timestamp: new Date().toISOString(),
        verified: true
      };
      
      setUpdates(prev => [newUpdate, ...prev.slice(0, 19)]); // Keep only 20 most recent
    }, 30000); // Add update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getUpdateIcon = (type, verified) => {
    if (type === "disaster") return "🚨";
    if (type === "report") return verified ? "✅" : "📋";
    return "📡";
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case "disaster": return "border-l-red-500 bg-red-50";
      case "report": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-green-500 bg-green-50";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-indigo-50">
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          📡 Real-Time Updates
        </CardTitle>
        <CardDescription>
          Live feed of disaster reports and system updates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-6">
          <div className="space-y-4">
            {updates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No updates available.</p>
            ) : (
              updates.map((update) => (
                <div
                  key={update.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getUpdateColor(update.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getUpdateIcon(update.type, update.verified)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{update.title}</h4>
                        {update.verified && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 mb-2 line-clamp-3">
                        {update.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(update.timestamp))} ago
                      </p>
                    </div>
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

export default RealTimeUpdates;
