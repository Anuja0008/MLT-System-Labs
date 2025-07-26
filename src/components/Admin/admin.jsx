import React, { useEffect, useState } from 'react';
import { Layout, Menu, Card, Button } from 'antd';
import {
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/db'; // Adjust path as needed

const { Header, Content, Sider } = Layout;

const Admin = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', position: 'relative' }}>
      <Sider collapsible>
        <div className="logo" style={styles.logo}>Admin Panel</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/admin">Dashboard</Link>
          </Menu.Item>
          <Menu.SubMenu key="assistants" icon={<TeamOutlined />} title="Assistants">
            <Menu.Item key="add-assistant" icon={<UserAddOutlined />}>
              <Link to="/ADDASSITANT">Add Assistant</Link>
            </Menu.Item>
            <Menu.Item key="manage-assistants" icon={<UserDeleteOutlined />}>
              <Link to="/DELETEASSISTANT">Delete Assistants</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="patients" icon={<TeamOutlined />}>
            <Link to="/ViewPatient">Patients</Link>
          </Menu.Item>
          <Menu.Item key="bookings" icon={<CalendarOutlined />}>
            <Link to="/Bookinginfo">Bookings</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            style={styles.resetButton}
            onClick={() => navigate('/Resetpassword')}
          >
            Reset Password
          </Button>
        </Header>

        <Content style={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-assistant" element={<AddAssistant />} />
            <Route path="/manage-assistants" element={<ManageAssistants />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

// Reset Password Page Component
const ResetPassword = () => {
  return (
    <Card title="Reset Password" style={styles.card}>
      <p>This is where your Reset Password form will go.</p>
      <Link to="/admin">
        <Button>Back to Dashboard</Button>
      </Link>
    </Card>
  );
};

// Dashboard Component with Firestore Counts
const Dashboard = () => {
  const [counts, setCounts] = useState({
    patients: 0,
    assistants: 0,
    bookings: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const patientsQuery = query(collection(db, 'users'), where('role', '==', 'Patient'));
        const assistantsQuery = query(collection(db, 'users'), where('role', '==', 'Assistant'));
        const bookingsQuery = collection(db, 'Bookings');

        const [patientsSnap, assistantsSnap, bookingsSnap] = await Promise.all([
          getDocs(patientsQuery),
          getDocs(assistantsQuery),
          getDocs(bookingsQuery),
        ]);

        setCounts({
          patients: patientsSnap.size,
          assistants: assistantsSnap.size,
          bookings: bookingsSnap.size,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchCounts();
  }, []);

  return (
    <Card title="Dashboard Summary" style={styles.card}>
      <div style={styles.statsContainer}>
        <Card type="inner" title="Total Patients" style={styles.statBox}>
          <h2>{counts.patients}</h2>
        </Card>
        <Card type="inner" title="Total Assistants" style={styles.statBox}>
          <h2>{counts.assistants}</h2>
        </Card>
        <Card type="inner" title="Total Bookings" style={styles.statBox}>
          <h2>{counts.bookings}</h2>
        </Card>
      </div>
    </Card>
  );
};

// Other UI Pages (Dummy)
const AddAssistant = () => (
  <Card title="Add Assistant" style={styles.card}>
    <Link to="/admin">
      <Button>Back to Dashboard</Button>
    </Link>
  </Card>
);

const ManageAssistants = () => (
  <Card title="Manage Assistants" style={styles.card}>
    <Link to="/admin/add-assistant">
      <Button type="primary" icon={<UserAddOutlined />} style={styles.button}>
        Add New Assistant
      </Button>
    </Link>
    <Link to="/admin">
      <Button style={{ marginLeft: 10 }}>Back to Dashboard</Button>
    </Link>
  </Card>
);

const Patients = () => (
  <Card title="Patients" style={styles.card}>
    <Link to="/admin">
      <Button>Back to Dashboard</Button>
    </Link>
  </Card>
);

const Bookings = () => (
  <Card title="Bookings" style={styles.card}>
    <Link to="/admin">
      <Button>Back to Dashboard</Button>
    </Link>
  </Card>
);

// Styles
const styles = {
  logo: {
    height: '32px',
    margin: '16px',
    color: 'white',
    textAlign: 'center',
    fontSize: '18px',
  },
  header: {
    background: '#fff',
    padding: '0 24px',
    boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '20px',
    margin: 0,
    color: '#333',
    flex: 1, // pushes button right
  },
  resetButton: {
    height: '36px',
  },
  content: {
    margin: '24px 16px',
    padding: 24,
    background: '#fff',
    minHeight: 280,
  },
  card: {
    marginBottom: '24px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  button: {
    minWidth: '200px',
    height: '80px',
    fontSize: '16px',
  },
  statsContainer: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  statBox: {
    flex: '1 1 30%',
    textAlign: 'center',
    fontSize: '18px',
  },
};

export default Admin;
