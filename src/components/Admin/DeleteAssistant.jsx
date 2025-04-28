import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/db';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Layout, Table, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar'; // Import the Sidebar component

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
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Contact',
      dataIndex: 'contactNumber',
      key: 'contact',
    },
    {
      title: 'Action',
      key: 'action',
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
            type="text"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Use the imported Sidebar component */}
      <Sidebar 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
      />
      
      <Layout>
        <Header style={styles.header}>
          <h1 style={styles.headerTitle}>Manage Assistants</h1>
        </Header>
        <Content style={styles.content}>
          <div style={styles.tableContainer}>
            <Table 
              dataSource={assistants} 
              columns={columns} 
              loading={loading}
              rowKey="id"
              style={styles.table}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

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
  tableContainer: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
  }
};

export default DELETEASSISTANT;