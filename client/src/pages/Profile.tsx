import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";
import { BusinessProfile } from "@/types/tender";
import { Building, Shield, CheckCircle, AlertCircle } from "lucide-react";

const profileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  registrationNumber: z.string().optional(),
  cidbGrading: z.string().optional(),
  bbbeeLevel: z.string().optional(),
  industryCategories: z.array(z.string()).optional(),
  preferredValueMin: z.string().optional(),
  preferredValueMax: z.string().optional(),
  provinces: z.array(z.string()).optional(),
  phoneNumber: z.string().optional(),
  language: z.string().default("en"),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { t } = useTranslation();
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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: "",
      registrationNumber: "",
      cidbGrading: "",
      bbbeeLevel: "",
      industryCategories: [],
      preferredValueMin: "",
      preferredValueMax: "",
      provinces: [],
      phoneNumber: "",
      language: "en",
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        businessName: profile.businessName || "",
        registrationNumber: profile.registrationNumber || "",
        cidbGrading: profile.cidbGrading || "",
        bbbeeLevel: profile.bbbeeLevel || "",
        industryCategories: profile.industryCategories || [],
        preferredValueMin: profile.preferredValueMin || "",
        preferredValueMax: profile.preferredValueMax || "",
        provinces: profile.provinces || [],
        phoneNumber: profile.phoneNumber || "",
        language: profile.language || "en",
        emailNotifications: profile.emailNotifications ?? true,
        smsNotifications: profile.smsNotifications ?? false,
      });
    }
  }, [profile, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        description: t("profileSaved"),
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
        description: t("errorSavingProfile"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    saveMutation.mutate(data);
  };

  const industries = [
    "Construction",
    "Technology", 
    "Professional Services",
    "Fleet",
    "Facilities Management",
    "Energy",
    "Office Supplies",
    "Healthcare",
    "Education",
    "Security Services",
  ];

  const provinces = [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal", 
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
    "National",
  ];

  const cidbGrades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const bbbeelevels = [
    "Level 1", "Level 2", "Level 3", "Level 4",
    "Level 5", "Level 6", "Level 7", "Level 8"
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
            <Building className="h-6 w-6 text-sa-green dark:text-sa-gold" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("profile")}
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Profile Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Business Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {profile?.isVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {t("verified")}
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {t("unverified")}
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("businessProfile")}</CardTitle>
            <CardDescription>
              Complete your business profile to get better tender matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div>
                  <Label htmlFor="businessName">{t("businessName")} *</Label>
                  <Input
                    id="businessName"
                    {...form.register("businessName")}
                    className="mt-1"
                  />
                  {form.formState.errors.businessName && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="registrationNumber">{t("registrationNumber")}</Label>
                  <Input
                    id="registrationNumber"
                    {...form.register("registrationNumber")}
                    className="mt-1"
                    placeholder="e.g., 2019/123456/07"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...form.register("phoneNumber")}
                    className="mt-1"
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>
              </div>

              <Separator />

              {/* Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Certifications</h3>
                
                <div>
                  <Label htmlFor="cidbGrading">{t("cidbGrading")}</Label>
                  <Select
                    value={form.watch("cidbGrading")}
                    onValueChange={(value) => form.setValue("cidbGrading", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select CIDB Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cidbGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bbbeeLevel">{t("bbbeeLevel")}</Label>
                  <Select
                    value={form.watch("bbbeeLevel")}
                    onValueChange={(value) => form.setValue("bbbeeLevel", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select B-BBEE Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {bbbeelevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Business Capabilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Capabilities</h3>
                
                <div>
                  <Label>{t("industryCategories")}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {industries.map((industry) => (
                      <label key={industry} className="flex items-center space-x-2">
                        <Checkbox
                          checked={form.watch("industryCategories")?.includes(industry)}
                          onCheckedChange={(checked) => {
                            const current = form.watch("industryCategories") || [];
                            if (checked) {
                              form.setValue("industryCategories", [...current, industry]);
                            } else {
                              form.setValue("industryCategories", current.filter(i => i !== industry));
                            }
                          }}
                        />
                        <span className="text-sm">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredValueMin">Min Value (R)</Label>
                    <Input
                      id="preferredValueMin"
                      type="number"
                      {...form.register("preferredValueMin")}
                      className="mt-1"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredValueMax">Max Value (R)</Label>
                    <Input
                      id="preferredValueMax"
                      type="number"
                      {...form.register("preferredValueMax")}
                      className="mt-1"
                      placeholder="10000000"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t("provinces")}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {provinces.map((province) => (
                      <label key={province} className="flex items-center space-x-2">
                        <Checkbox
                          checked={form.watch("provinces")?.includes(province)}
                          onCheckedChange={(checked) => {
                            const current = form.watch("provinces") || [];
                            if (checked) {
                              form.setValue("provinces", [...current, province]);
                            } else {
                              form.setValue("provinces", current.filter(p => p !== province));
                            }
                          }}
                        />
                        <span className="text-sm">{province}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.watch("emailNotifications")}
                    onCheckedChange={(checked) => form.setValue("emailNotifications", !!checked)}
                  />
                  <span>{t("emailNotifications")}</span>
                </label>

                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.watch("smsNotifications")}
                    onCheckedChange={(checked) => form.setValue("smsNotifications", !!checked)}
                  />
                  <span>{t("smsNotifications")}</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full bg-sa-green hover:bg-sa-green-light text-white"
              >
                {saveMutation.isPending ? "Saving..." : t("saveProfile")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
