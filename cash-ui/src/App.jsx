import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ItemUpload from "./pages/ItemUpload";
// import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Signup />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/upload-item" element={<ItemUpload />} />
      </Routes>
    </Router>
  );
}

export default App;