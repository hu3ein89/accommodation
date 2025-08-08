import React, { useState, useEffect } from "react";
import { Layout, Menu, Space, Badge, message, Card, Typography, Avatar, Divider, theme } from "antd";
import { HomeOutlined, LogoutOutlined, PictureOutlined, CalendarOutlined, TeamOutlined, CrownOutlined, DashboardOutlined, MailOutlined, TransactionOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styled from "styled-components";

import { fetchReservations, fetchNotifications, fetchUsers, fetchHotels, fetchPrivateMessages } from "../../api/jsonServer";
import ManageUsers from './ManageUsers';
import ManageHotels from './ManageHotels';
import ManageBookings from './ManageBookings';
import ContentManagement from './ContentManagement';
import Navbar from "../Layout/Navbar";
import ManageMessages from "./ManageMessages";
import ManageTransactions from "./MangeTransactions";
import DashboardStats from "./DashboardStats";


const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useToken } = theme;

const DashboardLayout = styled(Layout)`
  min-height: 100vh;
  background: gray;
`;

const DashboardSider = styled(Sider)`
  &.ant-layout-sider {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  }
  .ant-layout-sider-trigger {
    background:none;
    color:black;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  text-align: center;
`;

const DashboardHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
`;

const DashboardContent = styled(Content)`
  padding: 24px;
  margin: 0;
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
`;

const AdminDashboard = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("hotels");
  const [collapsed, setCollapsed] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState(null);


  const { data: messages = [] } = useQuery({ //a query to get messages for the badge count
    queryKey: ['privateMessages'],
    queryFn: fetchPrivateMessages,
  });
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  // Data fetching
  const { data: reservations = [] } = useQuery({ queryKey: ["reservations"], queryFn: fetchReservations });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    select: (data) => data.filter(user => user.status !== 'deleted')

  });
  const { data: hotels = [] } = useQuery({ queryKey: ["hotels"], queryFn: fetchHotels });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(user?.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['reservations']);
    }, 3600000); 
  
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    message.success('با موفقیت از سیستم خارج شدید');
  };

  const handleSelectHotelToEdit = (hotelId) => {
    setEditingHotelId(hotelId);
    setActiveTab('content');
  };


  const menuItems = [
    { key: 'hotels', icon: <HomeOutlined />, label: 'لیست هتل‌ها' },
    { key: 'users', icon: <TeamOutlined />, label: 'مدیریت کاربران' },
    { key: 'bookings', icon: <CalendarOutlined />, label: 'رزروها' },
    { key: 'content', icon: <PictureOutlined />, label: 'ویرایش محتوا' },
    { key: 'messages', icon: <MailOutlined />, label: <Space>پیام‌ها <Badge count={unreadCount} size="small" /></Space> },
    { key: 'transactions', icon: <TransactionOutlined />, label: <Space>تراکنش‌ها </Space> },
    { key: 'stats', icon: <DashboardOutlined />, label: 'آمار کلی' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'خروج', danger: true }
  ];

  const pageTitles = {
    users: 'مدیریت کاربران',
    hotels: 'لیست هتل‌ها',
    bookings: 'رزروها',
    content: 'ویرایش محتوا',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <ManageUsers />;
      case 'hotels':
        return <ManageHotels onEditHotel={handleSelectHotelToEdit} />;
      case 'bookings':
        return <ManageBookings reservations={reservations} />;
      case 'content':
        return <ContentManagement hotelId={editingHotelId} onBackToList={() => setActiveTab('hotels')} />;
      case 'messages':
        return <ManageMessages />;
      case 'transactions':
        return <ManageTransactions />;
      case 'stats': 
        return <DashboardStats />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout dir="rtl" style={{ marginTop: '60px' }}>
      <Navbar />
      <DashboardSider
        style={{ backgroundColor: 'InfoBackground' }}
        width={280}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
      >
        <ProfileHeader>
          <Avatar size={collapsed ? 40 : 64} icon={<CrownOutlined />} style={{ backgroundColor: 'rgb:19,121,180' }} />
          {!collapsed && (
            <>
              <Title level={4} style={{ marginTop: '16px', marginBottom: '4px' }}>پنل مدیریت</Title>
              <Text type="secondary">{user?.firstName || 'مدیر سیستم'}</Text>
            </>
          )}
        </ProfileHeader>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            if (key === 'logout') handleLogout();
            else setActiveTab(key);
          }}
          items={menuItems}
        />
      </DashboardSider>

      <Layout>

        <DashboardContent>
          {activeTab !== 'content' && (
            <StatsCard style={{ background: token.colorInfoBg, borderColor: token.colorInfoBorder }}>
              <Space className="stats-space" split={<Divider type="vertical" />} size="large" wrap>
                <Space>
                  <Text strong>تعداد هتل‌ها:</Text>
                  <Text>{hotels.length}</Text>
                </Space>
                <Space>
                  <Text strong>تعداد کاربران:</Text>
                  <Text>{users.filter(user => user.role?.toLowerCase() === 'guest').length}</Text>
                </Space>
                <Space>
                  <Text strong>تعداد مدیران:</Text>
                  <Text>{users.filter(user => user.role?.toLowerCase() === 'hotel manager').length}</Text>
                </Space>
                <Space>
                  <Text strong>تعداد رزروها:</Text>
                  <Text>{reservations.length}</Text>
                </Space>
              </Space>
            </StatsCard>
          )}
          {renderContent()}
        </DashboardContent>
      </Layout>
    </DashboardLayout>
  );
};

export default AdminDashboard;