import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import TenderCard from "@/components/TenderCard";
import FilterModal from "@/components/FilterModal";
import ProfileModal from "@/components/ProfileModal";
import LanguageModal from "@/components/LanguageModal";
import BottomNavigation from "@/components/BottomNavigation";
import { TenderData, TenderFilters, Stats } from "@/types/tender";

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TenderFilters>({ status: "active", limit: 20 });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // Stats query
  const { data: stats, error: statsError } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle stats unauthorized error
  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, toast]);

  // Tenders query
  const { data: tenders = [], isLoading, error: tendersError, fetchNextPage, hasNextPage } = useQuery<TenderData[]>({
    queryKey: ["/api/tenders", { ...filters, search: searchQuery }],
    retry: false,
  });

  // Handle tenders unauthorized error
  useEffect(() => {
    if (tendersError && isUnauthorizedError(tendersError as Error)) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [tendersError, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch when searchQuery changes
  };

  const handleFilterChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }));
  };

  const quickFilters = [
    { key: "active", label: t("activeTenders") },
    { key: "construction", label: t("construction"), category: "Construction" },
    { key: "itServices", label: t("itServices"), category: "Technology" },
    { key: "matches", label: t("myMatches") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-sa-green dark:bg-sa-green text-white shadow-md sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sa-gold rounded-full flex items-center justify-center">
                <Search className="h-5 w-5 text-sa-green" />
              </div>
              <h1 className="text-lg font-medium">{t("appName")}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageModal(true)}
                className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors touch-target"
              >
                <span className="text-sm">🌐</span>
              </Button>
              <Button
                variant="ghost"
                size="sm" 
                onClick={() => setShowProfileModal(true)}
                className="p-2 rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors touch-target"
              >
                <span className="text-sm">👤</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sa-green focus:border-transparent outline-none bg-white dark:bg-gray-700"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </form>
          
          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {quickFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={
                  (filter.category && filters.category === filter.category) ||
                  (filter.key === "active" && filters.status === "active") ||
                  (filter.key === "matches" && filters.category === "matches")
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  if (filter.category) {
                    handleFilterChange(filter.category);
                  } else if (filter.key === "matches") {
                    // This would typically navigate to matches page
                    window.location.href = "/matches";
                  }
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                  (filter.category && filters.category === filter.category) ||
                  (filter.key === "active" && filters.status === "active")
                    ? "bg-sa-green text-white hover:bg-sa-green-light"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Summary */}
      {stats && (
        <section className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sa-green dark:text-sa-gold">
                {stats.activeTenders.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("activeTendersCount")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sa-gold">
                {stats.matchingTenders.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("yourMatches")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {stats.savedTenders.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("savedTenders")}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tender Results */}
      <main className="p-4">
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
        ) : tenders.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("noTenders")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tenders.map((tender) => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
            
            {hasNextPage && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  className="w-full py-3 text-sa-green border-sa-green hover:bg-sa-green hover:text-white font-medium"
                >
                  {t("loadMore")}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowFilterModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-sa-green hover:bg-sa-green-light text-white rounded-full shadow-lg z-30 touch-target"
      >
        <Music2 className="h-6 w-6" />
      </Button>

      {/* Modals */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      
      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
