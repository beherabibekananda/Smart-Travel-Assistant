
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Home from './routes/Home';
import Profile from './routes/Profile';
import Trip from './routes/Trip';
import Bookings from './routes/Bookings';

const queryClient = new QueryClient();

function App() {
  console.log('App component rendering');
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/trip" element={<Trip />} />
            <Route path="/bookings" element={<Bookings />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
