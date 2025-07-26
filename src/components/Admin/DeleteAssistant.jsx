import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/db';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Layout, Table, Button, Popconfirm, message, Card } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';

const { Header, Content } = Layout;

function DELETEASSISTANT() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const assistantsData = querySnapshot.docs
        .filter(doc => doc.data().role === 'Assistant')
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setAssistants(assistantsData);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      message.error('Failed to load assistants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      message.success('Assistant deleted successfully');
      fetchAssistants();
    } catch (error) {
      console.error('Error deleting assistant:', error);
      message.error('Failed to delete assistant');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
    {
      title: 'Contact',
      dataIndex: 'contactNumber',
      key: 'contact',
      responsive: ['sm'],
      render: (text) => text || 'N/A',
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this assistant?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            type="primary"
            shape="circle"
            size="middle"
            style={{ transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ backgroundColor: '#001529' }}
      />
      <Layout>
        <Header style={styles.header}>
          <h1 style={styles.headerTitle}>Manage Assistants</h1>
        </Header>
        <Content style={styles.content}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
          >
            <Table
              dataSource={assistants}
              columns={columns}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 6 }}
              scroll={{ x: 'max-content' }}
              style={styles.table}
              rowClassName={() => 'assistant-row'}
            />
          </Card>
        </Content>
      </Layout>

      <style jsx="true">{`
        .assistant-row:hover {
          background-color: #f0f7ff !important;
          cursor: pointer;
        }
      `}</style>
    </Layout>
  );
}

const styles = {
  header: {
    background: '#fff',
    padding: '0 24px',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    height: 64,
  },
  headerTitle: {
    fontSize: '28px',
    margin: 0,
    color: '#1890ff',
    fontWeight: 'bold',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  content: {
    margin: '24px 16px',
    padding: 24,
    minHeight: 280,
    backgroundColor: '#f5f7fa',
  },
  table: {
    width: '100%',
  },
};

export default DELETEASSISTANT;
