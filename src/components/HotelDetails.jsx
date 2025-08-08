import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout, Row, Col, Typography, Rate, Button, Space, Tag, Spin, Alert, Image, Divider, Carousel, Card } from 'antd';
import { EnvironmentOutlined, ShareAltOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import styled from 'styled-components';

import { fetchHotelDetails } from '../api/jsonServer';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import RoomReservationForm from './Dashboard/RoomReservationForm';
import Navbar from './Layout/Navbar';
import Footer from './Layout/Footer';
import { useFavorites } from '../hooks/useFavorites';
import CommentSection from './comments/CommentSection';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// --- Styled Components ---
const DetailPageWrapper = styled(Content)`
  max-width: 1200px;
  margin: 104px auto 24px auto;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 80px 0 0 0;
    padding: 12px;
    border-radius: 0;
    box-shadow: none;
    width: 100%;
  }
`;

const MainImageWrapper = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
  margin-bottom: 16px;

  .ant-image, .ant-image-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    height: 200px;
    border-radius: 8px;
  }
`;

const ThumbnailCarousel = styled(Carousel)`
  .slick-slide {
    padding: 0 4px;
  }
  .slick-list {
    margin: 0 -4px;
  }
  .slick-prev, .slick-next {
    font-size: 14px;
    height: 30px;
    width: 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10;
    &:before {
      color: #333;
    }
  }
  .slick-prev { left: -12px; }
  .slick-next { right: -12px; }

  .thumbnail-image-wrapper {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 6px;
    overflow: hidden;
    transition: border-color 0.3s ease;
    img {
      width: 100%;
      height: 60px;
      object-fit: cover;
    }
    &.selected {
      border-color: #1677ff;
    }
  }

  @media (max-width: 768px) {
    .slick-slide {
      padding: 0 3px;
    }
    .slick-list {
      margin: 0 -3px;
    }
    .thumbnail-image-wrapper img {
      height: 50px;
    }
  }

  @media (max-width: 480px) {
    .slick-prev, .slick-next {
      display: none !important;
    }
    .thumbnail-image-wrapper img {
      height: 40px;
    }
  }
`;

const HotelHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;

    @media (min-width: 768px) {
      margin-top: 0;
      justify-content: flex-end;
    }
  }
`;

const BookingCardWrapper = styled.div`
  position: sticky;
  top: 80px;
  width: 100%;

  @media (max-width: 768px) {
    position: static;
    margin: 24px 0;
  }
`;

const MobileBookingCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopBookingCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    display: none;
  }
`;

const DetailSection = styled.div`
  margin-top: 32px;
  width: 100%;

  @media (max-width: 768px) {
    margin-top: 24px;
  }
