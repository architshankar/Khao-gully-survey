// API service for backend communication

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname.includes('localhost')
    ? 'http://localhost:5000/api'
    : 'https://khao-gully-survey.onrender.com/api');

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ProgressResponse {
  currentCount: number;
  goal: number;
  percentage: number;
}

export interface SurveySubmitData {
  name: string;
  branch: string;
  hostel: string;
  campus: string;
  restaurant1: string;
  restaurant2?: string;
  restaurant3?: string;
  phoneNumber: string;
  pickupSpot: string;
  orderFrequency: string;
  currentApps: string[];
  convincingFactors: string[];
}

/**
 * Submit a survey response to the backend
 */
export const submitSurvey = async (data: SurveySubmitData): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/survey/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit survey');
    }

    return result;
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw error;
  }
};

/**
 * Get current survey progress
 */
export const getSurveyProgress = async (): Promise<ProgressResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/survey/progress`);
    const result: ApiResponse<ProgressResponse> = await response.json();

    if (!response.ok || !result.data) {
      throw new Error('Failed to fetch progress');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    // Return default values on error
    return {
      currentCount: 0,
      goal: 500,
      percentage: 0,
    };
  }
};

/**
 * Get survey statistics
 */
export const getSurveyStats = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/survey/stats`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};
