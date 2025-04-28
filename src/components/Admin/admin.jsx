import React from 'react';
import { Layout, Menu, Card, Button } from 'antd';
import {
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Link, Routes, Route } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const Admin = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
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
            <Link to="/admin/patients">Patients</Link>
          </Menu.Item>
          <Menu.Item key="bookings" icon={<CalendarOutlined />}>
            <Link to="/admin/bookings">Bookings</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        </Header>
        
        <Content style={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-assistant" element={<AddAssistant />} />
            <Route path="/manage-assistants" element={<ManageAssistants />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/bookings" element={<Bookings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

// UI Components
const Dashboard = () => (
  <Card title="Dashboard" style={styles.card}>
    <div style={styles.buttonContainer}>
      <Link to="/admin/add-assistant">
        <Button type="primary" icon={<UserAddOutlined />} style={styles.button}>
          Add Assistant
        </Button>
      </Link>
      <Link to="/admin/manage-assistants">
        <Button icon={<UserDeleteOutlined />} style={styles.button}>
          Manage Assistants
        </Button>
      </Link>
      <Link to="/admin/patients">
        <Button icon={<TeamOutlined />} style={styles.button}>
          View Patients
        </Button>
      </Link>
      <Link to="/admin/bookings">
        <Button icon={<CalendarOutlined />} style={styles.button}>
          Manage Bookings
        </Button>
      </Link>
    </div>
  </Card>
);

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
  },
  headerTitle: {
    fontSize: '20px',
    margin: '16px 0',
    color: '#333',
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
};

export default Admin;