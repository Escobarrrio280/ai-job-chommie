import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Edit, Bell, Shield, HelpCircle, Star, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  const menuItems = [
    { icon: Edit, label: t("editProfile"), href: "/profile" },
    { icon: Bell, label: t("notificationSettings"), href: "/settings" },
    { icon: Shield, label: t("businessVerification"), href: "/settings" },
    { icon: HelpCircle, label: t("helpSupport"), href: "/settings" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("profile")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Info */}
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-sa-gold text-sa-green text-2xl">
                <Building className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-medium text-lg">
              {profile?.businessName || `${user?.firstName} ${user?.lastName}`.trim() || "Business Name"}
            </h3>
            
            {profile?.registrationNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {profile.registrationNumber}
              </p>
            )}
            
            <div className="flex justify-center gap-2 flex-wrap">
              {profile?.isVerified && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t("verified")}
                </Badge>
              )}
              {profile?.cidbGrading && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {profile.cidbGrading}
                </Badge>
              )}
              {profile?.bbbeeLevel && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {profile.bbbeeLevel}
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-sa-green dark:text-sa-gold">
                  {stats.matchingTenders}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("matches")}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-sa-green dark:text-sa-gold">
                  {stats.savedTenders}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("saved")}
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg touch-target"
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = "/api/logout";
            }}
          >
            {t("logout")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
