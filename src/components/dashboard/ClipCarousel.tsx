
import React from "react";
import { Clip, formatNumber } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ClipCarouselProps {
  clips: Clip[];
  loading: boolean;
}

const ClipCarousel: React.FC<ClipCarouselProps> = ({ clips, loading }) => {
  const filteredClips = clips.filter(
    (clip) => clip.status === "APPROVED" || clip.ClipModeration?.status === "APPROVED"
  );

  if (loading) {
    return (
      <div className="w-full rounded-md bg-muted/20 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-muted"></div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="aspect-[9/16] w-full rounded-md bg-muted"></div>
                <div className="h-3 w-full rounded-md bg-muted"></div>
                <div className="h-3 w-2/3 rounded-md bg-muted"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (filteredClips.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">
          No approved clips available for this campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md">
      <div className="mx-auto max-w-5xl">
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {filteredClips.map((clip) => (
                <CarouselItem key={clip.id} className="basis-full md:basis-1/5 pl-4">
                  <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="aspect-[9/16] relative w-full overflow-hidden bg-gray-100">
                      <img
                        src={clip.thumbnailUrl}
                        alt="Clip thumbnail"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://placehold.co/600x400/gray/white?text=No+Thumbnail";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                        <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
                          <PlayIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{formatNumber(clip.views)} views</span>
                        <div className="flex items-center gap-3">
                          <span>{formatNumber(clip.likes)} likes</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-2">
              <CarouselPrevious className="absolute -left-4 top-1/2" />
              <CarouselNext className="absolute -right-4 top-1/2" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default ClipCarousel;
