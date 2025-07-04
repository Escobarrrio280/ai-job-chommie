import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Filter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import TenderCard from "@/components/TenderCard";
import BottomNavigation from "@/components/BottomNavigation";
import { TenderMatch } from "@/types/tender";

export default function Matches() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "new">("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, toast]);

  const { data: matches = [], isLoading, error } = useQuery<TenderMatch[]>({
    queryKey: ["/api/matches", { limit: 100 }],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const filteredMatches = matches.filter((match) => {
    switch (filter) {
      case "high":
        return (match.matchScore || 0) >= 80;
      case "medium":
        return (match.matchScore || 0) >= 60 && (match.matchScore || 0) < 80;
      case "new":
        return !match.isViewed;
      default:
        return true;
    }
  });

  const getMatchStats = () => {
    const high = matches.filter(m => (m.matchScore || 0) >= 80).length;
    const medium = matches.filter(m => (m.matchScore || 0) >= 60 && (m.matchScore || 0) < 80).length;
    const newMatches = matches.filter(m => !m.isViewed).length;
    const total = matches.length;
    
    return { high, medium, newMatches, total };
  };

  const stats = getMatchStats();

  const filterButtons = [
    { key: "all", label: "All", count: stats.total },
    { key: "high", label: "High Match", count: stats.high },
    { key: "medium", label: "Medium Match", count: stats.medium },
    { key: "new", label: "New", count: stats.newMatches },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6 text-sa-gold" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("matches")}
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Match Statistics */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-sa-green dark:text-sa-gold" />
              <h2 className="font-medium">Match Overview</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-sa-green dark:text-sa-gold">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.high}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">High Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.medium}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Medium Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.newMatches}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">New</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {filterButtons.map((filterBtn) => (
            <Button
              key={filterBtn.key}
              variant={filter === filterBtn.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterBtn.key as typeof filter)}
              className={`flex-shrink-0 ${
                filter === filterBtn.key
                  ? "bg-sa-green hover:bg-sa-green-light text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {filterBtn.label}
              {filterBtn.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                  {filterBtn.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Matches List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="flex gap-2 mb-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {filter === "all" ? t("noMatches") : `No ${filterButtons.find(f => f.key === filter)?.label} matches`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filter === "all" 
                ? "Complete your business profile to get better matches"
                : "Try a different filter to see more matches"
              }
            </p>
            {filter !== "all" && (
              <Button
                variant="outline"
                onClick={() => setFilter("all")}
                className="border-sa-green text-sa-green hover:bg-sa-green hover:text-white"
              >
                View All Matches
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMatches.map((match) => (
              <TenderCard
                key={match.id}
                tender={match.tender}
                match={match}
                isMatch={true}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
