import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App name
      appName: "TenderFind SA",
      
      // Navigation
      search: "Search",
      matches: "Matches",
      saved: "Saved",
      profile: "Profile",
      settings: "Settings",
      
      // Auth
      login: "Login",
      logout: "Logout",
      welcome: "Welcome to TenderFind SA",
      loginDescription: "Find and track South African tender opportunities that match your business profile.",
      
      // Search
      searchPlaceholder: "Search tenders by keywords, department, or industry...",
      activeTenders: "Active Tenders",
      construction: "Construction",
      itServices: "IT Services",
      myMatches: "My Matches",
      
      // Stats
      activeTendersCount: "Active Tenders",
      yourMatches: "Your Matches",
      savedTenders: "Saved",
      
      // Tender actions
      viewDetails: "View Details",
      download: "Download",
      loadMore: "Load More Tenders",
      
      // Match indicators
      highMatch: "{{score}}% Match",
      mediumMatch: "{{score}}% Match",
      lowMatch: "{{score}}% Match",
      newTender: "New",
      closesSoon: "Closes Soon",
      
      // Tender info
      closingDate: "Closes: {{date}}",
      value: "R{{min}} - R{{max}}",
      department: "Department: {{name}}",
      
      // Profile
      businessName: "Business Name",
      registrationNumber: "Registration Number",
      cidbGrading: "CIDB Grading",
      bbbeeLevel: "B-BBEE Level",
      industryCategories: "Industry Categories",
      preferredValueRange: "Preferred Value Range",
      provinces: "Provinces of Interest",
      phoneNumber: "Phone Number",
      emailNotifications: "Email Notifications",
      smsNotifications: "SMS Notifications",
      language: "Language",
      saveProfile: "Save Profile",
      
      // Filters
      filterTenders: "Filter Tenders",
      category: "Category",
      tenderValueRange: "Tender Value Range",
      province: "Province",
      allProvinces: "All Provinces",
      applyFilters: "Apply Filters",
      
      // Languages
      selectLanguage: "Select Language",
      english: "English",
      afrikaans: "Afrikaans",
      zulu: "isiZulu",
      xhosa: "isiXhosa",
      sepedi: "Sepedi",
      
      // Provinces
      gauteng: "Gauteng",
      westernCape: "Western Cape",
      kwazuluNatal: "KwaZulu-Natal",
      easternCape: "Eastern Cape",
      freeState: "Free State",
      limpopo: "Limpopo",
      mpumalanga: "Mpumalanga",
      northWest: "North West",
      northernCape: "Northern Cape",
      national: "National",
      
      // Categories
      professionalServices: "Professional Services",
      fleet: "Fleet",
      facilitiesManagement: "Facilities Management",
      energy: "Energy",
      technology: "Technology",
      officeSupplies: "Office Supplies",
      
      // Notifications
      notificationSettings: "Notification Settings",
      businessVerification: "Business Verification",
      helpSupport: "Help & Support",
      editProfile: "Edit Profile",
      
      // Messages
      noTenders: "No tenders found",
      noMatches: "No matches found",
      noSavedTenders: "No saved tenders",
      loadingTenders: "Loading tenders...",
      errorLoadingTenders: "Error loading tenders",
      profileSaved: "Profile saved successfully",
      errorSavingProfile: "Error saving profile",
      tenderSaved: "Tender saved",
      tenderUnsaved: "Tender removed from saved",
      
      // Verification
      verified: "Verified",
      unverified: "Unverified",
      
      // CIDB Grades
      cidbGrade1: "Grade 1",
      cidbGrade2: "Grade 2",
      cidbGrade3: "Grade 3",
      cidbGrade4: "Grade 4",
      cidbGrade5: "Grade 5",
      cidbGrade6: "Grade 6",
      cidbGrade7: "Grade 7",
      cidbGrade8: "Grade 8",
      cidbGrade9: "Grade 9",
      
      // B-BBEE Levels
      bbbeeLevel1: "Level 1",
      bbbeeLevel2: "Level 2",
      bbbeeLevel3: "Level 3",
      bbbeeLevel4: "Level 4",
      bbbeeLevel5: "Level 5",
      bbbeeLevel6: "Level 6",
      bbbeeLevel7: "Level 7",
      bbbeeLevel8: "Level 8",
    }
  },
  af: {
    translation: {
      // App name
      appName: "TenderFind SA",
      
      // Navigation
      search: "Soek",
      matches: "Passings",
      saved: "Gestoor",
      profile: "Profiel",
      settings: "Instellings",
      
      // Auth
      login: "Meld aan",
      logout: "Meld af",
      welcome: "Welkom by TenderFind SA",
      loginDescription: "Vind en volg Suid-Afrikaanse tendergeleenthede wat by jou besigheidsprofiel pas.",
      
      // Search
      searchPlaceholder: "Soek tenders volgens sleutelwoorde, departement, of bedryf...",
      activeTenders: "Aktiewe Tenders",
      construction: "Konstruksie",
      itServices: "IT Dienste",
      myMatches: "My Passings",
      
      // Tender actions
      viewDetails: "Bekyk Besonderhede",
      download: "Laai af",
      loadMore: "Laai Meer Tenders",
      
      // Match indicators
      highMatch: "{{score}}% Passing",
      mediumMatch: "{{score}}% Passing",
      lowMatch: "{{score}}% Passing",
      newTender: "Nuut",
      closesSoon: "Sluit Binnekort",
      
      // Profile
      businessName: "Besigheidsnaam",
      registrationNumber: "Registrasienommer",
      saveProfile: "Stoor Profiel",
      
      selectLanguage: "Kies Taal",
      english: "Engels",
      afrikaans: "Afrikaans",
    }
  },
  zu: {
    translation: {
      // App name
      appName: "TenderFind SA",
      
      // Navigation
      search: "Sesha",
      matches: "Okufanayo",
      saved: "Okulondoloziwe",
      profile: "Iphrofayili",
      settings: "Izilungiselelo",
      
      // Auth
      login: "Ngena",
      logout: "Phuma",
      welcome: "Siyakwamukela ku-TenderFind SA",
      loginDescription: "Thola futhi ulandelele amathuba etenda aseNingizimu Afrika afanayo nephrofayili yakho yebhizinisi.",
      
      // Search
      searchPlaceholder: "Sesha ama-tender ngamagama asemqoka, umnyango, noma imisebenzi...",
      activeTenders: "Ama-tender Asebenzayo",
      construction: "Ukwakha",
      itServices: "Izinsizakalo ze-IT",
      myMatches: "Okufanayo Nami",
      
      selectLanguage: "Khetha Ulimi",
      english: "IsiNgisi",
      afrikaans: "IsiBhunu",
      zulu: "isiZulu",
    }
  },
  xh: {
    translation: {
      // App name
      appName: "TenderFind SA",
      
      // Navigation
      search: "Khangela",
      matches: "Izitambo",
      saved: "Ezigciniweyo",
      profile: "Iprofayile",
      settings: "Iisetingi",
      
      // Auth
      login: "Ngena",
      logout: "Phuma",
      welcome: "Wamkelekile kwi-TenderFind SA",
      loginDescription: "Fumana uze ulandelele amathuba etenda aseMzantsi Afrika ahambelana neprofayile yeshishini lakho.",
      
      selectLanguage: "Khetha Ulwimi",
      english: "IsiNgesi",
      afrikaans: "IsiBhulu",
      xhosa: "isiXhosa",
    }
  },
  nso: {
    translation: {
      // App name
      appName: "TenderFind SA",
      
      // Navigation
      search: "Nyaka",
      matches: "Tše di swanetšego",
      saved: "Tše di bolokeditšwego",
      profile: "Profaele",
      settings: "Dipeakanyo",
      
      // Auth
      login: "Tsena",
      logout: "Etšwa",
      welcome: "O amogelwe go TenderFind SA",
      loginDescription: "Hwetša gomme o latele dibaka tša ditentara tša Afrika Borwa tšeo di swantšhanago le profaele ya kgwebo ya gago.",
      
      selectLanguage: "Kgetha Leleme",
      english: "Seisimane",
      afrikaans: "Seafrikanse",
      sepedi: "Sepedi",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
