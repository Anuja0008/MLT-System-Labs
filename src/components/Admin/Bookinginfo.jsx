import React, { useEffect, useState } from 'react';
import { Layout, Table, Button, message, Menu, Space, Tag, Typography } from 'antd';
import { db } from '../../firebase/db';
import { collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import {
  DashboardOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
  ScheduleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// Live Clock
const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Space>
      <span style={{ fontWeight: 'bold', color: '#fff' }}>
        {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </span>
      <span style={{ fontWeight: 'bold', color: '#fff' }}>
        {currentTime.toLocaleTimeString()}
      </span>
    </Space>
  );
};

const Bookinginfo = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'Bookings'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to fetch bookings.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteDoc(doc(db, 'Bookings', id));
      message.success('Booking deleted');
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
      message.error('Failed to delete booking');
    }
  };

  const handleEdit = async (record) => {
    const updatedDate = prompt('Enter new date (YYYY-MM-DD):', record.date);
    if (updatedDate) {
      try {
        await updateDoc(doc(db, 'Bookings', record.id), { date: updatedDate });
        message.success('Booking updated');
        fetchBookings();
      } catch (error) {
        console.error("Error updating booking:", error);
        message.error('Failed to update booking');
      }
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const columns = [
    { title: 'Patient Name', dataIndex: 'patientFullName', key: 'patientFullName', render: text => <b>{text}</b> },
    { title: 'Patient Email', dataIndex: 'patientName', key: 'patientEmail' },
    { title: 'Test Type', dataIndex: 'testType', key: 'testType' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { 
      title: 'Status', 
      dataIndex: 'isConfirmed', 
      key: 'isConfirmed', 
      render: confirmed => <Tag color={confirmed ? 'green' : 'orange'}>{confirmed ? 'Confirmed' : 'Pending'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider width={250} style={{ background: '#181c2e', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
          <MedicineBoxOutlined style={{ marginRight: 10 }} /> Ariana Labs
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['bookings']} style={{ background: 'transparent' }}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate('/admin')}>Dashboard</Menu.Item>
          <Menu.SubMenu key="assistants" icon={<TeamOutlined />} title="Assistants">
            <Menu.Item key="add-assistant" icon={<UserAddOutlined />} onClick={() => navigate('/ADDASSISTANT')}>Add Assistant</Menu.Item>
            <Menu.Item key="manage-assistants" icon={<UserDeleteOutlined />} onClick={() => navigate('/DELETEASSISTANT')}>Delete Assistants</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="patients" icon={<UserOutlined />} onClick={() => navigate('/ViewPatient')}>Patients</Menu.Item>
          <Menu.Item key="bookings" icon={<ScheduleOutlined />} onClick={() => navigate('/Bookinginfo')}>Bookings</Menu.Item>
        </Menu>
      </Sider>

      {/* Main layout */}
      <Layout style={{ marginLeft: 250 }}>
        <Header style={{ padding: '0 24px', background: '#53d726', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>Booking Information</Title>
          <LiveClock />
        </Header>

        <Content style={{ margin: '24px 16px' }}>
          <Title level={4}>Total Bookings: {bookings.length}</Title>
          <Table
            columns={columns}
            dataSource={bookings}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            bordered={false}
            style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            rowClassName={() => 'booking-row'}
          />
        </Content>
      </Layout>

      {/* Custom CSS */}
      <style>{`
        .booking-row td:first-child {
          border-left: 6px solid #53d726;
        }
        .ant-table-tbody > tr.booking-row:hover {
          background: rgba(83, 215, 38, 0.1);
        }
        .ant-table-thead > tr > th {
          background: #f0f5f0;
          font-weight: bold;
        }
      `}</style>
    </Layout>
  );
};

export default Bookinginfo;
