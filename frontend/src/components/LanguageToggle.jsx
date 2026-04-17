import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-full border border-gray-600 transition-colors shadow-lg"
      title="Toggle Language"
    >
      <Languages className="w-4 h-4 text-primary" />
      <span className="text-sm font-bold uppercase tracking-wider">
        {language === 'en' ? 'EN' : 'বাং'}
      </span>
    </button>
  );
}
