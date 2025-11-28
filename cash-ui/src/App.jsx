import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth, AuthProvider } from './auth/AuthContext';

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
import ChatPopup from './components/ChatPopup';
import Home from './pages/Home';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Router>
      <Navbar />
      {isAuthenticated && <ChatPopup />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {isAuthenticated && (
          <>
            <Route path="/upload-item" element={<ItemUpload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/my-items" element={<MyItems />} />
            <Route path="/past-auctions" element={<PastAuctions />} />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
