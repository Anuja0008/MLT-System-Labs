import React, { useState } from 'react';
import { Layout } from 'antd';
import { db } from '../../firebase/db';
import { doc, setDoc } from 'firebase/firestore';
import Sidebar from './Sidebar'; // Import your Sidebar component

const { Header, Content } = Layout;

function ADDASSISTANT() {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    contactNumber: "",
    nicOrPassport: "",
    address: "",
    emergencyContactName: "",
    password: "",
    role: "Assistant"
  });
  const [collapsed, setCollapsed] = useState(false);

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const docRef = doc(db, 'users', adminData.email);
      await setDoc(docRef, {
        ...adminData,
        createdAt: new Date()
      });
      alert('Assistant registered successfully!');
      setAdminData({
        name: "",
        email: "",
        gender: "",
        dob: "",
        contactNumber: "",
        nicOrPassport: "",
        address: "",
        emergencyContactName: "",
        password: ""
      });
    } catch (error) {
      console.error('Error registering assistant:', error);
      alert('Failed to register assistant');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar Component */}
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      
      <Layout>
        <Header style={styles.header}>
          <h1 style={styles.headerTitle}>Register Assistant</h1>
        </Header>
        
        <Content style={styles.content}>
          <div style={styles.formContainer}>
            <form style={styles.form} onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
              {[
                { name: 'name', placeholder: 'Full Name' },
                { name: 'email', placeholder: 'Email', type: 'email' },
                { name: 'gender', placeholder: 'Gender' },
                { name: 'dob', placeholder: 'Date of Birth', type: 'date' },
                { name: 'contactNumber', placeholder: 'Contact Number' },
                { name: 'nicOrPassport', placeholder: 'NIC or Passport Number' },
                { name: 'address', placeholder: 'Address' },
                { name: 'emergencyContactName', placeholder: 'Emergency Contact Name' },
                { name: 'password', placeholder: 'Password', type: 'password' }
              ].map((field) => (
                <input
                  key={field.name}
                  type={field.type || "text"}
                  name={field.name}
                  value={adminData[field.name]}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              ))}

              <button style={styles.button} type="submit">
                Register Assistant
              </button>
            </form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

// Updated styles to work with the layout
const styles = {
  header: {
    background: '#fff',
    padding: '0 24px',
    boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
  },
  headerTitle: {
    fontSize: '20px',
    margin: '16px 0',
    color: '#333',
  },
  content: {
    margin: '24px 16px',
    padding: 24,
    minHeight: 280,
  },
  formContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 112px)',
  },
  form: {
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#0069d9',
    }
  }
};

export default ADDASSISTANT;