import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMicroscope, FaFlask, FaBrain } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './about.css';

function About() {
  const features = [
    { icon: <FaMicroscope size={24} />, title: "Advanced Equipment", description: "Cutting-edge technology for precise research" },
    { icon: <FaFlask size={24} />, title: "Innovative Research", description: "Pushing boundaries in scientific discovery" },
    { icon: <FaBrain size={24} />, title: "Expert Team", description: "Collaborate with leading scientists" }
  ];

  return (
    <div className="aboutlab-container">
      <motion.div 
        className="contentwrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="gradienttext">Welcome to Our <span className="highlight">Ariana Lab</span></h1>
        
        <p className="leadtext">
          Where science meets creativity in a dynamic, collaborative environment designed to 
          <span className="text-highlight"> accelerate discovery</span> and 
          <span className="text-highlight"> foster breakthroughs</span>.
        </p>

        <div className="featuresgrid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="featurecard"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="featureicon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="aboutcontent">
          <p>
            Our AI-enhanced lab integrates the latest technology with innovative methodologies
            to explore the frontiers of science. Designed for researchers, students, and innovators,
            our space combines <span className="text-highlight">state-of-the-art equipment</span> with 
            <span className="text-highlight"> expert guidance</span> to maximize your potential.
          </p>
          <p>
            Through our <span className="text-highlight">interactive workshops</span>, 
            <span className="text-highlight"> collaborative projects</span>, and 
            <span className="text-highlight"> hands-on learning programs</span>, we create an ecosystem
            where ideas flourish and solutions emerge. Our AI-driven analytics tools provide real-time
            insights to accelerate your research.
          </p>
        </div>

        <div className="contact-info">
          <h2>Ready to Innovate With Us?</h2>
          <div className="contactdetails">
            <motion.div 
              className="contactitem"
              whileHover={{ scale: 1.1 }}
            >
              <div className="contacticon">
                <FaPhoneAlt size={24} />
              </div>
              <p>(123) 456-7890</p>
            </motion.div>
            <motion.div 
              className="contactitem"
              whileHover={{ scale: 1.1 }}
            >
              <div className="contacticon">
                <FaEnvelope size={24} />
              </div>
              <p>info@lab.com</p>
            </motion.div>
          </div>
          <button className="ctabutton">Schedule a Lab Tour</button>
        </div>
      </motion.div>
    </div>
  );
}

export default About;