import React, { useState, useEffect } from 'react';
import { Layout, Table, Input, Button, Popconfirm, message, Space, Typography, Menu } from 'antd';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/db';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ScheduleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// Live Clock Component
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

const Resetpassword = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'Assistant'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssistants(data);
    } catch (err) {
      message.error("Failed to fetch data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    setEditingKey(record.id);
    setFormData({
      name: record.name,
      email: record.email,
      password: record.password,
    });
  };

  const cancel = () => {
    setEditingKey('');
    setFormData({});
  };

  const save = async (id) => {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      message.success('Assistant updated successfully');
      setEditingKey('');
      setFormData({});
      fetchAssistants();
    } catch (err) {
      message.error('Update failed');
    }
  };

  const onInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) =>
        isEditing(record) ? (
          <Input value={formData.name} onChange={(e) => onInputChange(e, 'name')} />
        ) : text
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (text, record) =>
        isEditing(record) ? (
          <Input value={formData.email} onChange={(e) => onInputChange(e, 'email')} />
        ) : text
    },
    {
      title: 'Password',
      dataIndex: 'password',
      render: (text, record) =>
        isEditing(record) ? (
          <Input.Password value={formData.password} onChange={(e) => onInputChange(e, 'password')} />
        ) : '********'
    },
    {
      title: 'Action',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button onClick={() => save(record.id)} type="link">Save</Button>
            <Popconfirm title="Cancel changes?" onConfirm={cancel}>
              <Button type="link" danger>Cancel</Button>
            </Popconfirm>
          </Space>
        ) : (
          <Button disabled={editingKey !== ''} onClick={() => edit(record)} type="link">Edit</Button>
        );
      }
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: '#181c2e', position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
          <DashboardOutlined style={{ marginRight: 8 }} /> Admin Panel
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['reset']}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate('/admin')}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="assistants" icon={<TeamOutlined />} onClick={() => navigate('/ADDASSISTANT')}>
            Assistants
          </Menu.Item>
          <Menu.Item key="bookings" icon={<ScheduleOutlined />} onClick={() => navigate('/Bookinginfo')}>
            Bookings
          </Menu.Item>
          <Menu.Item key="reset" icon={<ReloadOutlined />}>
            Reset Password
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main layout */}
      <Layout style={{ marginLeft: 250 }}>
        <Header style={{ padding: '0 24px', background: '#53d726', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
          <Title level={4} style={{ margin: 0, color: '#fff' }}>Reset Assistant Password</Title>
          <LiveClock />
        </Header>

        <Content style={{ margin: '24px 16px', overflowY: 'auto' }}>
          <div style={{ padding: 24, background: '#f9fafb', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: 16 }}>Manage Assistant Accounts</h2>
            <Table
              dataSource={assistants}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              bordered
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Resetpassword;
