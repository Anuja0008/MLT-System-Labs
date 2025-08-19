import React from 'react';
import { Layout, Menu, Card, Button, Row, Col, Statistic, Space, Typography, theme } from 'antd';
import {
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined,
  ReloadOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/db';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// Live Clock Component
const LiveClock = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Space>
      <CalendarOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
      <span style={{ fontSize: "0.9rem", color: "#fff", fontWeight: "bold" }}>
        {currentTime.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </span>
      <span style={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}>
        {currentTime.toLocaleTimeString()}
      </span>
    </Space>
  );
};

// Dashboard Statistics
const Dashboard = ({ onResetPassword, onNavigate }) => {
  const [counts, setCounts] = React.useState({ patients: 0, assistants: 0, bookings: 0, active: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const patientsQuery = query(collection(db, 'users'), where('role', '==', 'Patient'));
        const assistantsQuery = query(collection(db, 'users'), where('role', '==', 'Assistant'));
        const bookingsQuery = collection(db, 'Bookings');
        const activeQuery = query(collection(db, 'Bookings'), where('status', '==', 'active'));

        const [patientsSnap, assistantsSnap, bookingsSnap, activeSnap] = await Promise.all([
          getDocs(patientsQuery),
          getDocs(assistantsQuery),
          getDocs(bookingsQuery),
          getDocs(activeQuery)
        ]);

        setCounts({
          patients: patientsSnap.size,
          assistants: assistantsSnap.size,
          bookings: bookingsSnap.size,
          active: activeSnap.size
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const statCards = [
    { title: 'Total Patients', value: counts.patients, icon: <UserOutlined />, gradient: 'linear-gradient(135deg, #6398cb 0%, #096dd9 100%)' },
    { title: 'Total Assistants', value: counts.assistants, icon: <TeamOutlined />, gradient: 'linear-gradient(135deg, #518b97 0%, #179ba4 100%)' },
    { title: 'Total Bookings', value: counts.bookings, icon: <CalendarOutlined />, gradient: 'linear-gradient(135deg, #8c64c5 0%, #5221a0 100%)' },
    { title: 'Active Bookings', value: counts.active, icon: <ScheduleOutlined />, gradient: 'linear-gradient(135deg, #f7c664 0%, #d48806 100%)' }
  ];

  return (
    <>
      <Title level={4}>Overview</Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} hoverable style={{ background: card.gradient, borderRadius: '12px' }}>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.icon}
                loading={loading}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginBottom: 24, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          style={{ background: "#e000009e", borderColor: "#53d726" }}
          onClick={onResetPassword}
        >
          Reset Password
        </Button>
      </div>

      <Card title="Quick Actions">
        <Space size="middle" wrap>
          <Button icon={<UserAddOutlined />} size="large" onClick={() => onNavigate("/ADDASSISTANT")}>Add Assistant</Button>
          <Button icon={<UserDeleteOutlined />} size="large" onClick={() => onNavigate("/DELETEASSISTANT")}>Manage Assistants</Button>
          <Button icon={<UserOutlined />} size="large" onClick={() => onNavigate("/ViewPatient")}>View Patients</Button>
          <Button icon={<ScheduleOutlined />} size="large" onClick={() => onNavigate("/Bookinginfo")}>View Bookings</Button>
        </Space>
      </Card>
    </>
  );
};

// Main Admin Layout
const Admin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} breakpoint="lg" collapsedWidth="0" style={{ background: '#181c2e' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <MedicineBoxOutlined style={{ marginRight: 10 }} /> Ariana Labs
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']} style={{ background: 'transparent' }}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate('/Admin')}>Dashboard</Menu.Item>
          <Menu.SubMenu key="assistants" icon={<TeamOutlined />} title="Assistants">
            <Menu.Item key="add-assistant" icon={<UserAddOutlined />} onClick={() => navigate('/ADDASSISTANT')}>Add Assistant</Menu.Item>
            <Menu.Item key="manage-assistants" icon={<UserDeleteOutlined />} onClick={() => navigate('/DELETEASSISTANT')}>Delete Assistants</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="patients" icon={<UserOutlined />} onClick={() => navigate('/ViewPatient')}>Patients</Menu.Item>
          <Menu.Item key="bookings" icon={<ScheduleOutlined />} onClick={() => navigate('/Bookinginfo')}>Bookings</Menu.Item>
        
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ padding: '0 24px', background: '#53d726', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, color: "#fff" }}>Admin Dashboard</Title>
          <LiveClock />
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Dashboard 
              onResetPassword={() => navigate("/Resetpassword")} 
              onNavigate={(path) => navigate(path)}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
