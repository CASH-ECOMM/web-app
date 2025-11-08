import React from "react";
import "./Navbar.css";
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate(); 

  const handleProfileClick = () => {
    const userSignedIn = false; 
    if (!userSignedIn) {
      navigate("/"); 
    }
  
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">Cash</h1>
      </div>
      <div className="navbar-right">
        <FaUserCircle
          className="profile-icon"
          onClick={handleProfileClick} 
          style={{ cursor: "pointer" }} 
        />
      </div>
    </nav>
  );
}
