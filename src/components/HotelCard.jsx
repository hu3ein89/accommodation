import React from 'react';
import { Card, Rate, Button, Space, Tag, Typography, Row } from 'antd';
import { HeartOutlined, HeartFilled, EnvironmentOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
const { Title } = Typography;

const StyledCard = styled(Card)`
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  border-radius: 0 !important;

  .ant-card-cover {
    position: relative;
    img {
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  Button {

  }
  
  .ant-card-body {
    flex-grow: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .ant-card-actions {
    background: #fff;
    border-top: 1px solid #f0f0f0;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    .ant-card-cover img {
      transform: scale(1.05);
    }
  }
`;

const FavoriteButton = styled(Button)`
  position: absolute;
  padding:0;
  top: 4px;
  left: 4px;
  border: none;
  background:transparent !important;
  border-radius:50% !important;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  .anticon {
    font-size: 20px;
    color: white;
  }
  .anticon-heart.ant-icon {
    color: #ff4d4f;
  }
`;

const PriceTag = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  color: white;
  font-weight: bold;
  font-size: 16px;
  z-index: 10;
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const HotelCard = ({ hotel, onViewDetails, actions, facilities = []}) => {
 const {user} = useAuth()
 const { toggleFavorite, isFavorite } = useFavorites(user?.id);

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

  return (
    <StyledCard
      hoverable
      cover={
        <>
          <img
            alt={hotel.name}
            src={hotel.image || 'https://via.placeholder.com/400x200?text=No+Image'}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
          />
                {user && (
              <FavoriteButton 
              style={{width:'30px',height:'30px'}}
                icon={isFavorite(hotel.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                onClick={handleFavoriteToggle}
                size="small"
              >
                {isFavorite(hotel.id)}
              </FavoriteButton>
            )}
          {hotel.price > 0 && (
            <PriceTag>
              {hotel.price.toLocaleString('fa-IR')} تومان/شب
            </PriceTag>
            
          )}
        </>
      }
      actions={[
        <Button
          key="details"
          type="primary"

          onClick={() => onViewDetails(hotel.id)}
          style={{ width: 'calc(100% - 32px)', margin: '0 16px', fontWeight: 'bold', borderRadius: '0' }}
        >
          مشاهده و رزرو
        </Button>
      ]}
    >

      <CardContent>
        <Title level={5} ellipsis={{ rows: 1 }}>{hotel.name}</Title>
        {hotel.location?.city && (
          <Typography.Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            <EnvironmentOutlined /> {hotel.location.city}
          </Typography.Text>
        )}
        <Rate allowHalf disabled defaultValue={hotel.rating} style={{ fontSize: '16px' }} />
      </CardContent>
    </StyledCard>
  );
};

export default HotelCard;