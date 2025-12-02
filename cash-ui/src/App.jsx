import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ItemUpload from './pages/ItemUpload';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Catalogue from './pages/Catalogue';
import CatalogueItemDetail from './pages/CatalogueItemDetail';
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
  //Theme preference state (light, dark, system)
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem('themePreference') || 'system';
  });
  // Detect system perferences for dark mode or light mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Resolve the actual theme mode based on user preference and system settings
  const resolvedMode =
    themePreference === 'system'
      ? prefersDarkMode
        ? 'dark'
        : 'light'
      : themePreference;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
        },
      }),
    [resolvedMode]
  );
  // Persist user theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('themePreference', themePreference);
  }, [themePreference]);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('access_token'));
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar
          themePreference={themePreference}
          setThemePreference={setThemePreference}
        />
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
            path="/catalogue/:id"
            element={isAuthenticated ? <CatalogueItemDetail /> : <Login />}
          />
          <Route
            path="/my-items"
            element={isAuthenticated ? <MyItems /> : <Login />}
          />
          <Route
            path="/past-auctions"
            element={isAuthenticated ? <PastAuctions /> : <Login />}
          />
            <Route
                path="/auctions-won"
                element={isAuthenticated ? <AuctionsWon /> : <Login />}
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
    </ThemeProvider>
  );
}

export default App;
