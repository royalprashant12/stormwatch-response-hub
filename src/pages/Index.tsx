
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DisasterForm from "../components/DisasterForm";
import DisasterList from "../components/DisasterList";
import ReportForm from "../components/ReportForm";
import ResourceFinder from "../components/ResourceFinder";
import RealTimeUpdates from "../components/RealTimeUpdates";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [disasters, setDisasters] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch disasters from Supabase
  const fetchDisasters = async () => {
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDisasters(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load disasters",
        variant: "destructive"
      });
    }
  };

  // Fetch reports from Supabase
  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDisasters(), fetchReports()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Add new disaster to Supabase
  const addDisaster = async (disaster) => {
    try {
      const { data, error } = await supabase
        .from('disasters')
        .insert([{
          title: disaster.title,
          location: disaster.location,
          description: disaster.description,
          tags: disaster.tags,
          severity: disaster.severity || 'moderate',
          verified: false
        }])
        .select()
        .single();

      if (error) throw error;
      
      setDisasters(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Disaster created and saved to database",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save disaster to database",
        variant: "destructive"
      });
    }
  };

  // Add new report to Supabase
  const addReport = async (report) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          disaster_id: parseInt(report.disasterId),
          description: report.description,
          image_url: report.imageUrl,
          verified: false
        }])
        .select()
        .single();

      if (error) throw error;
      
      setReports(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Report submitted and saved to database",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save report to database",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading disasters and reports...</div>
      </div>
    );
  }

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
