import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Authentication/login'; // Make sure the Login component is correctly imported
import Home1 from './components/Home1/welcome';
// import BookingForm from './components/Booking/BookingForm';
import DoctorProfile from './components/Profile/profile';
import Patientprofile from './components/Patient/patientprofile';
import Appointments from './components/Profile/apppoinment';
import Calculation from './components/Profile/Calculations';
import BUN from '../src/components/Calculations/bun';
import EGFR from './components/Calculations/egfr';
import ForgetPassword from './components/Authentication/forgetpassword';
import RESULT from './components/Patient/results';
// import Chatbot from './components/Home1/chatbot';
import IDC from './components/Calculations/idc';
import INR from './components/Calculations/inr';
import LPC from './components/Calculations/LPC';


const App = () => {
  return (
    <Router>
      <Routes>

     <Route path="/" element={<Home1/>}/>

      <Route path="/Login" element={<Login />} />
      
      <Route path="/Doctorprofile" element={<DoctorProfile />} />
      <Route path="/Patientprofile" element={<Patientprofile />} />
      <Route path="/Appointments" element={<Appointments />} />
      {/* <Route path="/BookingForm" element={<BookingForm />} /> */}
      <Route path="/Calculation" element={<Calculation />} />
      <Route path="/BUN" element={<BUN />} />
      <Route path="/EGFR" element={<EGFR />} />
      <Route path="/ForgetPassword" element={<ForgetPassword />} />
      <Route path="/RESULT" element={<RESULT />} />
      {/* <Route path="/Chatbot" element={<Chatbot />} /> */}
      <Route path="/IDC" element={<IDC />} />
      <Route path="/INR" element={<INR />} />
      <Route path="/LPC" element={<LPC />} />
      




      </Routes>
    </Router>
  );
};

export default App;
