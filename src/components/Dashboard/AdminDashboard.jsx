import React, { useState, useEffect } from "react";
import { Layout, Menu, Space, Badge, message, Card, Typography, Avatar, Divider, theme, Button } from "antd";
import {
    HomeOutlined,
    LogoutOutlined,
    PictureOutlined,
    CalendarOutlined,
    TeamOutlined,
    CrownOutlined,
    DashboardOutlined,
    MailOutlined,
    TransactionOutlined, 
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query"; 
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
  background: #f0f2f5;
`;

const DashboardSider = styled(Sider)`
  &.ant-layout-sider {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    background: #fff !important; 
  }

  &.ant-layout-sider-below {
    position: fixed !important; 
    top: 60px;
    right: 0;
    height: calc(100vh - 60px);
    z-index: 1000;
  }

  /* --- 1. STYLE FOR THE STANDARD TRIGGER (Desktop View) --- */
  /* This one appears at the bottom when collapsed width is > 0 */
  .ant-layout-sider-trigger {
    background: white; 
    color: black; 
    &:hover {
      background: #002140; 
    }
  }

  .ant-layout-sider-trigger:hover {
    background: lightgray;

  /* --- 2. STYLE FOR THE ZERO-WIDTH TRIGGER (Mobile View) --- */
  /* This is the one you found! It sticks to the side when collapsed width is 0 */
  .ant-layout-sider-zero-width-trigger {
    /* Position and size are handled by Ant Design, we just change the look */
    background: #356da3; /* This is the background color you wanted */
    color: #fff; /* Color of the > arrow icon */
    
    /* I adjusted the border-radius for your Right-to-Left (RTL) layout */
    border-radius: 8px 0 0 8px; 
    
    /* (Optional) Add a nice hover effect */
    &:hover {
        background: #4a8dcf; /* A slightly lighter color on hover */
    }
  }
`;

// Header section inside the Sider for user profile
const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  text-align: center;
`;

// --- Mobile Overlay ---
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999; /* Positioned just below the Sider */
`;

// --- Main Content Area ---
const DashboardContent = styled(Content)`
  padding: 20px;
  display:flex
  flex:wrap;
  margin: 0;
`;


const AppHeader = styled(Header)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 24px;
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
`;


const AdminDashboard = () => {
    const { token } = useToken();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("hotels");
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false); 
    const [editingHotelId, setEditingHotelId] = useState(null);


    const { data: messages = [] } = useQuery({
        queryKey: ['privateMessages'],
        queryFn: fetchPrivateMessages,
    });
    const unreadCount = messages.filter(m => m.status === 'unread').length;

    // Data fetching queries
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
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }, 3600000); // 1 hour
        return () => clearInterval(interval);
    }, [queryClient]);

    const handleLogout = () => {
        logout();
        navigate("/login");
        message.success('با موفقیت از سیستم خارج شدید');
    };

    const handleSelectHotelToEdit = (hotelId) => {
        setEditingHotelId(hotelId);
        setActiveTab('content');
    };

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            handleLogout();
        } else {
            setActiveTab(key);
            if (isMobile) {
                setCollapsed(true); 
            }
        }
    };

    const menuItems = [
        { key: 'hotels', icon: <HomeOutlined />, label: 'لیست هتل‌ها' },
        { key: 'users', icon: <TeamOutlined />, label: 'مدیریت کاربران' },
        { key: 'bookings', icon: <CalendarOutlined />, label: 'رزروها' },
        { key: 'content', icon: <PictureOutlined />, label: 'ویرایش محتوا' },
        { key: 'messages', icon: <MailOutlined />, label: <Space>پیام‌ها <Badge count={unreadCount} size="small" /></Space> },
        { key: 'transactions', icon: <TransactionOutlined />, label: <Space>تراکنش‌ها</Space> },
        { key: 'stats', icon: <DashboardOutlined />, label: 'آمار کلی' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'خروج', danger: true }
    ];

    const pageTitles = {
        users: 'مدیریت کاربران',
        hotels: 'لیست هتل‌ها',
        bookings: 'رزروها',
        content: 'ویرایش محتوا',
        messages: 'پیام‌ها',
        transactions: 'تراکنش‌ها',
        stats: 'آمار کلی'
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
                return <ManageHotels onEditHotel={handleSelectHotelToEdit} />; // Default view
        }
    };

    return (
        <DashboardLayout dir="rtl" style={{ marginTop: '60px' }}>
            <Navbar />
            {isMobile && !collapsed && <Overlay onClick={() => setCollapsed(true)} />}

            <DashboardSider
                width={260}
                theme="light"
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="lg" 
                collapsedWidth={isMobile ? 0 : 80} 
                onBreakpoint={(broken) => {
                    setIsMobile(broken); 
                    if (broken) {
                       setCollapsed(true); 
                    }
                }}
            >
                <ProfileHeader>
                    <Avatar size={collapsed ? 40 : 64} icon={<CrownOutlined />} style={{ backgroundColor: 'rgb(19, 121, 180)' }} />
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
                    onClick={handleMenuClick}
                    items={menuItems}
                />
            </DashboardSider>

            <Layout>
                 <AppHeader>
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>
                            {pageTitles[activeTab]}
                        </Title>
                    </Space>
                </AppHeader>

                <DashboardContent>
                    {activeTab !== 'content' && (
                        <StatsCard style={{ background: token.colorInfoBg, borderColor: token.colorInfoBorder }}>
                            <Space split={<Divider type="vertical" />}  wrap>
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