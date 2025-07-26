import React, { useState, useEffect } from 'react';
import { Layout, Table, Input, Button, Popconfirm, message, Space } from 'antd';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/db'; // Adjust based on your folder structure
import Sidebar from './Sidebar'; // Import your Sidebar component

const { Content } = Layout;

const Resetpassword = () => {
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
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
    setFormData({
      ...formData,
      [field]: e.target.value
    });
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
          <Button disabled={editingKey !== ''} onClick={() => edit(record)} type="link">
            Edit
          </Button>
        );
      }
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Content style={{ margin: '16px' }}>
          <h2 style={{ marginBottom: 16 }}>Manage Assistant Accounts</h2>
          <Table
            dataSource={assistants}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Resetpassword;
