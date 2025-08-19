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
import Chatbot from './components/Home1/chatbot';
import IDC from './components/Calculations/idc';
import INR from './components/Calculations/inr';
import LPC from './components/Calculations/LPC';
import BMI from '../src/components/Home1/BMI';
import About from './components/Headerbar/about';
import Admin from './components/Admin/admin';
import ADDASSISTANT from './components/Admin/AddAssistant';
import DELETEASSISTANT from './components/Admin/DeleteAssistant';
import ViewPatient from './components/Admin/ViewPatients';
import Bookinginfo from './components/Admin/Bookinginfo';
import Resetpassword from './components/Admin/Resetpassword';
import Login2 from './components/Admin/Login2';




const App = () => {
  return (
    <Router>
      <Routes>

     <Route path="/" element={<Home1/>}/>

      <Route path="/login" element={<Login />} />
      <Route path="/Doctorprofile" element={<DoctorProfile />} />
      <Route path="/Patientprofile" element={<Patientprofile />} />
      <Route path="/Appointments" element={<Appointments />} />
      {/* <Route path="/BookingForm" element={<BookingForm />} /> */}
      <Route path="/Calculation" element={<Calculation />} />
      <Route path="/BUN" element={<BUN />} />
      <Route path="/EGFR" element={<EGFR />} />
      <Route path="/ForgetPassword" element={<ForgetPassword />} />
      <Route path="/RESULT" element={<RESULT />} />
      <Route path="/Chatbot" element={<Chatbot />} />
      <Route path="/IDC" element={<IDC />} />
      <Route path="/INR" element={<INR />} />
      <Route path="/LPC" element={<LPC />} />
      <Route path="/BMI"  element={<BMI/>}/>
      <Route path="/about"  element={<About/>}/>
      <Route path="/admin" element={<Admin />} />
      <Route path="/AddAssistant" element={<ADDASSISTANT />} />
      <Route path="/DeleteAssistant" element={<DELETEASSISTANT />} />
      <Route path="/ViewPatient" element={<ViewPatient/>}/>
      <Route path='/Bookinginfo' element={<Bookinginfo/>}/>
      <Route path='/Resetpassword' element={<Resetpassword/>}/>
      <Route path='/Login2' element={<Login2/>}/>
      
    
      



     



      </Routes>
    </Router>
  );
};

export default App;
