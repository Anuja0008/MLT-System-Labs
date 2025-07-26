import React, { useEffect, useState } from 'react';
import { Layout, Table, Button, message } from 'antd';
import { db } from '../../firebase/db'; // Adjust the import path if needed
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import Sidebar from './Sidebar';

const { Header, Content } = Layout;

const Bookinginfo = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'Bookings'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to fetch bookings.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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
        await updateDoc(doc(db, 'Bookings', record.id), {
          date: updatedDate
        });
        message.success('Booking updated');
        fetchBookings();
      } catch (error) {
        console.error("Error updating booking:", error);
        message.error('Failed to update booking');
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientFullName',
      key: 'patientFullName',
    },
    {
      title: 'Patient Email',
      dataIndex: 'patientName',
      key: 'patientEmail',
    },
    {
      title: 'Test Type',
      dataIndex: 'testType',
      key: 'testType',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'isConfirmed',
      key: 'isConfirmed',
      render: (confirmed) => confirmed ? 'Confirmed' : 'Pending',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)} type="link">Edit</Button>
          <Button onClick={() => handleDelete(record.id)} danger type="link">Delete</Button>
        </>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header style={{
          background: '#fff',
          padding: 20,
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1890ff'
        }}>
          Booking Information
        </Header>
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          background: '#f9f9f9',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h2>Total Bookings: {bookings.length}</h2>
          <Table
            columns={columns}
            dataSource={bookings}
            loading={loading}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Bookinginfo;
