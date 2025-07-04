export interface TenderData {
  id: number;
  ocid?: string;
  title: string;
  description?: string;
  department?: string;
  category?: string;
  province?: string;
  valueMin?: string;
  valueMax?: string;
  closingDate?: string;
  advertisedDate?: string;
  status?: string;
  requirements?: string[];
  documentUrl?: string;
  contactDetails?: any;
  cidbRequired?: string;
  bbbeeRequired?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenderMatch {
  id: number;
  userId: string;
  tenderId: number;
  matchScore?: number;
  matchReasons?: string[];
  isViewed?: boolean;
  createdAt?: string;
  tender: TenderData;
}

export interface SavedTender {
  id: number;
  userId: string;
  tenderId: number;
  createdAt?: string;
  tender: TenderData;
}

export interface BusinessProfile {
  id?: number;
  userId: string;
  businessName: string;
  registrationNumber?: string;
  cidbGrading?: string;
  bbbeeLevel?: string;
  industryCategories?: string[];
  preferredValueMin?: string;
  preferredValueMax?: string;
  provinces?: string[];
  phoneNumber?: string;
  isVerified?: boolean;
  language?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenderFilters {
  category?: string;
  province?: string;
  valueMin?: number;
  valueMax?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface Stats {
  activeTenders: number;
  matchingTenders: number;
  savedTenders: number;
}
