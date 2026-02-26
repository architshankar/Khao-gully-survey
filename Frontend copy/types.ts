
export interface SurveyData {
  name: string;
  branch: string;
  hostel: string;
  campus: string;
  year: string;
  restaurant1: string;
  restaurant2?: string;
  restaurant3?: string;
  phoneNumber: string;
  pickupSpot: string;
  orderFrequency: string;
  currentApps: string[];
  convincingFactors: string[];
  userId?: string;
}

export interface ProgressState {
  currentCount: number;
  goal: number;
  hasSubmitted: boolean;
}
