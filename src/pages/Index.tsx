
import { useState } from "react";
import DisasterForm from "../components/DisasterForm";
import DisasterList from "../components/DisasterList";
import ReportForm from "../components/ReportForm";
import ResourceFinder from "../components/ResourceFinder";
import RealTimeUpdates from "../components/RealTimeUpdates";

const Index = () => {
  const [disasters, setDisasters] = useState([
    {
      id: 1,
      title: "Hurricane Maria Aftermath",
      location: "Puerto Rico",
      description: "Category 4 hurricane causing widespread flooding and power outages across the island.",
      tags: ["hurricane", "flooding", "power-outage"],
      timestamp: "2024-06-20T10:30:00Z",
      severity: "critical"
    },
    {
      id: 2,
      title: "Wildfire Emergency",
      location: "Northern California",
      description: "Fast-moving wildfire threatening residential areas and forcing evacuations.",
      tags: ["wildfire", "evacuation", "air-quality"],
      timestamp: "2024-06-20T08:15:00Z",
      severity: "high"
    }
  ]);

  const [reports, setReports] = useState([
    {
      id: 1,
      disasterId: 1,
      description: "Power lines down on Main Street, blocking traffic",
      timestamp: "2024-06-20T11:45:00Z",
      verified: true
    },
    {
      id: 2,
      disasterId: 1,
      description: "Emergency shelter set up at Community Center",
      timestamp: "2024-06-20T11:30:00Z",
      verified: true
    }
  ]);

  const addDisaster = (disaster) => {
    const newDisaster = {
      ...disaster,
      id: disasters.length + 1,
      timestamp: new Date().toISOString(),
      severity: "moderate"
    };
    setDisasters([newDisaster, ...disasters]);
  };

  const addReport = (report) => {
    const newReport = {
      ...report,
      id: reports.length + 1,
      timestamp: new Date().toISOString(),
      verified: false
    };
    setReports([newReport, ...reports]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌪️</div>
            <h1 className="text-3xl font-bold">Disaster Response Platform</h1>
          </div>
          <p className="text-red-100 mt-2">Coordinating emergency response and relief efforts</p>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* Disaster Creation */}
          <div className="lg:col-span-1">
            <DisasterForm onSubmit={addDisaster} />
          </div>

          {/* Disaster List */}
          <div className="lg:col-span-1">
            <DisasterList disasters={disasters} />
          </div>

          {/* Real-time Updates */}
          <div className="lg:col-span-1 xl:row-span-2">
            <RealTimeUpdates reports={reports} disasters={disasters} />
          </div>

          {/* Report Submission */}
          <div className="lg:col-span-1">
            <ReportForm disasters={disasters} onSubmit={addReport} />
          </div>

          {/* Resource Finder */}
          <div className="lg:col-span-1">
            <ResourceFinder disasters={disasters} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Disaster Response Platform. Coordinating relief efforts worldwide.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
