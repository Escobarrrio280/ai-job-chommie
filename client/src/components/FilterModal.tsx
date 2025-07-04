import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";
import { TenderFilters } from "@/types/tender";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TenderFilters;
  onFiltersChange: (filters: TenderFilters) => void;
}

export default function FilterModal({ isOpen, onClose, filters, onFiltersChange }: FilterModalProps) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState<TenderFilters>(filters);

  const categories = [
    "Construction",
    "Technology",
    "Professional Services",
    "Fleet",
    "Facilities Management",
    "Energy",
    "Office Supplies",
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

  const handleCategoryChange = (category: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      category: checked ? category : undefined,
    }));
  };

  const handleValueRangeChange = (value: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      valueMin: value[0] * 1000000, // Convert to millions
      valueMax: value[1] * 1000000,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: TenderFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClose();
  };

  const valueRange = [
    (localFilters.valueMin || 0) / 1000000,
    (localFilters.valueMax || 50000000) / 1000000,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t("filterTenders")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="font-medium mb-3">{t("category")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <Checkbox
                    checked={localFilters.category === category}
                    onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                  />
                  <span className="text-sm">{t(category.toLowerCase().replace(/\s+/g, ''))}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Value Range */}
          <div>
            <h3 className="font-medium mb-3">{t("tenderValueRange")}</h3>
            <div className="space-y-4">
              <Slider
                value={valueRange}
                onValueChange={handleValueRangeChange}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>R{valueRange[0].toFixed(0)}M</span>
                <span>R{valueRange[1].toFixed(0)}M</span>
              </div>
            </div>
          </div>

          {/* Province */}
          <div>
            <h3 className="font-medium mb-3">{t("province")}</h3>
            <Select
              value={localFilters.province || ""}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, province: value || undefined }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allProvinces")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("allProvinces")}</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {t(province.toLowerCase().replace(/\s+/g, '').replace('-', ''))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="flex-1 bg-sa-green hover:bg-sa-green-light text-white"
            >
              {t("applyFilters")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
