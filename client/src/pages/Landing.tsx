import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, Bell, Shield, Globe, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find tenders that match your business profile automatically",
    },
    {
      icon: Star,
      title: "Match Scoring",
      description: "Get percentage matches based on your capabilities",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Email and SMS alerts for new matching opportunities",
    },
    {
      icon: Shield,
      title: "Verified Data",
      description: "Access verified tender data from official sources",
    },
    {
      icon: Globe,
      title: "Multi-language",
      description: "Available in 5 South African languages",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Optimized for mobile devices and tablets",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sa-green via-sa-green-light to-sa-green">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center text-white mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-sa-gold rounded-full flex items-center justify-center mr-4">
              <Search className="h-8 w-8 text-sa-green" />
            </div>
            <h1 className="text-4xl font-bold">{t("appName")}</h1>
          </div>
          
          <h2 className="text-2xl font-light mb-6">
            {t("welcome")}
          </h2>
          
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t("loginDescription")}
          </p>
          
          <Button
            size="lg"
            className="bg-sa-gold text-sa-green hover:bg-yellow-400 font-semibold px-8 py-3 text-lg"
            onClick={() => window.location.href = "/login"}
          >
            {t("login")}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-sa-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-sa-green" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/80 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-6">Trusted by South African Businesses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-sa-gold">1,000+</div>
              <div className="text-white/80">Active Tenders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sa-gold">500+</div>
              <div className="text-white/80">Registered Businesses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sa-gold">95%</div>
              <div className="text-white/80">Match Accuracy</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/60 mt-12">
          <p>&copy; 2024 TenderFind SA. All rights reserved.</p>
          <p className="mt-2">Proudly South African 🇿🇦</p>
        </div>
      </div>
    </div>
  );
}
