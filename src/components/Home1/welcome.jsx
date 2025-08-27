import React from "react";
import "./DiagnosticsLab.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom";
import "./testdetails.css";

import contactImage from '../../Photos/bun.jpg';
import contactImage1 from '../../Photos/egfr.jpg';
import contactImage2 from '../../Photos/inr.jpg';
import contactImage3 from '../../Photos/ids.jpeg';
import contactImage4 from '../../Photos/Lipid.jpg';
import Chatbot from '../Home1/chatbot'; 
import BMI from '../Home1/BMI'; 

function Home1() {

  const navigate=useNavigate();
  
  const gotologin=()=>
  {
    navigate("/login");
  }
  return (
    <div className="diagnostics-lab">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>Ariana Labs</h1>
        </div>
        <ul className="nav-links">
         
          <li><a href="#home">Home</a></li>
          <li><a href="/About">About</a></li>
          {/* <li><a href="/Chatbot">Services</a></li> */}
          <li><a href="/Login2">Admin</a></li>

          
        </ul>
      </nav>

      Hero Section
      <section className="hero-section">
        <div className="hero-content">
          <h2>Welcome To Andriana Lab Network</h2>
          <p>Your trusted partner in accurate and reliable diagnostic services.</p>
          <button className="cta-button"  onClick={gotologin}>Book a Test</button>
        </div>
        
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2>Our Services</h2>

        
        
        <div className="services-grid">
          <div className="service-card">
            
            <h3> Insulin Dose Calculator
            </h3>
            <p>Explore our wide range of diagnostic tests.</p>
          </div>

          <div className="service-card">
            <h3>Blood Urea Nitrogen (BUN) to  Creatinine Ratio </h3>
            <p>Convenient testing at your location.</p>
          </div>
          <div className="service-card">
            <h3>Estimated Glomerular Filtration Rate (eGFR)
            </h3>
            <p>Our accreditations and certifications.</p>
          </div>
          <div className="service-card">
            <h3> INR (International Normalized Ratio)
            </h3>
            <p>State-of-the-art laboratory facilities.</p>
          </div>
          <div className="service-card">
            <h3>Lipid Profile Calculation</h3>
            <p>Access your test reports online.</p>
          </div>
         
        </div>
      </section>

     {/* <div className="horizontal-slider">
     <div className="slider">
        <div className="card">Card 1</div>
        <div className="card">Card 2</div>
        <div className="card">Card 3</div>
        <div className="card">Card 4</div>
        <div className="card">Card 5</div>
      </div>
      

     </div> */}

<div>
  <h3 
    style={{ fontSize: '24px', color: '#333', textAlign: 'center', marginTop: '20px' }}
  >
    About Checkups
  </h3>

  <section className="about-section">
  <div className="image-container">
    <h1>BUN Test</h1>
    <img className="image" src={contactImage} alt="Contact Us" />
    <h4 className="text1">
      A blood urea nitrogen (BUN) test measures the amount of urea nitrogen in your blood.
      Urea nitrogen is a waste product created when your liver breaks down protein.
      A BUN test can help diagnose or monitor kidney disease.
    </h4>
  </div>


  <div className="image-container">
  <h1>EGFR Test</h1>
    <img className="image" src={contactImage1} alt="Contact Us" />
    <h4 className="text1">
     An eGFR (estimated glomerular filtration rate) test estimates how well your kidneys filter waste by measuring creatinine in your blood. It uses factors like age and sex to assess kidney function and detect kidney disease.</h4>
  </div>

  <div className="image-container">
  <h1>INR Test</h1>
    <img className="image" src={contactImage2} alt="Contact Us" />
    <h4 className="text1">
    An INR (International Normalized Ratio) test measures how long your blood takes to clot. It’s mainly used to monitor warfarin treatment and helps detect clotting disorders or liver problems by standardizing clotting times.</h4>
  </div>
</section>

<section className="about-section">
  <div className="image-container">
    <h1>IDS Test</h1>
    <img className="image" src={contactImage3} alt="Contact Us" />
    <h4 className="text1">
     An Insulin Dose Calculator helps determine the correct insulin dose based on your blood sugar levels, carbohydrate intake, and activity. It supports effective diabetes management by personalizing insulin needs for safer and more accurate dosing.
    </h4>
  </div>


  <div className="image-container">
  <h1>IDS Test</h1>
    <img className="image" src={contactImage4} alt="Contact Us" />
    <h4 className="text1">
     A Lipid Profile test measures the levels of fats, including cholesterol and triglycerides, in your blood. It helps assess your risk for heart disease and guides treatment to maintain healthy cholesterol and lipid levels.
    </h4>
  </div>

  <div className="image-container">
  {/* <h1>EGFR Test</h1>
    <img className="image" src={contactImage1} alt="Contact Us" />
    <h4 className="text1">
      A blood urea nitrogen (BUN) test measures the amount of urea nitrogen in your blood.
      Urea nitrogen is a waste product created when your liver breaks down protein.
      A BUN test can help diagnose or monitor kidney disease.
    </h4> */}
    <Chatbot />
    <BMI/>
   
  </div>
</section>

<section className="apply-note">
  <h2>Pre-Test Instructions</h2>
  <table>
    <thead>
      <tr>
        <th>Test Type</th>
        <th>Instructions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Blood Tests (e.g., CBC, Glucose, Cholesterol)</td>
        <td>
          <ul>
            <li>Fasting: Instruct the patient to fast for 8-12 hours before the test (water is usually allowed).</li>
            <li>Medications: Clarify if any medications should be taken or withheld prior to the test.</li>
            <li>Hydration: Advise the patient to drink plenty of water unless instructed otherwise.</li>
            <li>Clothing: Recommend wearing a short-sleeved shirt for blood draw.</li>
            <li>Avoid Alcohol or Caffeine: Instruct the patient to avoid alcohol and caffeine for 24 hours before the test.</li>
            <li>Arrival: Remind the patient to arrive 10-15 minutes early.</li>
            <li>Bring Necessary Documents: Ask the patient to bring relevant ID and test order forms.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>Urine Tests (e.g., Urinalysis, Pregnancy Test)</td>
        <td>
          <ul>
            <li>Sample Collection: Instruct the patient on how to collect a clean urine sample.</li>
            <li>Avoid Certain Foods/Drinks: Advise the patient to avoid foods or drinks that can interfere with the test.</li>
            <li>Hydration: Encourage drinking plenty of water before the test.</li>
            <li>Medication: Ask the patient to inform you about any current medications.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>Imaging Tests (e.g., X-rays, Ultrasound)</td>
        <td>
          <ul>
            <li>Clothing: Instruct the patient to wear comfortable clothing without metal.</li>
            <li>Metal Objects: Advise the patient to remove all jewelry before the test.</li>
            <li>Food/Drink Restrictions: The patient may need to fast for a certain period before the test.</li>
            <li>Pregnancy Considerations: Ensure the patient informs the provider if they are pregnant.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>Other Tests (e.g., ECG, Pulmonary Function Test)</td>
        <td>
          <ul>
            <li>Medication: Ask the patient if they are on any medications that may affect the test.</li>
            <li>Avoid Stimulants: Instruct the patient to avoid caffeinated drinks before the test.</li>
            <li>Resting: Ensure the patient knows they may need to be calm before certain tests.</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>

  <h2>Additional Pre-Test Instructions</h2>
  <ol>
    <li><strong>Fasting (if required):</strong> Fast for 8-12 hours before blood tests like glucose, cholesterol, etc. Drink only water.</li>
    <li><strong>Medication Guidance:</strong> Confirm if any medications need to be stopped or continued (e.g., blood thinners, insulin). Always inform the healthcare provider about current medications.</li>
    <li><strong>Hydration:</strong> Drink plenty of water (except for fasting tests). This is especially important for blood and urine tests.</li>
    <li><strong>Arrive Early:</strong> Arrive 10-15 minutes before the scheduled test time for paperwork and preparation.</li>
    <li><strong>Clothing:</strong> Wear easy-to-remove clothing, especially for tests that require blood draws or imaging (e.g., short sleeves for blood tests).</li>
    <li><strong>Metal Removal:</strong> Remove jewelry or metal objects before tests like X-rays or MRIs.</li>
    <li><strong>Test-Specific Instructions:</strong> For imaging tests, be aware of fasting requirements or contrast dye usage. For urine tests, follow sample collection guidelines (e.g., clean-catch sample).</li>
  </ol>
</section>
</div>


      

{/* 
      contact
      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>Have questions? Reach out to us for more information.</p>
        <button className="cta-button">Get in Touch</button>
      </section> */}

      {/* Footer */}
      {/* <footer className="footer">
        <p>&copy; 2023 LHDDiagnostics. All rights reserved.</p>
      </footer> */}
    </div>
  );
}

export default Home1;