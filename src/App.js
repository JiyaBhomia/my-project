import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from './Components/Login/Login';
import { ForgotPassword } from "./Components/ForgotPassword/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
    
  );
}

export default App;
