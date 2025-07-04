import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Download, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TenderData, TenderMatch } from "@/types/tender";
import { format } from "date-fns";

interface TenderCardProps {
  tender: TenderData;
  match?: TenderMatch;
  isMatch?: boolean;
}

export default function TenderCard({ tender, match, isMatch = false }: TenderCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedStatus } = useQuery({
    queryKey: [`/api/saved/${tender.id}/status`],
    enabled: !!tender.id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedStatus?.isSaved) {
        await apiRequest("DELETE", `/api/saved/${tender.id}`);
      } else {
        await apiRequest("POST", `/api/saved/${tender.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: [`/api/saved/${tender.id}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        description: savedStatus?.isSaved ? t("tenderUnsaved") : t("tenderSaved"),
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const viewMutation = useMutation({
    mutationFn: async () => {
      if (isMatch && !match?.isViewed) {
        await apiRequest("POST", `/api/matches/${tender.id}/view`);
      }
    },
    onSuccess: () => {
      if (isMatch) {
        queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      }
    },
  });

  const handleView = () => {
    viewMutation.mutate();
    // Here you would typically navigate to a detailed view
    if (tender.documentUrl) {
      window.open(tender.documentUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (tender.documentUrl) {
      window.open(tender.documentUrl, '_blank');
    }
  };

  const getMatchPriority = (score?: number) => {
    if (!score) return "low";
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-green-500";
      case "medium": return "border-yellow-400";
      default: return "border-gray-300";
    }
  };

  const formatCurrency = (value?: string) => {
    if (!value) return "";
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `R${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `R${(num / 1000).toFixed(0)}K`;
    }
    return `R${num.toLocaleString()}`;
  };

  const formatClosingDate = (date?: string) => {
    if (!date) return "";
    return format(new Date(date), "dd MMM yyyy");
  };

  const getDaysUntilClosing = (date?: string) => {
    if (!date) return null;
    const closingDate = new Date(date);
    const today = new Date();
    const diffTime = closingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const priority = getMatchPriority(match?.matchScore);
  const daysUntilClosing = getDaysUntilClosing(tender.closingDate);
  const isClosingSoon = daysUntilClosing !== null && daysUntilClosing <= 7;

  return (
    <Card className={`bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor(priority)} shadow-sm mt-2`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {match?.matchScore && (
                <Badge
                  variant={priority === "high" ? "default" : priority === "medium" ? "secondary" : "outline"}
                  className={
                    priority === "high"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : priority === "medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }
                >
                  {t("highMatch", { score: match.matchScore })}
                </Badge>
              )}
              {isClosingSoon && (
                <Badge variant="destructive" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  {t("closesSoon")}
                </Badge>
              )}
              {!match?.isViewed && isMatch && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {t("newTender")}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 leading-tight text-sm sm:text-base">
              {tender.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {tender.department}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full touch-target"
          >
            {savedStatus?.isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-sa-gold" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span>
            {tender.valueMin && tender.valueMax
              ? `${formatCurrency(tender.valueMin)} - ${formatCurrency(tender.valueMax)}`
              : tender.valueMin
              ? `From ${formatCurrency(tender.valueMin)}`
              : "Value not specified"}
          </span>
          {tender.closingDate && (
            <span>{t("closingDate", { date: formatClosingDate(tender.closingDate) })}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {tender.cidbRequired && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
              {tender.cidbRequired}
            </Badge>
          )}
          {tender.category && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
              {tender.category}
            </Badge>
          )}
          {tender.province && (
            <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs">
              {tender.province}
            </Badge>
          )}
          {tender.bbbeeRequired && (
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
              {tender.bbbeeRequired}
            </Badge>
          )}
        </div>

        {match?.matchReasons && match.matchReasons.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Match reasons:</p>
            <div className="text-xs text-green-700 dark:text-green-300">
              {match.matchReasons.slice(0, 2).join(" • ")}
              {match.matchReasons.length > 2 && " • ..."}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleView}
            className="flex-1 bg-sa-green hover:bg-sa-green-light text-white dark:bg-sa-green dark:hover:bg-sa-green-light text-sm font-medium"
            disabled={viewMutation.isPending}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("viewDetails")}
          </Button>
          {tender.documentUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="px-3 border-sa-green text-sa-green hover:bg-sa-green hover:text-white dark:border-sa-green dark:text-sa-green dark:hover:bg-sa-green dark:hover:text-white touch-target"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
