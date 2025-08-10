import React, { useState, useCallback, Suspense, useEffect } from "react";
import {
  Layout,
  Menu,
  Spin,
  Button,
  Result,
  notification,
  Typography,
  Avatar,
  Badge,
  Card,
  Space,
  Divider,
  theme
} from "antd";
import {
  BookOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
  SwapOutlined,
  HeartOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchUserReservations } from "../../api/jsonServer";
import RoomReservationForm from "./RoomReservationForm";
import ReservationList from "./ReservationList";
import HotelComparison from "./HotelComparison";
import Navbar from '../Layout/Navbar'
import '../../styles/UserDashboard.css'
import FavoritesPage from "./Favorites";
import { useReservations } from "../../context/ReservationContext";
import styled from "styled-components";

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


  .ant-layout-sider-trigger {
    background: white; 
    color: black; 
    &:hover {
      background: #002140; 
    }
  }

  .ant-layout-sider-trigger:hover {
    background: lightgray;

  .ant-layout-sider-zero-width-trigger {
    background: #356da3;
    color: #fff; 
    
    border-radius: 8px 0 0 8px; 
    

    &:hover {
        background: #4a8dcf;
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999; /* Positioned just below the Sider */
`;



const UserDashboard = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("reservations");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false); 
  const [defaultHotel, setDefaultHotel] = useState(null); // State for the pre-selected hotel
  const queryClient = useQueryClient();
  const { pendingReservations } = useReservations();
  const [selectedComparisonHotels, setSelectedComparisonHotels] = useState([]);

  const {
    data: reservations = [],
    isPending: reservationsLoading,
  } = useQuery({
    queryKey: ["userReservations", user?.id],
    queryFn: () => fetchUserReservations(user?.id),
    enabled: !!user?.id,
    onError: (error) => {
      notification.error({
        message: "خطا",
        description: error.message || "خطا در دریافت رزروها",
      });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries(['userReservations']);
  };


  const handleReserveFromComparison = (hotel) => {
    setDefaultHotel(hotel); // Set the selected hotel
    setActiveTab("reservationForm"); // Switch to the reservation form tab
  };

  const handleLogout = useCallback(() => {
    try {
      logout();
      navigate("/login");
      notification.success({
        message: "خروج موفق",
        description: "با موفقیت از سیستم خارج شدید",
      });
    } catch (error) {
      notification.error({
        message: "خطا",
        description: error.message || "خطا در خروج از سیستم",
      });
    }
  }, [logout, navigate]);

  const renderMainContent = () => {
    switch (activeTab) {
      case "reservations":
        return (
          <ReservationList
            reservations={reservations.filter((r) => r.userId === user?.id)}
            isLoading={reservationsLoading}
            onReservationSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["userReservations", user?.id],
              });
            }}
          />
        );

      case "reservationForm":
        return (
          <RoomReservationForm
            defaultHotel={defaultHotel}
            user={user}
            onSuccess={() => {
              notification.success({
                message: "موفقیت",
                description: "رزرو با موفقیت ثبت شد",
              });
              queryClient.invalidateQueries({
                queryKey: ["userReservations", user?.id],
              });
              setActiveTab("reservations");
            }}
          />
        );

      case "compare":
        return <HotelComparison userId={user?.id}
          onReserveClick={handleReserveFromComparison}
          selectedHotels={selectedComparisonHotels}
          setSelectedHotels={setSelectedComparisonHotels}
        />;

      case "favorite":
        return <FavoritesPage />;

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Result
        status="403"
        title="دسترسی محدود شده"
        subTitle="لطفاً برای دسترسی به پنل کاربری وارد شوید"
        extra={
          <Button type="primary" onClick={() => navigate("/login")}>
            ورود به سیستم
          </Button>
        }
      />
    );
  }

  return (
    <Layout className="user-dashboard-container" dir="rtl">
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
        <div className="user-profile-header">
          <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
            <Badge dot status="success" offset={[-10, 40]}>
              <Avatar
                size={collapsed ? 40 : 64}
                icon={<UserOutlined />}
                className="user-avatar"
              />
            </Badge>
            {!collapsed && (
              <>
                <Title level={4} className="user-name-title">
                  {user?.firstName} {user?.lastName}
                </Title>
                <Text type="secondary" className="user-email-text">
                  {user?.email}
                </Text>
              </>
            )}
          </Space>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            if (key === "logout") {
              handleLogout();
            } else {
              setActiveTab(key);
            }
          }}
          className="dashboard-menu"
          items={[
            {
              key: "reservations",
              icon: <BookOutlined />,
              label: (
                <div className="menu-item-label">
                  <span>رزروها</span>
                  {!collapsed && (
                    <Badge count={pendingReservations} size="small" />
                  )}
                </div>
              ),
            },
            {
              key: "reservationForm",
              icon: <PlusOutlined />,
              label: "رزرو جدید",
            },
            {
              key: "compare",
              icon: <SwapOutlined />,
              label: "مقایسه هتل‌ها",
            },
            {
              key: "favorite",
              icon: <HeartOutlined />,
              label: "علاقه مندیها",
            },
            {
              type: "divider",
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "خروج",
              danger: true,
            },
          ]}
        />
        {!collapsed && (
          <div className="last-login-info">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              آخرین ورود: {new Date().toLocaleDateString('fa-IR')}
            </Text>
          </div>
        )}
      </DashboardSider>

      <Layout className="site-layout">
        {/* Corrected Header with only one custom class name */}
        <Header className="dashboard-header">
          <div className="header-title-container">
            <Title level={4} style={{ margin: 0 }}>
              {activeTab === "reservations" && "رزروهای من"}
              {activeTab === "reservationForm" && "رزرو جدید"}
              {activeTab === "compare" && "مقایسه هتل‌ها"}
              {activeTab === "favorites" && " علاقه مندیها"}
            </Title>
          </div>
        </Header>

        <Content className="dashboard-content">
          {activeTab !== "reservationForm" && (
            <Card
              className="stats-card"
              style={{
                background: token.colorPrimaryBg,
                borderColor: token.colorPrimaryBorder,
              }}
            >
              <Space className="stats-space" split={<Divider type="vertical" />} size="large">
                <Space>
                  <Text strong> رزروها:</Text>
                  <Text>{pendingReservations}</Text>
                </Space>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                  >بارگذاری مجدد
                  </Button>
                </Space>
              </Space>
            </Card>
          )}

          <Suspense
            fallback={
              <div className="suspense-loader">
                <Spin size="large" />
              </div>
            }
          >
            {renderMainContent()}
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserDashboard;