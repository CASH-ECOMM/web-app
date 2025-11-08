import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login"; 
import Navbar from "./components/Navbar"; 

function App() {
  return (
    <Router>
      <Navbar /> {}
      <Routes>
        <Route path="/" element={<Signup />} /> {}
        <Route path="/login" element={<Login />} /> {}
      </Routes>
    </Router>
  );
}

export default App;
