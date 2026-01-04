# Supabase Database Setup Guide

This document provides detailed SQL queries and setup instructions for the Khaoo Gully Survey application database in Supabase.

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [Tables Creation](#tables-creation)
3. [Indexes](#indexes)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Triggers and Functions](#triggers-and-functions)
6. [Sample Queries](#sample-queries)

---

## Database Schema

The application uses a single main table `surveys` with the following structure:

### Surveys Table
Stores all survey responses from users.

**Table Name:** `surveys`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for each survey |
| user_id | TEXT | NOT NULL | Google user ID of the authenticated user |
| name | TEXT | NOT NULL | Full name of the respondent |
| branch | TEXT | NOT NULL | Academic branch/department |
| hostel | TEXT | NOT NULL | Hostel room/block information |
| campus | TEXT | NOT NULL | Campus location |
| restaurant_1 | TEXT | NOT NULL | First restaurant choice (mandatory) |
| restaurant_2 | TEXT | NULL | Second restaurant choice (optional) |
| restaurant_3 | TEXT | NULL | Third restaurant choice (optional) |
| phone_number | TEXT | NOT NULL | Contact phone number |
| pickup_spot | TEXT | NOT NULL | Preferred delivery pickup location |
| order_frequency | TEXT | NOT NULL | How often user orders food |
| current_apps | TEXT[] | NOT NULL | Array of currently used food delivery apps |
| convincing_factors | TEXT[] | NOT NULL | Array of factors that would convince to switch |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Timestamp when survey was submitted |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Timestamp when survey was last updated |

---

## Tables Creation

### 1. Create the Surveys Table

Run this SQL query in your Supabase SQL Editor:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    branch TEXT NOT NULL,
    hostel TEXT NOT NULL,
    campus TEXT NOT NULL,
    restaurant_1 TEXT NOT NULL,
    restaurant_2 TEXT,
    restaurant_3 TEXT,
    phone_number TEXT NOT NULL,
    pickup_spot TEXT NOT NULL,
    order_frequency TEXT NOT NULL CHECK (
        order_frequency IN (
            'Daily',
            '2–3 times a week',
            'Once a week',
            'Occasionally',
            'Rarely'
        )
    ),
    current_apps TEXT[] NOT NULL,
    convincing_factors TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add table comment
COMMENT ON TABLE public.surveys IS 'Stores survey responses for Khaoo Gully food delivery service';

-- Add column comments
COMMENT ON COLUMN public.surveys.id IS 'Unique identifier for each survey response';
COMMENT ON COLUMN public.surveys.name IS 'Full name of the respondent';
COMMENT ON COLUMN public.surveys.branch IS 'Academic branch or department';
COMMENT ON COLUMN public.surveys.hostel IS 'Hostel room or block information';
COMMENT ON COLUMN public.surveys.campus IS 'Campus location';
COMMENT ON COLUMN public.surveys.restaurant_1 IS 'First favorite restaurant (mandatory)';
COMMENT ON COLUMN public.surveys.restaurant_2 IS 'Second favorite restaurant (optional)';
COMMENT ON COLUMN public.surveys.restaurant_3 IS 'Third favorite restaurant (optional)';
COMMENT ON COLUMN public.surveys.phone_number IS 'Contact phone number';
COMMENT ON COLUMN public.surveys.pickup_spot IS 'Preferred delivery pickup location';
COMMENT ON COLUMN public.surveys.order_frequency IS 'How often the user orders food';
COMMENT ON COLUMN public.surveys.current_apps IS 'Array of currently used food delivery apps';
COMMENT ON COLUMN public.surveys.convincing_factors IS 'Array of factors that would convince user to switch';
COMMENT ON COLUMN public.surveys.created_at IS 'Timestamp when the survey was created';
COMMENT ON COLUMN public.surveys.updated_at IS 'Timestamp when the survey was last updated';
```

---

## Indexes

Create indexes to improve query performance:

```sql
-- Index on created_at for sorting by submission time
CREATE INDEX IF NOT EXISTS idx_surveys_created_at 
ON public.surveys(created_at DESC);

-- Index on campus for filtering by campus
CREATE INDEX IF NOT EXISTS idx_surveys_campus 
ON public.surveys(campus);

-- Index on branch for filtering by branch
CREATE INDEX IF NOT EXISTS idx_surveys_branch 
ON public.surveys(branch);

-- Index on order_frequency for statistics
CREATE INDEX IF NOT EXISTS idx_surveys_order_frequency 
ON public.surveys(order_frequency);

-- GIN index for array columns (for efficient searching within arrays)
CREATE INDEX IF NOT EXISTS idx_surveys_current_apps 
ON public.surveys USING GIN(current_apps);

CREATE INDEX IF NOT EXISTS idx_surveys_convincing_factors 
ON public.surveys USING GIN(convincing_factors);

-- Index on phone_number for potential duplicate checking
CREATE INDEX IF NOT EXISTS idx_surveys_phone_number 
ON public.surveys(phone_number);
```

---

## Row Level Security (RLS)

### Enable RLS
```sql
-- Enable Row Level Security on the surveys table
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

#### Policy 1: Allow Public Read Access
```sql
-- Allow anyone to read survey data (for statistics/progress)
CREATE POLICY "Allow public read access" 
ON public.surveys
FOR SELECT
USING (true);
```

#### Policy 2: Allow Public Insert
```sql
-- Allow anyone to insert survey responses
CREATE POLICY "Allow public insert" 
ON public.surveys
FOR INSERT
WITH CHECK (true);
```

#### Policy 3: Restrict Update/Delete (Optional - for admin use)
```sql
-- Only allow updates from authenticated users (optional - for admin panel)
CREATE POLICY "Allow authenticated update" 
ON public.surveys
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Only allow deletes from authenticated users (optional - for admin panel)
CREATE POLICY "Allow authenticated delete" 
ON public.surveys
FOR DELETE
USING (auth.role() = 'authenticated');
```

**Note:** If you want completely public access without authentication, modify the policies accordingly. For production, consider implementing proper authentication.

---

## Triggers and Functions

### Auto-update `updated_at` timestamp

```sql
-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before any update
CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON public.surveys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

### Function to Get Survey Progress

```sql
-- Create a function to get survey progress
CREATE OR REPLACE FUNCTION public.get_survey_progress()
RETURNS JSON AS $$
DECLARE
    total_count INTEGER;
    goal_count INTEGER := 500;
    progress_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM public.surveys;
    progress_percentage := LEAST(ROUND((total_count::DECIMAL / goal_count) * 100), 100);
    
    RETURN json_build_object(
        'currentCount', total_count,
        'goal', goal_count,
        'percentage', progress_percentage
    );
END;
$$ LANGUAGE plpgsql;
```

### Function to Get Survey Statistics

```sql
-- Create a function to get comprehensive survey statistics
CREATE OR REPLACE FUNCTION public.get_survey_statistics()
RETURNS JSON AS $$
DECLARE
    total_responses INTEGER;
    stats JSON;
BEGIN
    SELECT COUNT(*) INTO total_responses FROM public.surveys;
    
    SELECT json_build_object(
        'totalResponses', total_responses,
        'orderFrequencyBreakdown', (
            SELECT json_object_agg(order_frequency, count)
            FROM (
                SELECT order_frequency, COUNT(*) as count
                FROM public.surveys
                GROUP BY order_frequency
            ) freq
        ),
        'campusBreakdown', (
            SELECT json_object_agg(campus, count)
            FROM (
                SELECT campus, COUNT(*) as count
                FROM public.surveys
                GROUP BY campus
            ) camp
        ),
        'branchBreakdown', (
            SELECT json_object_agg(branch, count)
            FROM (
                SELECT branch, COUNT(*) as count
                FROM public.surveys
                GROUP BY branch
                ORDER BY count DESC
                LIMIT 10
            ) br
        ),
        'topRestaurants', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT restaurant, COUNT(*) as count
                FROM (
                    SELECT restaurant_1 as restaurant FROM public.surveys WHERE restaurant_1 IS NOT NULL
                    UNION ALL
                    SELECT restaurant_2 FROM public.surveys WHERE restaurant_2 IS NOT NULL
                    UNION ALL
                    SELECT restaurant_3 FROM public.surveys WHERE restaurant_3 IS NOT NULL
                ) restaurants
                GROUP BY restaurant
                ORDER BY count DESC
                LIMIT 10
            ) t
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;
```

---

## Sample Queries

### 1. Insert a Survey Response

```sql
INSERT INTO public.surveys (
    name,
    branch,
    hostel,
    campus,
    restaurant_1,
    restaurant_2,
    restaurant_3,
    phone_number,
    pickup_spot,
    order_frequency,
    current_apps,
    convincing_factors
) VALUES (
    'Rahul Sharma',
    'CSE',
    'Block A, Room 101',
    'KIIT Campus 1',
    'Cafe Coffee Day',
    'Dominos',
    'KFC',
    '+91 9876543210',
    'Main Gate',
    'Daily',
    ARRAY['Swiggy', 'Zomato'],
    ARRAY['Lower prices', 'Faster delivery']
);
```

### 2. Get All Surveys (with pagination)

```sql
-- Get surveys with pagination (page 1, 10 items per page)
SELECT *
FROM public.surveys
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- Get total count
SELECT COUNT(*) as total_count
FROM public.surveys;
```

### 3. Get Survey by ID

```sql
SELECT *
FROM public.surveys
WHERE id = 'your-uuid-here';
```

### 4. Get Survey Progress

```sql
-- Using the function
SELECT public.get_survey_progress();

-- Or manually
SELECT 
    COUNT(*) as current_count,
    500 as goal,
    LEAST(ROUND((COUNT(*)::DECIMAL / 500) * 100), 100) as percentage
FROM public.surveys;
```

### 5. Get Order Frequency Statistics

```sql
SELECT 
    order_frequency,
    COUNT(*) as count,
    ROUND((COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM public.surveys) * 100), 2) as percentage
FROM public.surveys
GROUP BY order_frequency
ORDER BY count DESC;
```

### 6. Get Most Popular Apps

```sql
SELECT 
    app,
    COUNT(*) as usage_count
FROM public.surveys,
     UNNEST(current_apps) as app
GROUP BY app
ORDER BY usage_count DESC;
```

### 7. Get Top Convincing Factors

```sql
SELECT 
    factor,
    COUNT(*) as count
FROM public.surveys,
     UNNEST(convincing_factors) as factor
GROUP BY factor
ORDER BY count DESC;
```

### 8. Get Top 10 Restaurants

```sql
SELECT restaurant, COUNT(*) as count
FROM (
    SELECT restaurant_1 as restaurant FROM public.surveys WHERE restaurant_1 IS NOT NULL
    UNION ALL
    SELECT restaurant_2 FROM public.surveys WHERE restaurant_2 IS NOT NULL
    UNION ALL
    SELECT restaurant_3 FROM public.surveys WHERE restaurant_3 IS NOT NULL
) restaurants
GROUP BY restaurant
ORDER BY count DESC
LIMIT 10;
```

### 9. Get Surveys by Campus

```sql
SELECT *
FROM public.surveys
WHERE campus = 'KIIT Campus 1'
ORDER BY created_at DESC;
```

### 10. Get Surveys by Branch

```sql
SELECT *
FROM public.surveys
WHERE branch = 'CSE'
ORDER BY created_at DESC;
```

### 11. Search Surveys by Name

```sql
SELECT *
FROM public.surveys
WHERE name ILIKE '%rahul%'
ORDER BY created_at DESC;
```

### 12. Get Recent Surveys (Last 24 hours)

```sql
SELECT *
FROM public.surveys
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### 13. Get Campus-wise Order Frequency Distribution

```sql
SELECT 
    campus,
    order_frequency,
    COUNT(*) as count
FROM public.surveys
GROUP BY campus, order_frequency
ORDER BY campus, count DESC;
```

### 14. Find Duplicate Phone Numbers

```sql
SELECT 
    phone_number,
    COUNT(*) as submission_count,
    array_agg(id) as survey_ids
FROM public.surveys
GROUP BY phone_number
HAVING COUNT(*) > 1
ORDER BY submission_count DESC;
```

### 15. Get Statistics for a Specific Time Range

```sql
SELECT 
    COUNT(*) as total_responses,
    COUNT(DISTINCT campus) as unique_campuses,
    COUNT(DISTINCT branch) as unique_branches
FROM public.surveys
WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31';
```

---

## Database Backup and Maintenance

### Create a Backup

```sql
-- In Supabase Dashboard:
-- 1. Go to Database > Backups
-- 2. Download the latest backup or create a new one
```

### Optimize Table

```sql
-- Analyze table for query optimization
ANALYZE public.surveys;

-- Vacuum table to reclaim storage
VACUUM ANALYZE public.surveys;
```

---

## Additional Recommendations

### 1. Add a View for Analytics

```sql
CREATE OR REPLACE VIEW public.survey_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as daily_submissions,
    COUNT(DISTINCT campus) as campuses_covered,
    COUNT(DISTINCT branch) as branches_covered
FROM public.surveys
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 2. Enable Realtime (Optional)

```sql
-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.surveys;
```

### 3. Create a Materialized View for Statistics (Better Performance)

```sql
CREATE MATERIALIZED VIEW public.survey_stats_mv AS
SELECT 
    COUNT(*) as total_surveys,
    json_object_agg(order_frequency, freq_count) as order_frequency_stats,
    json_object_agg(campus, campus_count) as campus_stats
FROM (
    SELECT 
        order_frequency,
        COUNT(*) as freq_count,
        campus,
        COUNT(*) as campus_count
    FROM public.surveys
    GROUP BY order_frequency, campus
) stats;

-- Refresh the materialized view periodically
REFRESH MATERIALIZED VIEW public.survey_stats_mv;
```

---

## Setup Checklist

- [ ] Enable UUID extension
- [ ] Create surveys table
- [ ] Add indexes for performance
- [ ] Enable Row Level Security (RLS)
- [ ] Create RLS policies
- [ ] Create auto-update trigger for updated_at
- [ ] Create helper functions (optional)
- [ ] Create views for analytics (optional)
- [ ] Test insert, select, update operations
- [ ] Configure Supabase API keys in backend .env file

---

## Notes

1. **Security**: The current RLS policies allow public read and insert. For production, consider implementing proper authentication.
2. **Indexes**: The GIN indexes on array columns enable efficient searching within arrays.
3. **Phone Numbers**: Consider adding a unique constraint on phone_number if you want to prevent duplicate submissions.
4. **Data Validation**: Use CHECK constraints for data integrity (already added for order_frequency).
5. **Backup**: Set up automated backups in Supabase dashboard.

---

## Support

For Supabase specific documentation, visit: https://supabase.com/docs
