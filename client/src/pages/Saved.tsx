import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Search, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import TenderCard from "@/components/TenderCard";
import BottomNavigation from "@/components/BottomNavigation";
import { SavedTender } from "@/types/tender";

export default function Saved() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "value" | "closing">("date");

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

  const { data: savedTenders = [], isLoading, error } = useQuery<SavedTender[]>({
    queryKey: ["/api/saved"],
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

  const filteredAndSortedTenders = savedTenders
    .filter((saved) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        saved.tender.title.toLowerCase().includes(query) ||
        saved.tender.department?.toLowerCase().includes(query) ||
        saved.tender.category?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "value":
          const aValue = parseFloat(a.tender.valueMax || "0");
          const bValue = parseFloat(b.tender.valueMax || "0");
          return bValue - aValue;
        case "closing":
          if (!a.tender.closingDate || !b.tender.closingDate) return 0;
          return new Date(a.tender.closingDate).getTime() - new Date(b.tender.closingDate).getTime();
        default:
          return 0;
      }
    });

  const getStatusCounts = () => {
    const active = savedTenders.filter(s => s.tender.status === "active").length;
    const closing = savedTenders.filter(s => {
      if (!s.tender.closingDate) return false;
      const daysUntilClosing = Math.ceil((new Date(s.tender.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilClosing <= 7 && daysUntilClosing >= 0;
    }).length;
    
    return { active, closing, total: savedTenders.length };
  };

  const stats = getStatusCounts();

  const sortOptions = [
    { key: "date", label: "Date Saved", icon: Calendar },
    { key: "value", label: "Value", icon: DollarSign },
    { key: "closing", label: "Closing Date", icon: Calendar },
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
            <Bookmark className="h-6 w-6 text-sa-gold" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("saved")}
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Status Overview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-sa-green dark:text-sa-gold">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Saved
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.closing}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Closing Soon
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Sort */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search saved tenders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.key}
                  variant={sortBy === option.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(option.key as typeof sortBy)}
                  className={`flex-shrink-0 ${
                    sortBy === option.key
                      ? "bg-sa-green hover:bg-sa-green-light text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Saved Tenders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedTenders.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? "No matching saved tenders" : t("noSavedTenders")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "Start saving tenders to track opportunities you're interested in"
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="border-sa-green text-sa-green hover:bg-sa-green hover:text-white"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedTenders.map((saved) => (
              <TenderCard
                key={saved.id}
                tender={saved.tender}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
