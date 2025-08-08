import React, { useState, useMemo } from 'react';
import { Menu, Layout, Button, Dropdown, Avatar, Badge, Drawer, Grid, Row, Col, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ContactsOutlined,
  ShopOutlined,
  DashboardOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Navbar.css';
import logo from '../../assets/logo.png';
import { useReservations } from '../../context/ReservationContext';

const { Header } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const Navbar = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { pendingReservations } = useReservations();

  // Derived values
  const isHomePage = location.pathname === '/';
  const isTransparentHeader = isHomePage && !isMobile;
  const iconColor = isTransparentHeader ? 'white' : '#333';

  // User dropdown menu
  const userMenu = (
    <Menu>
      <Menu.Item
        key="dashboard"
        icon={<DashboardOutlined />}
        onClick={() => navigate(user?.role === 'Guest' ? '/user-dashboard' : '/admin-dashboard')}
      >
        داشبورد
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        خروج
      </Menu.Item>
    </Menu>
  );

  // Navigation items
  const navItems = useMemo(() => [
    { key: '/', icon: <HomeOutlined />, label: 'صفحه اصلی', onClick: () => navigate('/') },
    { key: '/hotels', icon: <ShopOutlined />, label: 'اقامتگاه‌ها', onClick: () => navigate('/hotels') },
    ...(isAuthenticated && user?.role !== 'Guest'
      ? [{ key: '/admin-dashboard', icon: <DashboardOutlined />, label: 'مدیریت', onClick: () => navigate('/admin-dashboard') }]
      : []),
    { key: '/about', icon: <InfoCircleOutlined />, label: 'درباره ما', onClick: () => navigate('/about') },
    { key: '/contact', icon: <ContactsOutlined />, label: 'تماس با ما', onClick: () => navigate('/contact') }
  ], [isAuthenticated, user?.role, navigate]);

  // Auth buttons component (reusable)
  const AuthButtons = ({ mobile = false }) => (
    isAuthenticated ? (
      <>
        {pendingReservations > 0 && (
          <Badge
            count={pendingReservations}
            showZero
            className="notification-badge"
            style={{ marginRight: mobile ? 0 : '16px', pointerEvents: 'none' }}
            offset={mobile ? [1, -5] : [-12, -9]}
          >
            <Button
              type="text"
              icon={<BellOutlined style={{ color: mobile ? '#333' : iconColor }} />}
              onClick={() => navigate('/notifications')}
            />
          </Badge>
        )}
        {mobile ? (
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={12}>
              <Button
                block
                icon={<DashboardOutlined />}
                onClick={() => navigate(user?.role === 'Guest' ? '/user-dashboard' : '/admin-dashboard')}
              >
                داشبورد
              </Button>
            </Col>
            <Col span={12}>
              <Button block danger icon={<LogoutOutlined />} onClick={logout}>
                خروج
              </Button>
            </Col>
          </Row>
        ) : (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <Avatar
                size={screens.lg ? 'default' : 'large'}
                icon={<UserOutlined />}
                src={user?.profileImage}
                style={{ backgroundColor: '#1c16ad', color: 'white' }}
              />
              <Text
                ellipsis={{ tooltip: `${user?.firstName} ${user?.lastName || ''}` }}
                style={{ color: '#2e26ab', fontWeight: 500, display: screens.md ? 'inline-block' : 'none' }}
              >
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'کاربر'}
              </Text>
            </div>
          </Dropdown>
        )}
      </>
    ) : mobile ? (
      <Row gutter={16} style={{ width: '100%' }}>
        <Col span={12}>
          <Button type="primary" block onClick={() => { navigate('/login'); setDrawerVisible(false); }}>
            ورود
          </Button>
        </Col>
        <Col span={12}>
          <Button block onClick={() => { navigate('/register'); setDrawerVisible(false); }}>
            ثبت نام
          </Button>
        </Col>
      </Row>
    ) : (
      <Button
        onClick={() => navigate('/login')}
        type={isTransparentHeader ? "ghost" : "default"}
        style={{ color: isTransparentHeader ? 'white' : '#6297c8', borderColor: isTransparentHeader ? 'white' : undefined }}
      >
        ورود یا ثبت نام
      </Button>
    )
  );

  return (
    <>
      <Header
        className={`header ${!isTransparentHeader ? 'scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: `0 ${isMobile ? '16px' : '24px'}`,
          background: isTransparentHeader ? 'transparent' : 'white',
          boxShadow: isTransparentHeader ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
          height: '80px',
          zIndex: 1000,
          direction: 'rtl',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <div className="logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', order: 3 }}>
          <img
            src={logo}
            alt="جاباما"
            style={{
              padding: screens.xs ? '5px' : '10px',
              width: screens.xs ? '80px' : '100px',
              height: 'auto',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        {/* Desktop Menu */}
        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            className="menu"
            style={{
              borderBottom: 'none',
              flex: 1,
              justifyContent: 'center',
              direction: 'rtl',
              background: 'transparent',
              order: 2,
              maxWidth: '800px',
              margin: '0 auto'
            }}
            items={navItems}
          />
        )}

        {/* Auth Section */}
        <div className="auth-buttons" style={{ display: 'flex', alignItems: 'center', order: 1, gap: '16px' }}>
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: iconColor, fontSize: screens.xs ? '20px' : '24px' }} />}
              onClick={() => setDrawerVisible(true)}
              style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          ) : (
            <AuthButtons />
          )}
        </div>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 'bold', fontSize: '18px', direction: 'rtl', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>منو</span>}
        placement="right"
        closable
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="mobile-drawer"
        footer={<div style={{ padding: '16px' }}><AuthButtons mobile /></div>}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0, paddingTop: 0 }}
          items={navItems}
        />
      </Drawer>
    </>
  );
};

export default Navbar;