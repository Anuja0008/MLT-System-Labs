import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" style={styles.logo}>
        {collapsed ? 'AD' : 'Admin Panel'}
      </div>
      <Menu theme="dark" defaultSelectedKeys={['manage-assistants']} mode="inline">
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
          <Link to="/ViewPatient">Patients</Link>
        </Menu.Item>
        <Menu.Item key="bookings" icon={<CalendarOutlined />}>
          <Link to="/Bookinginfo">Bookings</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

const styles = {
  logo: {
    height: '32px',
    margin: '16px',
    color: 'white',
    textAlign: 'center',
    fontSize: '18px',
  }
};

export default Sidebar;