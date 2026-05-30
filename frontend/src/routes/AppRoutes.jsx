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
import Cases from "../cases";
import CaseDetail from "../CaseDetail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import UserManagement from '../pages/UserManagement';

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

        <Route path="/cases"     element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/users"    element={<UserManagement />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
      </Routes>
  )
}

export default AppRoutes
