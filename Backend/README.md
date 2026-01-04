# Khaoo Gully Survey Backend API

A Node.js/Express backend API for the Khaoo Gully food delivery survey application. This API handles survey submissions, retrieves progress data, and provides statistics for the survey campaign.

## 🚀 Features

- **Survey Management**: Submit and retrieve survey responses
- **Progress Tracking**: Real-time survey progress towards goal
- **Statistics**: Comprehensive survey analytics and statistics
- **Data Validation**: Robust input validation using express-validator
- **Error Handling**: Centralized error handling middleware
- **Database**: Supabase (PostgreSQL) integration
- **Security**: CORS, Helmet, and input sanitization
- **API Documentation**: Well-documented RESTful endpoints

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project

## 🛠️ Installation

### 1. Clone the repository

```bash
cd Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the Backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**To get your Supabase credentials:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 4. Set up Supabase Database

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create the surveys table
- Set up indexes
- Configure Row Level Security (RLS)
- Create helper functions

**Quick setup SQL:**
```sql
-- Run this in your Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    branch TEXT NOT NULL,
    hostel TEXT NOT NULL,
    campus TEXT NOT NULL,
    restaurant_1 TEXT NOT NULL,
    restaurant_2 TEXT,
    restaurant_3 TEXT,
    phone_number TEXT NOT NULL,
    pickup_spot TEXT NOT NULL,
    order_frequency TEXT NOT NULL,
    current_apps TEXT[] NOT NULL,
    convincing_factors TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 5. Start the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or your specified PORT).

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /health
```
Check if the server is running.

**Response:**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

---

### Survey Endpoints

#### 1. Submit Survey
```http
POST /api/survey/submit
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "branch": "CSE",
  "hostel": "Block A, Room 101",
  "campus": "KIIT Campus 1",
  "restaurant1": "Cafe Coffee Day",
  "restaurant2": "Dominos",
  "restaurant3": "KFC",
  "phoneNumber": "+91 9876543210",
  "pickupSpot": "Main Gate",
  "orderFrequency": "Daily",
  "currentApps": ["Swiggy", "Zomato"],
  "convincingFactors": ["Lower prices", "Faster delivery"]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Survey submitted successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Rahul Sharma",
    "created_at": "2026-01-03T10:30:00.000Z",
    ...
  }
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `branch`: Required, max 50 characters
- `hostel`: Required, max 100 characters
- `campus`: Required, max 100 characters
- `restaurant1`: Required, max 200 characters
- `phoneNumber`: Required, valid phone format
- `pickupSpot`: Required, max 200 characters
- `orderFrequency`: Required, one of: "Daily", "2–3 times a week", "Once a week", "Occasionally", "Rarely"
- `currentApps`: Required array, valid options: "Swiggy", "Zomato", "Call the restaurant", "None"
- `convincingFactors`: Required array, valid options: "Lower prices", "Faster delivery", "Better offers", "Better customer support", "More local restaurants"

---

#### 2. Get Survey Progress
```http
GET /api/survey/progress
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "currentCount": 467,
    "goal": 500,
    "percentage": 93
  }
}
```

---

#### 3. Get All Surveys (Paginated)
```http
GET /api/survey/all?page=1&limit=10&sortBy=created_at&order=desc
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10
- `sortBy` (optional): Sort field, default "created_at"
- `order` (optional): Sort order ("asc" or "desc"), default "desc"

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "name": "Rahul Sharma",
      "created_at": "2026-01-03T10:30:00.000Z",
      ...
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 47,
    "totalCount": 467,
    "limit": 10
  }
}
```

---

#### 4. Get Survey by ID
```http
GET /api/survey/:id
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Rahul Sharma",
    ...
  }
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Survey not found"
}
```

---

#### 5. Get Survey Statistics
```http
GET /api/survey/stats
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "totalResponses": 467,
    "progress": {
      "current": 467,
      "goal": 500,
      "percentage": 93
    },
    "orderFrequency": {
      "Daily": 120,
      "2–3 times a week": 180,
      "Once a week": 100,
      "Occasionally": 50,
      "Rarely": 17
    },
    "appsUsage": {
      "Swiggy": 350,
      "Zomato": 320,
      "Call the restaurant": 80,
      "None": 15
    },
    "convincingFactors": {
      "Lower prices": 400,
      "Faster delivery": 350,
      "Better offers": 300,
      "Better customer support": 200,
      "More local restaurants": 250
    },
    "campusBreakdown": {
      "KIIT Campus 1": 200,
      "KIIT Campus 2": 150,
      ...
    },
    "branchBreakdown": {
      "CSE": 180,
      "ECE": 120,
      ...
    },
    "topRestaurants": [
      { "name": "Cafe Coffee Day", "count": 150 },
      { "name": "Dominos", "count": 130 },
      ...
    ]
  }
}
```

---

## 🗂️ Project Structure

```
Backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── controllers/
│   └── surveyController.js  # Request handlers
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   └── validation.js        # Input validation middleware
├── routes/
│   └── surveyRoutes.js      # API route definitions
├── services/
│   └── surveyService.js     # Business logic & database operations
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
├── server.js               # Application entry point
├── README.md               # This file
└── SUPABASE_SETUP.md       # Database setup guide
```

## 🔒 Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive validation using express-validator
- **Input Sanitization**: Prevents XSS and injection attacks
- **Environment Variables**: Sensitive data stored in .env file

## 🧪 Testing the API

### Using cURL

**Submit a survey:**
```bash
curl -X POST http://localhost:5000/api/survey/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "branch": "CSE",
    "hostel": "Block A",
    "campus": "Campus 1",
    "restaurant1": "Test Restaurant",
    "phoneNumber": "+919876543210",
    "pickupSpot": "Main Gate",
    "orderFrequency": "Daily",
    "currentApps": ["Swiggy"],
    "convincingFactors": ["Lower prices"]
  }'
```

**Get progress:**
```bash
curl http://localhost:5000/api/survey/progress
```

### Using Postman

1. Import the endpoints into Postman
2. Set the base URL to `http://localhost:5000`
3. Test each endpoint with sample data

## 🚀 Deployment

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your repository
3. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables in Render dashboard
5. Deploy

### Deploy to Heroku

```bash
heroku create khaoo-gully-backend
git push heroku main
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
```

### Deploy to Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your repository
3. Add environment variables
4. Deploy

## 🔧 Configuration

### CORS Configuration

Edit `ALLOWED_ORIGINS` in `.env` to add allowed origins:
```env
ALLOWED_ORIGINS=http://localhost:5173,https://yourfrontend.com
```

### Database Configuration

Modify the Supabase configuration in [config/supabase.js](./config/supabase.js) if needed.

## 📝 Error Handling

The API uses standardized error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues and questions:
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database setup help
- Review the API documentation above
- Check Supabase logs in your dashboard
- Review server logs for error messages

## 🔗 Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [express-validator Documentation](https://express-validator.github.io/docs/)

---

**Made with ❤️ for Khaoo Gully Survey Campaign**
