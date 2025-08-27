import React from 'react';
import { Layout, Menu, Card, Button, Row, Col, Statistic, Space, Typography, theme, Table, Tabs, Tag, Progress } from 'antd';
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
  LogoutOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/db';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const offeredTests = [
  "Blood Urea Nitrogen",
  "Estimated Glomerular Filtration Rate",
  "Insulin Dose Calculator",
  "INR (International Normalized Ratio)",
  "Lipid Profile"
];

// Color palette for charts
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF0', '#FF6B6B', '#36A2EB', '#4BC0C0', '#FF9F40', '#9966FF'];

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
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Contact Number', dataIndex: 'contactNumber', key: 'contactNumber' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => (
      <Tag color={role === "Assistant" ? "blue" : "green"}>{role}</Tag>
    )},
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} size="small">
          View
        </Button>
      ),
    },
  ];

  const assistants = users.filter(u => u.role === "Assistant");
  const patients = users.filter(u => u.role === "Patient");

  return (
    <Card 
      title="Users Information" 
      style={{ marginTop: 24 }}
      extra={<Button type="primary" icon={<UserOutlined />}>Export Data</Button>}
    >
      <Tabs defaultActiveKey="assistants">
        <TabPane tab={`Assistants (${assistants.length})`} key="assistants">
          <Table
            dataSource={assistants}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
        <TabPane tab={`Patients (${patients.length})`} key="patients">
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

// ================= Enhanced Pie Chart for Test Popularity =================
const TestPopularityPie = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Bookings"));
        const bookings = snapshot.docs.map(doc => doc.data());

        const counts = offeredTests.map((test, index) => ({
          name: test,
          value: bookings.filter(b => b.testType === test).length,
          fill: CHART_COLORS[index % CHART_COLORS.length]
        }));

        // Sort by value descending
        counts.sort((a, b) => b.value - a.value);
        
        setData(counts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return (
    <Card title="Most Selected Tests" style={{ marginTop: 24 }}>
      <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Progress type="circle" percent={30} width={60} />
      </div>
    </Card>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
          <p style={{ margin: 0 }}>{`Bookings: ${payload[0].value}`}</p>
          <p style={{ margin: 0 }}>{`Percentage: ${((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const totalBookings = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card 
      title="Test Popularity Distribution" 
      style={{ marginTop: 24 }}
      extra={<Tag color="blue">Total: {totalBookings} bookings</Tag>}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ padding: '10px 0' }}>
            <Title level={5}>Test Breakdown</Title>
            {data.map((item, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>
                    <div style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      backgroundColor: item.fill,
                      marginRight: '8px',
                      borderRadius: '2px'
                    }}></div>
                    {item.name}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>{item.value}</span>
                </div>
                <Progress 
                  percent={((item.value / totalBookings) * 100).toFixed(1)} 
                  size="small" 
                  strokeColor={item.fill}
                  showInfo={false}
                />
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};
// ================= Bar Chart for Monthly Bookings =================
const MonthlyBookingsChart = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Bookings"));
        const bookings = snapshot.docs.map(doc => doc.data());

        // Prepare a map for months
        const monthMap = {
          Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
          Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
        };

        // Count bookings per month
        bookings.forEach(b => {
          let date;
          try {
            if (b.date && typeof b.date.toDate === 'function') {
              date = b.date.toDate(); // Firestore Timestamp
            } else if (typeof b.date === 'string' || b.date instanceof Date) {
              date = new Date(b.date);
            }

            if (!isNaN(date)) {
              const month = date.toLocaleString('default', { month: 'short' });
              if (monthMap[month] !== undefined) {
                monthMap[month]++;
              }
            }
          } catch (error) {
            console.warn('Invalid booking date format:', b.date);
          }
        });

        const monthlyData = Object.entries(monthMap).map(([month, bookings]) => ({
          month,
          bookings
        }));

        setData(monthlyData);
      } catch (err) {
        console.error("Error fetching booking data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return (
    <Card title="Monthly Bookings Trend" style={{ marginTop: 24 }}>
      <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Progress type="circle" percent={30} width={60} />
      </div>
    </Card>
  );

  return (
    <Card title="Monthly Bookings Trend" style={{ marginTop: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="bookings" fill="#36A2EB" name="Number of Bookings" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ================= Dashboard Stats =================
const Dashboard = ({ onResetPassword, onNavigate }) => {
  const [counts, setCounts] = React.useState({ patients: 0, assistants: 0, bookings: 0, active: 0, approved: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        // Fetch users
        const usersSnap = await getDocs(collection(db, 'users'));
        const allUsers = usersSnap.docs.map(d => d.data());
        const patientsCount = allUsers.filter(u => u.role === "Patient").length;
        const assistantsCount = allUsers.filter(u => u.role === "Assistant").length;

        // Fetch bookings
        const bookingsSnap = await getDocs(collection(db, 'Bookings'));
        const bookingsData = bookingsSnap.docs.map(d => d.data());
        const bookingsCount = bookingsSnap.size;
        const activeCount = bookingsData.filter(b => !b.isConfirmed).length; // Pending
        const approvedCount = bookingsData.filter(b => b.isConfirmed).length; // Approved

        setCounts({
          patients: patientsCount,
          assistants: assistantsCount,
          bookings: bookingsCount,
          active: activeCount,
          approved: approvedCount
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
    { title: 'Pending Bookings', value: counts.active, icon: <ScheduleOutlined />, gradient: 'linear-gradient(135deg, #f7c664 0%, #d48806 100%)' },
    { title: 'Approved Bookings', value: counts.approved, icon: <ScheduleOutlined />, gradient: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard Overview</Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          style={{ background: "#1890ff", borderColor: "#1890ff" }}
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </Button>
      </div>
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card 
              bordered={false} 
              hoverable 
              style={{ 
                background: card.gradient, 
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{card.title}</span>}
                value={card.value}
                prefix={React.cloneElement(card.icon, { style: { color: '#fff' } })}
                loading={loading}
                valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card 
        title="Quick Actions" 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            style={{ background: "#e000009e", borderColor: "#53d726" }}
            onClick={onResetPassword}
          >
            Reset Password
          </Button>
        }
      >
        <Space size="middle" wrap>
          <Button icon={<UserAddOutlined />} size="large" onClick={() => onNavigate("/ADDASSISTANT")}>Add Assistant</Button>
          <Button icon={<UserDeleteOutlined />} size="large" onClick={() => onNavigate("/DELETEASSISTANT")}>Manage Assistants</Button>
          <Button icon={<UserOutlined />} size="large" onClick={() => onNavigate("/ViewPatient")}>View Patients</Button>
          <Button icon={<ScheduleOutlined />} size="large" onClick={() => onNavigate("/Bookinginfo")}>View Bookings</Button>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <TestPopularityPie />
        </Col>
        <Col xs={24} lg={12}>
          <MonthlyBookingsChart />
        </Col>
      </Row>

      <UsersList />
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
    console.log("Logged out!");
    navigate("/");
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
          justifyContent: 'space-between',
          boxShadow: '2px 0 6px rgba(0,21,41,.35)'
        }}
      >
        <div>
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            <MedicineBoxOutlined style={{ marginRight: 10, fontSize: '24px' }} /> Ariana Labs
          </div>
          <Menu 
            theme="dark" 
            mode="inline" 
            defaultSelectedKeys={['dashboard']} 
            style={{ background: 'transparent' }}
          >
            <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate('/Admin')}>Dashboard</Menu.Item>
            <Menu.SubMenu key="assistants" icon={<TeamOutlined />} title="Assistants">
              <Menu.Item key="add-assistant" icon={<UserAddOutlined />} onClick={() => navigate('/ADDASSISTANT')}>Add Assistant</Menu.Item>
              <Menu.Item key="manage-assistants" icon={<UserDeleteOutlined />} onClick={() => navigate('/DELETEASSISTANT')}>Manage Assistants</Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="patients" icon={<UserOutlined />} onClick={() => navigate('/ViewPatient')}>Patients</Menu.Item>
            <Menu.Item key="bookings" icon={<ScheduleOutlined />} onClick={() => navigate('/Bookinginfo')}>Bookings</Menu.Item>
          </Menu>
        </div>

        <div style={{ padding: 16 }}>
          <Button type="primary" icon={<LogoutOutlined />} block onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 250, minHeight: '100vh' }}>
        <Header style={{ 
          padding: '0 24px', 
          background:'#53d726', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.12)'
        }}>
          <Title level={4} style={{ margin: 0, color: "#fff" }}>Admin Dashboard</Title>
          <LiveClock />
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ 
            padding: 24, 
            minHeight: 360, 
            background: colorBgContainer, 
            borderRadius: borderRadiusLG 
          }}>
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