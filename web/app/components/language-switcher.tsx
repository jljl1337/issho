import { Check, Languages } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useLanguage } from "~/contexts/language-context";

const languages = [
  { code: "en-US", name: "English (US)", nativeName: "English (US)" },
  { code: "zh-HK", name: "Chinese (HK)", nativeName: "中文 (香港)" },
] as const;

export function LanguageSwitcher() {
  const { language, setLanguage, isUpdating } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isUpdating}>
          <Languages className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="flex items-center justify-between"
          >
            <span>{lang.nativeName}</span>
            {language === lang.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
