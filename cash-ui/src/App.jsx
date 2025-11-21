import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ItemUpload from './pages/ItemUpload';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Catalogue from './pages/Catalogue';
import MyItems from './pages/MyItems';
import PastAuctions from './pages/PastAuctions';

function App() {
  const [isAuthenticated] = useState(!!localStorage.getItem('access_token'));

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
          path="/past-auctions"
          element={isAuthenticated ? <PastAuctions /> : <Login />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
