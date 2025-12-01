# Smart Travel Assistant 🧳

A full-stack travel planning application with AI-powered diet compatibility scoring and real-time place recommendations using Google Maps API.

<div align="center">

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/beherabibekananda/Smart-Travel-Assistant)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/beherabibekananda/Smart-Travel-Assistant)

</div>

## Features

### Backend (FastAPI + Python)
- **User Profile Management**: Store diet preferences (Veg, Vegan, Jain, etc.) and budgets
- **ML-Powered Diet Compatibility**: TF-IDF + Logistic Regression model to score menu items
- **Smart Recommendations**: Hybrid ranking algorithm combining:
  - Diet compatibility score
  - Distance from user location
  - Rating and price match
- **Google Maps Integration**: Real-time data for restaurants, hotels, and hospitals
- **Booking System**: Create and manage bookings

### Frontend (React + TypeScript + Vite)
- **Modern UI**: Built with Tailwind CSS
- **Responsive Design**: Works on all devices
- **Real-time Data**: React Query for efficient data fetching
- **Pages**:
  - Home: Landing page with feature highlights
  - Profile: User management
  - Trip Planner: Search and view recommendations
  - Bookings: View booking history

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy (SQLite)
- scikit-learn
- pandas, numpy
- Google Places API (New)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS 3
- React Router 6
- React Query
- Axios

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Cloud API Key with Places API (New) enabled

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PROJECT\ AI
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Enable Google Places API**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Places API (New)" for your project
   - Wait 2-3 minutes for propagation

5. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## API Endpoints

### User Management
- `POST /users/` - Create a new user
- `GET /users/{user_id}` - Get user details

### Recommendations
- `POST /recommend/restaurants` - Get restaurant recommendations
- `POST /recommend/hotels` - Get hotel recommendations
- `POST /nearby/hospitals` - Find nearby hospitals

### Bookings
- `POST /bookings/` - Create a booking
- `GET /bookings/user/{user_id}` - Get user bookings

## Project Structure

```
PROJECT AI/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── utils.py             # Utility functions
│   ├── seed.py              # Mock data seeding
│   ├── ml/
│   │   ├── diet_model.py    # Diet compatibility ML model
│   │   └── ranking.py       # Ranking algorithms
│   ├── routers/
│   │   ├── users.py         # User endpoints
│   │   ├── recommendations.py # Recommendation endpoints
│   │   └── bookings.py      # Booking endpoints
│   └── services/
│       └── google_maps.py   # Google Maps API integration
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   ├── routes/          # Page components
│   │   ├── components/      # Reusable components
│   │   └── services/        # API service
│   └── package.json
├── requirements.txt
├── .env                     # Environment variables (not in git)
└── README.md
```

## How It Works

1. **User creates a profile** with diet preferences and budgets
2. **User searches for places** by entering location coordinates
3. **Backend calls Google Maps API** to fetch nearby places
4. **Places are synced to database** for booking support
5. **ML model calculates diet compatibility** based on tags and menu items
6. **Ranking algorithm scores places** using multiple factors
7. **Results are returned** sorted by final score
8. **User can book** restaurants and hotels

## Diet Types Supported

- Vegetarian (VEG)
- Vegan (VEGAN)
- Jain
- Non-Veg (No Beef)
- Low Carb
- Diabetic Friendly

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT License
