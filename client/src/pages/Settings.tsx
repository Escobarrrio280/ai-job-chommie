import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle, 
  User, 
  Mail, 
  Smartphone,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";
import { BusinessProfile } from "@/types/tender";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: profile, error: profileError } = useQuery<BusinessProfile>({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle profile unauthorized error
  useEffect(() => {
    if (profileError && isUnauthorizedError(profileError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [profileError, toast]);

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: { emailNotifications?: boolean; smsNotifications?: boolean }) => {
      await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        description: "Notification settings updated",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("preferred-language", languageCode);
    
    // Update profile language if we have a profile
    if (profile) {
      updateNotificationsMutation.mutate({ 
        ...profile,
        language: languageCode 
      });
    }
  };

  const handleNotificationToggle = (type: "email" | "sms", enabled: boolean) => {
    if (type === "email") {
      updateNotificationsMutation.mutate({
        emailNotifications: enabled,
        smsNotifications: profile?.smsNotifications,
      });
    } else {
      updateNotificationsMutation.mutate({
        emailNotifications: profile?.emailNotifications,
        smsNotifications: enabled,
      });
    }
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
    { code: "zu", name: "isiZulu", nativeName: "isiZulu" },
    { code: "xh", name: "isiXhosa", nativeName: "isiXhosa" },
    { code: "nso", name: "Sepedi", nativeName: "Sepedi" },
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
            <SettingsIcon className="h-6 w-6 text-sa-green dark:text-sa-gold" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("settings")}
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/profile"}
                className="border-sa-green text-sa-green hover:bg-sa-green hover:text-white"
              >
                Edit Profile
              </Button>
            </div>
            
            {profile && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Business:</span>
                  <span className="text-sm">{profile.businessName}</span>
                  {profile.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notificationSettings")}
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about new tender matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <Label htmlFor="email-notifications" className="text-base">
                    {t("emailNotifications")}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email alerts for high-priority matches
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={profile?.emailNotifications ?? true}
                onCheckedChange={(checked) => handleNotificationToggle("email", checked)}
                disabled={updateNotificationsMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-500" />
                <div>
                  <Label htmlFor="sms-notifications" className="text-base">
                    {t("smsNotifications")}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive SMS alerts for urgent opportunities
                  </p>
                </div>
              </div>
              <Switch
                id="sms-notifications"
                checked={profile?.smsNotifications ?? false}
                onCheckedChange={(checked) => handleNotificationToggle("sms", checked)}
                disabled={updateNotificationsMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("language")}
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={i18n.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex flex-col">
                      <span>{lang.name}</span>
                      <span className="text-sm text-gray-500">{lang.nativeName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Business Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("businessVerification")}
            </CardTitle>
            <CardDescription>
              Verify your business to improve tender matching accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile?.isVerified ? "Your business is verified" : "Business not yet verified"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {profile?.isVerified ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-orange-500" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-sa-green text-sa-green hover:bg-sa-green hover:text-white"
                    >
                      Verify Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {t("helpSupport")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open("https://support.tenderfind.co.za", "_blank")}
            >
              <span>Help Center</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open("mailto:support@tenderfind.co.za", "_blank")}
            >
              <span>Contact Support</span>
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
            >
              <span>User Guide</span>
              <Download className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                TenderFind SA v1.0.0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; 2024 TenderFind SA. All rights reserved.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Proudly South African 🇿🇦
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                window.location.href = "/api/logout";
              }}
            >
              {t("logout")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