`;

const ImageGallery = ({ hotel }) => {
  const displayImages = hotel?.images?.length > 0 ? hotel.images : [hotel?.image || 'https://via.placeholder.com/800x400?text=No+Image'];
  const [mainImage, setMainImage] = useState(displayImages[0]);

  useEffect(() => {
    setMainImage(displayImages[0]);
  }, [hotel]);

  if (displayImages.length === 0) {
    return <MainImageWrapper><Image src="https://via.placeholder.com/800x400?text=No+Image" /></MainImageWrapper>;
  }

  return (
    <div>
      <MainImageWrapper>
        <Image src={mainImage} />
      </MainImageWrapper>
      {displayImages.length > 1 && (
        <ThumbnailCarousel dots={false} arrows slidesToShow={Math.min(5, displayImages.length)} slidesToScroll={1}>
          {displayImages.map((img, index) => (
            <div key={index} onClick={() => setMainImage(img)}>
              <div className={`thumbnail-image-wrapper ${mainImage === img ? 'selected' : ''}`}>
                <img src={img} alt={`thumb-${index}`} />
              </div>
            </div>
          ))}
        </ThumbnailCarousel>
      )}
    </div>
  );
};

const BookingCard = ({ hotel }) => (
  <>
    <MobileBookingCard title="رزرو اقامتگاه">
      <Title level={4}>{hotel.price?.toLocaleString('fa-IR')} <Text type="secondary" style={{ fontSize: 14 }}>تومان/شب</Text></Title>
      <Divider />
      <RoomReservationForm defaultHotel={hotel} />
    </MobileBookingCard>
  </>
);

// --- Main Component ---
const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  const { toggleFavorite, isFavorite } = useFavorites(user?.id);

  const { data: hotel, isLoading, error } = useQuery({
    queryKey: ['hotel', id],
    queryFn: () => fetchHotelDetails(id),
  });

  const handleFavoriteToggle = async () => {
    if (!user) {
      notification.info({ message: "ورود به سیستم", description: "لطفا برای افزودن به علاقه‌مندی‌ها وارد شوید" });
      navigate('/login');
      return;
    }
    try {
      await toggleFavorite(hotel.id);
    } catch (err) {
      notification.error({ message: "خطا", description: err.message });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)', marginTop: '80px' }}>
          <Spin size="large" tip="در حال بارگذاری اطلاعات هتل..." />
        </div>
      </Layout>
    );
  }

  if (error || !hotel) {
    return (
      <Layout>
        <Navbar />
        <Content style={{ padding: '50px', marginTop: '80px', textAlign: 'center' }}>
          <Alert message="خطا" description="مشکلی در بارگیری اطلاعات هتل وجود دارد." type="error" showIcon />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar />
      <DetailPageWrapper>
        <HotelHeader>
          <div>
            <Title level={2} style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 24px)' }}>{hotel.name}</Title>
            <Space>
              {hotel?.city && (
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <EnvironmentOutlined /> {hotel.city}
                </Text>
              )}
            </Space>
            <div style={{ marginTop: '8px' }}>
              <Rate disabled defaultValue={hotel.rating} allowHalf style={{ fontSize: '16px' }} />
              <Text style={{ marginRight: '8px' }}>({hotel.rating} ستاره)</Text>
            </div>
          </div>
          <div className="header-actions">
            {user && (
              <Button
                icon={isFavorite(hotel.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={handleFavoriteToggle}
                size="small"
              >
                {isFavorite(hotel.id) ? 'ذخیره شده' : 'ذخیره'}
              </Button>
            )}
            <Button icon={<ShareAltOutlined />} size="small">اشتراک گذاری</Button>
          </div>
        </HotelHeader>

        <ImageGallery hotel={hotel} />

        <BookingCard hotel={hotel} />

        <Row gutter={[16, 32]} style={{ marginTop: '32px' }}>
          <Col xs={24} lg={14}>
            <DetailSection>
              <Title level={4}>توضیحات اقامتگاه</Title>
              <Divider />
              <Paragraph>{hotel.description}</Paragraph>
            </DetailSection>

            <DetailSection>
              <Title level={4}>امکانات</Title>
              <Divider />
              <Row gutter={[8, 8]}>
                {hotel.facilities?.map(facility => (
                  <Col xs={12} sm={8} md={6} key={facility}>
                    <Tag style={{ width: '100%', textAlign: 'center' }}>{facility}</Tag>
                  </Col>
                ))}
              </Row>
            </DetailSection>

            <CommentSection hotelId={hotel.id} />
          </Col>

          <Col xs={24} lg={10}>
            <BookingCardWrapper>
              <DesktopBookingCard title="رزرو اقامتگاه">
                <Title level={4}>{hotel.price?.toLocaleString('fa-IR')} <Text type="secondary" style={{ fontSize: 14 }}>تومان/شب</Text></Title>
                <Divider />
                <RoomReservationForm defaultHotel={hotel} />
              </DesktopBookingCard>
            </BookingCardWrapper>
          </Col>
        </Row>
      </DetailPageWrapper>
      <Footer />
    </Layout>
  );
};

export default HotelDetails;