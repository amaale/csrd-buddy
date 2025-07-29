import { useState } from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
];

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Load from localStorage on initialization
    return localStorage.getItem('preferred-language') || 'en';
  });
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  const changeLanguage = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setIsOpen(false);
    // Store in localStorage for persistence
    localStorage.setItem('preferred-language', languageCode);
    
    // Apply language changes to the document
    document.documentElement.lang = languageCode;
    
    // You could also dispatch a custom event here for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChange', { detail: languageCode }));
  };

  return (
    <div className="relative">
      <Select value={currentLanguage.code} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px] bg-white border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentLanguage.flag}</span>
            <span className="text-sm font-medium">{currentLanguage.name}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function LanguageSelectorCompact() {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('preferred-language') || 'en';
  });
  
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  const changeLanguage = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('preferred-language', languageCode);
    document.documentElement.lang = languageCode;
    window.dispatchEvent(new CustomEvent('languageChange', { detail: languageCode }));
  };

  return (
    <Select value={currentLanguage.code} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[60px] bg-transparent border-none shadow-none p-1">
        <div className="flex items-center">
          <Globe className="w-4 h-4 text-neutral-600" />
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}