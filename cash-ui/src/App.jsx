import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { useState, useEffect } from 'react';

import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ItemUpload from './pages/ItemUpload';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Catalogue from './pages/Catalogue';
import MyItems from './pages/MyItems';
import PastAuctions from './pages/PastAuctions';
import AuctionsWon from './pages/AuctionsWon';
import Home from './pages/Home';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('access_token'));
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/upload-item"
          element={isAuthenticated ? <ItemUpload /> : <Login />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Login />}
        />
        <Route
          path="/catalogue"
          element={isAuthenticated ? <Catalogue /> : <Login />}
        />
        <Route
          path="/my-items"
          element={isAuthenticated ? <MyItems /> : <Login />}
        />
        <Route
            path="/auctions-won"
            element={isAuthenticated ? <AuctionsWon /> : <Login />}
        />
        <Route
          path="/past-auctions"
          element={isAuthenticated ? <PastAuctions /> : <Login />}
        />
          <Route
              path="/payment"
              element={isAuthenticated ? <Payment /> : <Login />}
          />
          <Route
              path="/confirmation"
              element={isAuthenticated ? <Confirmation /> : <Login />}
          />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
