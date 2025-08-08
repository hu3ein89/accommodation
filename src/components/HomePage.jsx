import React, { useState } from 'react';
import { Layout, Spin, Alert, Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeOutlined, ShopOutlined, EnvironmentOutlined, GiftOutlined, BankOutlined, CompassOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchHotels }from '../api/jsonServer';
import Navbar from '../components/Layout/Navbar';
import HotelCard from '../components/HotelCard';
import HeroSection from '../components/Layout/HeroSection';
import Footer from '../components/Layout/Footer';

const { Content } = Layout;

const categories = [
  { key: 'apartment', title: 'آپارتمان', icon: <BankOutlined /> },
  { key: 'beach', title: 'ساحلی', icon: <EnvironmentOutlined /> },
  { key: 'cottage', title: 'کلبه', icon: <HomeOutlined style={{ transform: 'rotate(45deg)' }} /> },
  { key: 'villa', title: 'ویلا', icon: <HomeOutlined /> }
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Hotels
  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const data = await fetchHotels();
      return data;
    }
  });

  // Filter state
  const [filters, setFilters] = useState({
    categories: []
  });

  // Filter hotels based on selected categories
  const filteredHotels = hotels.filter(hotel => {
    if (filters.categories.length > 0 && !filters.categories.includes(hotel.category)) {
      return false;
    }
    return true;
  });

  const handleCategoryClick = (categoryKey) => {
    setFilters(prevFilters => {
      const isSelected = prevFilters.categories.includes(categoryKey);
      return {
        ...prevFilters,
        categories: isSelected
          ? prevFilters.categories.filter(cat => cat !== categoryKey)  // Remove category if already selected
          : [...prevFilters.categories, categoryKey] 
      };
    });
  };

  const renderHotelCards = () => {
    if (hotelsLoading) {
      return <Spin size="large" tip="در حال بارگذاری..." style={{ display: 'block', margin: '40px auto' }} />;
    }

    if (filteredHotels.length === 0) {
      return (
        <Alert
          message="هیچ هتلی پیدا نشد"
          description={<Button type="link" onClick={() => { setFilters({ categories: [] }) }}>پاک کردن فیلترها</Button>}
          type="info"
          showIcon
        />
      );
    }

    return (
      <Row gutter={[24, 24]}>
        {filteredHotels.map(hotel => (
          <Col key={hotel.id} xs={24} sm={12} lg={8}>
            <div className="hotel-card-container">
              <HotelCard
                hotel={hotel}
                onViewDetails={() => navigate(`/hotels/${hotel.id}`)}
              />
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  const CategoryIcons = () => (
    <div style={{ background: '#fff', padding: '24px', marginBottom: '24px', borderRadius: '8px' }}>
      <Row gutter={[24, 24]} justify="space-around">
        {categories.map(category => (
          <Col key={category.key}>
            <div
              onClick={() => handleCategoryClick(category.key)}
              className="category-icon"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
                padding: '12px 24px',
                transition: 'transform 0.3s ease, background 0.3s ease',
              }}
            >
              <div style={{
                fontSize: '38px',
                marginBottom: '8px',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1px solid #e8e8e8',
                color: filters.categories.includes(category.key) ? '#1890ff' : '#666',
                backgroundColor: filters.categories.includes(category.key) ? '#f0f0f0' : 'transparent',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
              }}>
                {category.icon}
              </div>
              <span style={{ fontSize: '14px', color: filters.categories.includes(category.key) ? '#1890ff' : '#666' }}>
                {category.title}
              </span>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <Layout className="min-h-screen" style={{ background: '#f5f5f5' }}>
      <Navbar />
      <HeroSection />
      <Layout style={{ marginRight: 0 }}>
        <Content style={{ padding: 24 }}>
          <CategoryIcons />
          <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
            {renderHotelCards()}
          </div>
        </Content>
      </Layout>
      <Footer />
    </Layout>
  );
};

export default HomePage;



