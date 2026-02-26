import supabase from '../config/supabase.js';

const GOAL_COUNT = 500;

/**
 * Create a new survey response
 */
export const createSurvey = async (surveyData) => {
  try {
    // Insert survey data
    const { data, error } = await supabase
      .from('surveys')
      .insert([{
        user_id: surveyData.userId || 'anonymous',
        name: surveyData.name,
        branch: surveyData.branch,
        hostel: surveyData.hostel,
        campus: surveyData.campus,
        year: surveyData.year,
        restaurant_1: surveyData.restaurant1,
        restaurant_2: surveyData.restaurant2 || null,
        restaurant_3: surveyData.restaurant3 || null,
        phone_number: surveyData.phoneNumber,
        pickup_spot: surveyData.pickupSpot,
        order_frequency: surveyData.orderFrequency,
        current_apps: surveyData.currentApps,
        convincing_factors: surveyData.convincingFactors
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current survey progress
 */
export const getProgress = async () => {
  try {
    const { count, error } = await supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      currentCount: count || 0,
      goal: GOAL_COUNT,
      percentage: Math.min(Math.round(((count || 0) / GOAL_COUNT) * 100), 100)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all surveys with pagination
 */
export const getAllSurveys = async ({ page = 1, limit = 10, sortBy = 'created_at', order = 'desc' }) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get total count
    const { count } = await supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order(sortBy, { ascending: order === 'asc' })
      .range(from, to);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalCount: count,
      limit
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get survey by ID
 */
export const getSurveyById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get aggregated survey statistics
 */
export const getSurveyStatistics = async () => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Calculate statistics
    const totalResponses = data.length;
    
    // Order frequency breakdown
    const orderFrequencyStats = data.reduce((acc, survey) => {
      acc[survey.order_frequency] = (acc[survey.order_frequency] || 0) + 1;
      return acc;
    }, {});

    // Current apps usage
    const appsUsage = data.reduce((acc, survey) => {
      survey.current_apps?.forEach(app => {
        acc[app] = (acc[app] || 0) + 1;
      });
      return acc;
    }, {});

    // Convincing factors
    const convincingFactorsStats = data.reduce((acc, survey) => {
      survey.convincing_factors?.forEach(factor => {
        acc[factor] = (acc[factor] || 0) + 1;
      });
      return acc;
    }, {});

    // Campus breakdown
    const campusStats = data.reduce((acc, survey) => {
      acc[survey.campus] = (acc[survey.campus] || 0) + 1;
      return acc;
    }, {});

    // Branch breakdown
    const branchStats = data.reduce((acc, survey) => {
      acc[survey.branch] = (acc[survey.branch] || 0) + 1;
      return acc;
    }, {});

    // Top restaurants
    const restaurantCounts = {};
    data.forEach(survey => {
      [survey.restaurant_1, survey.restaurant_2, survey.restaurant_3]
        .filter(Boolean)
        .forEach(restaurant => {
          restaurantCounts[restaurant] = (restaurantCounts[restaurant] || 0) + 1;
        });
    });

    const topRestaurants = Object.entries(restaurantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalResponses,
      progress: {
        current: totalResponses,
        goal: GOAL_COUNT,
        percentage: Math.min(Math.round((totalResponses / GOAL_COUNT) * 100), 100)
      },
      orderFrequency: orderFrequencyStats,
      appsUsage,
      convincingFactors: convincingFactorsStats,
      campusBreakdown: campusStats,
      branchBreakdown: branchStats,
      topRestaurants
    };
  } catch (error) {
    throw error;
  }
};














































