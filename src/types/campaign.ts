
// Campaign types for our application
export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  totalViews: number;
  clipCount: number;
  totalLikes: number;
  totalComments: number;
  serverUrl?: string;
  imageUrl?: string;
}

export interface Clip {
  id: string;
  url: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  comments: number;
  status: string;
  createdAt: string;
  ClipModeration?: {
    status: string;
  };
}

export interface ChartDataPoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
}

export interface CampaignViewHistory {
  dates: string[];
  views: number[];
  likes: number[];
  comments: number[];
}

export interface PublicApi {
  getCampaign: (id: string) => Promise<Campaign>;
  getClipsByCampaign: (id: string) => Promise<Clip[]>;
  getCampaignViewHistory: (id: string, timeRange?: number) => Promise<CampaignViewHistory>;
}

// This is a mock implementation for the demo
export const publicApi: PublicApi = {
  getCampaign: async (id: string): Promise<Campaign> => {
    // Mock data
    return {
      id,
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
  },
  
  getClipsByCampaign: async (id: string): Promise<Clip[]> => {
    // Mock clips data
    return Array.from({ length: 12 }, (_, i) => ({
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
  },
  
  getCampaignViewHistory: async (id: string, timeRange: number = 30): Promise<CampaignViewHistory> => {
    // Generate mock history data based on time range
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
    
    return { dates, views, likes, comments };
  }
};

// Helper functions for formatting numbers and currency
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
