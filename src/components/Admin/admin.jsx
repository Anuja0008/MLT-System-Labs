import React from 'react';
import { Layout, Menu, Card, Button, Row, Col, Statistic, Space, Typography, theme, Table, Tabs } from 'antd';
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/db';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const offeredTests = [
  "Blood Urea Nitrogen",
  "Estimated Glomerular Filtration Rate",
  "Insulin Dose Calculator",
  "INR (International Normalized Ratio)",
  "Lipid Profile"
];

// ================= Live Clock =================
const LiveClock = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Space>
      <CalendarOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
      <span style={{ fontSize: "0.9rem", color: "#fff", fontWeight: "bold" }}>
        {currentTime.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </span>
      <span style={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}>
        {currentTime.toLocaleTimeString()}
      </span>
    </Space>
  );
};

// ================= Users List =================
const UsersList = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Contact Number', dataIndex: 'contactNumber', key: 'contactNumber' },
    { title: 'DOB', dataIndex: 'dob', key: 'dob' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    { title: 'NIC/Passport', dataIndex: 'nicOrPassport', key: 'nicOrPassport' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
  ];

  const assistants = users.filter(u => u.role === "Assistant");
  const patients = users.filter(u => u.role === "Patient");

  return (
    <Card title="Users Information" style={{ marginTop: 24 }}>
      <Tabs defaultActiveKey="assistants">
        <TabPane tab="Assistants" key="assistants">
          <Table
            dataSource={assistants}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
        <TabPane tab="Patients" key="patients">
          <Table
            dataSource={patients}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

// ================= Pie Chart for Test Popularity =================
const TestPopularityPie = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF0'];

  React.useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Bookings"));
        const bookings = snapshot.docs.map(doc => doc.data());

        const counts = offeredTests.map((test) => ({
          name: test,
          value: bookings.filter(b => b.testType === test).length
        }));

        setData(counts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <p>Loading chart...</p>;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
        {`${data[index].name}: ${data[index].value}`}
      </text>
    );
  };

  return (
    <Card title="Most Selected Tests" style={{ marginTop: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}`, 'Bookings']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ================= Dashboard Stats =================
const Dashboard = ({ onResetPassword, onNavigate }) => {
  const [counts, setCounts] = React.useState({ patients: 0, assistants: 0, bookings: 0, active: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const usersSnap = await getDocs(collection(db, 'users'));
        const allUsers = usersSnap.docs.map(d => d.data());

        const patientsCount = allUsers.filter(u => u.role === "Patient").length;
        const assistantsCount = allUsers.filter(u => u.role === "Assistant").length;

        const bookingsSnap = await getDocs(collection(db, 'Bookings'));
        const bookingsCount = bookingsSnap.size;
        const activeCount = bookingsSnap.docs.filter(d => d.data().status === "active").length;

        setCounts({
          patients: patientsCount,
          assistants: assistantsCount,
          bookings: bookingsCount,
          active: activeCount
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

      <UsersList />
      <TestPopularityPie />
    </>
  );
};

// ================= Main Admin Layout =================
const Admin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here, e.g. Firebase signOut
    console.log("Logged out!");
    navigate("/login"); // redirect to login page
  };

  return (
    <Layout>
      <Sider
        width={250}
        style={{
          background: '#181c2e',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
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
        </div>

        {/* Logout button at bottom */}
        <div style={{ padding: 16 }}>
          <Button type="primary" icon={<LogoutOutlined />} block onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 250, minHeight: '100vh' }}>
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
