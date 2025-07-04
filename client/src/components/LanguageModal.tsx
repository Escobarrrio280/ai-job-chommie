import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "en", name: t("english"), nativeName: "English" },
    { code: "af", name: t("afrikaans"), nativeName: "Afrikaans" },
    { code: "zu", name: t("zulu"), nativeName: "isiZulu" },
    { code: "xh", name: t("xhosa"), nativeName: "isiXhosa" },
    { code: "nso", name: t("sepedi"), nativeName: "Sepedi" },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("preferred-language", languageCode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("selectLanguage")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="ghost"
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg touch-target"
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{language.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{language.nativeName}</span>
              </div>
              {i18n.language === language.code && (
                <Check className="h-5 w-5 text-sa-green dark:text-sa-gold" />
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
