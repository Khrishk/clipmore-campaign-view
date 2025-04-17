
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Campaign, Clip, CampaignViewHistory, publicApi, formatNumber } from "@/types/campaign";
import MetricChart from "@/components/dashboard/MetricChart";
import ClipCarousel from "@/components/dashboard/ClipCarousel";
import { ArrowLeft, ExternalLink, Server, Music, Calendar } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const CampaignView = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignHistory, setCampaignHistory] = useState<CampaignViewHistory | undefined>(undefined);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchCampaignHistory = useCallback(async (days: number = 30) => {
    if (!id) return;

    try {
      setChartLoading(true);
      setTimeRange(days);
      const history = await publicApi.getCampaignViewHistory(id, days);
      setCampaignHistory(history);
    } catch (error) {
      console.error("Failed to fetch campaign history:", error);
    } finally {
      setChartLoading(false);
    }
  }, [id]);

  // Function to set dummy data if loading takes too long
  const setDummyData = useCallback(() => {
    const dummyId = id || 'demo-123';
    
    // Create dummy campaign data
    const dummyCampaign: Campaign = {
      id: dummyId,
      name: "PinkPantheress Campaign",
      description: "Official music promotion campaign for PinkPantheress latest releases.",
      startDate: "2023-04-01",
      endDate: "2023-04-30",
      status: "COMPLETED",
      totalViews: 10000000,
      clipCount: 27,
      totalLikes: 1200000,
      totalComments: 350000,
      serverUrl: "https://discord.gg/pinkpantheress",
      imageUrl: "https://lovable.dev/api/mockimage/artist/1.jpg"
    };
    
    // Create dummy clips
    const dummyClips: Clip[] = Array.from({ length: 12 }, (_, i) => ({
      id: `clip-${i}`,
      url: `https://tiktok.com/@user/video/${i}`,
      thumbnailUrl: `https://lovable.dev/api/mockimage/clip/${i + 1}.jpg`,
      views: Math.floor(Math.random() * 1000000) + 100000,
      likes: Math.floor(Math.random() * 200000) + 10000,
      comments: Math.floor(Math.random() * 50000) + 5000,
      status: "APPROVED",
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      ClipModeration: {
        status: "APPROVED"
      }
    }));
    
    // Create dummy history data
    const dates: string[] = [];
    const views: number[] = [];
    const likes: number[] = [];
    const comments: number[] = [];
    
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - timeRange);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0]);
      views.push(Math.floor(Math.random() * 500000) + 100000);
      likes.push(Math.floor(Math.random() * 100000) + 10000);
      comments.push(Math.floor(Math.random() * 30000) + 5000);
    }
    
    const dummyHistory: CampaignViewHistory = { dates, views, likes, comments };
    
    // Set the dummy data
    setCampaign(dummyCampaign);
    setClips(dummyClips);
    setCampaignHistory(dummyHistory);
    setLoading(false);
    setError(null);
    
    toast.info("Using placeholder data for demonstration");
  }, [id, timeRange]);

  useEffect(() => {
    if (id) {
      const fetchCampaign = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Set a timeout to display dummy data if real data takes too long
          const timeout = setTimeout(() => {
            if (loading) {
              setDummyData();
            }
          }, 3000); // Show dummy data after 3 seconds if real data hasn't loaded
          setLoadingTimeout(timeout);
          
          const campaignData = await publicApi.getCampaign(id);
          setCampaign(campaignData);

          const clipsData = await publicApi.getClipsByCampaign(id);
          // Sort by views (highest first)
          const sortedClips = [...clipsData].sort((a, b) => b.views - a.views);
          setClips(sortedClips);

          // Fetch campaign history
          fetchCampaignHistory();
          
          // Clear the timeout if we successfully loaded real data
          clearTimeout(timeout);
          setLoadingTimeout(null);
        } catch (error) {
          console.error("Failed to fetch campaign data:", error);
          setError("Unable to load campaign information. The campaign may be private or no longer exist.");
          setDummyData(); // Use dummy data on error
        } finally {
          setLoading(false);
        }
      };

      fetchCampaign();
    } else {
      // If no ID provided, use dummy data immediately
      setDummyData();
    }
    
    // Cleanup timeout on component unmount
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [id, fetchCampaignHistory, setDummyData, loadingTimeout, loading]);

  const getDateRange = () => {
    if (!campaign) return "";
    const start = new Date(campaign.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(campaign.endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  // Transform data for charts
  const transformChartData = (type: 'views' | 'likes' | 'comments') => {
    if (!campaignHistory) return [];
    return campaignHistory.dates.map((date, index) => ({
      date,
      value: campaignHistory[type][index]
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>

        <Skeleton className="h-[400px] rounded-lg mb-8" />
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Campaign Not Available</h1>
        <p className="text-gray-500 mb-8">{error || "Campaign not found"}</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  // Determine campaign status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PAUSED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Campaign Image */}
            {campaign.imageUrl ? (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 border-4 border-white/20 shadow-xl">
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-indigo-700 flex items-center justify-center flex-shrink-0 border-4 border-white/20 shadow-xl">
                <Music className="w-12 h-12 text-white/70" />
              </div>
            )}
            
            {/* Campaign Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">{campaign.name}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white">
                      {campaign.status.toLowerCase().charAt(0).toUpperCase() + campaign.status.toLowerCase().slice(1)}
                    </Badge>
                    <div className="flex items-center text-white/80 text-sm">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {getDateRange()}
                    </div>
                  </div>
                </div>
                
                {campaign.serverUrl && (
                  <Button 
                    size="sm"
                    variant="secondary"
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white border-none"
                    onClick={() => window.open(campaign.serverUrl, '_blank')}
                  >
                    <FaDiscord className="h-4 w-4" />
                    Join Discord
                    <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
                  </Button>
                )}
              </div>
              
              {campaign.description && (
                <p className="text-white/80 mt-2 max-w-3xl">{campaign.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">{formatNumber(campaign.totalViews)}</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">{formatNumber(campaign.totalLikes)}</h3>
                </div>
                <div className="p-2 bg-pink-100 rounded-full">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">{formatNumber(campaign.totalComments)}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clips</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">{campaign.clipCount}</h3>
                </div>
                <div className="p-2 bg-emerald-100 rounded-full">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricChart
            title="Views Over Time"
            data={transformChartData('views')}
            color="#8B5CF6" // Purple
            loading={chartLoading}
            onTimeRangeChange={fetchCampaignHistory}
            currentTimeRange={timeRange}
          />
          
          <MetricChart
            title="Likes Over Time"
            data={transformChartData('likes')}
            color="#EC4899" // Pink
            loading={chartLoading}
            onTimeRangeChange={fetchCampaignHistory}
            currentTimeRange={timeRange}
          />
          
          <MetricChart
            title="Comments Over Time"
            data={transformChartData('comments')}
            color="#3B82F6" // Blue
            loading={chartLoading}
            onTimeRangeChange={fetchCampaignHistory}
            currentTimeRange={timeRange}
          />
        </div>

        {/* Top Performing Clips Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">Top Performing Clips</h2>
          </div>
          
          <ClipCarousel clips={clips} loading={loading} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ClipMore. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CampaignView;
