import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Landing from "../pages/Landing";
import Home from "../Home";
import Login from "../pages/login";
import Register from "../pages/Register";
import LogFile from "../LogFile";
import AddEvidence from "../AddEvidence";
import VerifyEvidence from "../VerifyEvidence";
import ViewEvidence from "../ViewEvidence";
import SideBySide from "../SideBySide";
import DeepfakeDetection from "../DeepfakeDetection";

const AppRoutes = () => {
  return (
      <Routes>
        {/* Define your routes here */}
         <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/log-file" element={<LogFile />} />
        {/* Approach */}
        <Route path="/approach" element={<ViewEvidence />} />

        {/* Evidence Chain of Custody */}
        <Route path="/add-evidence" element={<AddEvidence />} />
        <Route path="/verify-evidence" element={<VerifyEvidence />} />
        <Route path="/view-evidence" element={<ViewEvidence />} />
        
        {/* Deepfake Detection */}
        <Route path="/deepfake-detection" element={<DeepfakeDetection />} />
        
        {/* Side by Side - Add & Check Evidence */}
        <Route path="/dashboard" element={<SideBySide />} />
        
      </Routes>
  )
}

export default AppRoutes
