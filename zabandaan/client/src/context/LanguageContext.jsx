import { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  brand: 'زبان دان',
  loading: 'زبان دان لوڈ ہو رہا ہے...',
  home: 'گھر',
  profile: 'پروفائل',
  saveProgress: 'پیش رفت محفوظ کریں',
  logout: 'لاگ آؤٹ',
  translate: 'اردو',
  english: 'English',
  welcome: 'خوش آمدید',
  learningDesk: 'آپ کی سیکھنے کی میز',
  guestNote: 'مہمان کے طور پر کھیل رہے ہیں — آپ کی مشق اسی ڈیوائس پر محفوظ ہے۔',
  dailyProgress: 'حاصل کردہ پوائنٹس',
  startWith: 'اپنے پہلے اردو حروف سیکھنے کے لیے',
  alphabets: 'حروف تہجی',
  numbers: 'اعداد',
  idioms: 'محاورے',
  wordSearch: 'لفظ تلاش کریں',
  adjectives: 'صفات',
  poetry: 'شاعری',
  backHome: 'گھر واپس جائیں',
  chooseLevel: 'محاورے کی سطح منتخب کریں',
  startLearning: 'سیکھنا شروع کریں',
  whereBegin: 'کہاں سے شروع کریں؟',
  createAccount: 'اکاؤنٹ بنائیں',
  login: 'لاگ اِن',
  guest: 'مہمان کے طور پر جاری رکھیں',
  optionalName: 'آپ کا نام (اختیاری)',
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('zabandaan_language') || 'en');

  useEffect(() => {
    localStorage.setItem('zabandaan_language', language);
    document.documentElement.lang = language === 'ur' ? 'ur' : 'en';
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key, fallback) => language === 'ur' ? (translations[key] || fallback) : fallback;
  return (
    <LanguageContext.Provider value={{ language, isUrdu: language === 'ur', toggleLanguage: () => setLanguage(value => value === 'ur' ? 'en' : 'ur'), t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
