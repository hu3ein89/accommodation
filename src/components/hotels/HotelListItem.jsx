import React from 'react';
import { Card, Typography, Rate, Space, Tag, Button, Row, Col } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const StyledListItem = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  .ant-card-body {
    padding: 24px;
  }
`;

const ImageContainer = styled.div`
  height: 200px; /* Fixed height for all images */
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
`;

const PriceTag = styled.div`
  text-align: left;
  .price {
    font-size: 22px;
    font-weight: bold;
    color: #1890ff;
  }
  .per-night {
    font-size: 14px;
    color: #888;
  }
`;

const HotelListItem = ({ hotel, onViewDetails }) => {
  const { name, location, rating, price, image, description, facilities = [] } = hotel;

  return (
    <StyledListItem hoverable onClick={() => onViewDetails(hotel.id)}>
      <Row gutter={[24, 16]} align="middle">
        <Col xs={24} md={8}>
          <ImageContainer>
            <img alt={name} src={image || 'https://via.placeholder.com/400x300?text=No+Image'} />
          </ImageContainer>
        </Col>

        <Col xs={24} md={10}>
          <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>{name}</Title>
          <Space size="small" style={{ marginBottom: '12px' }}>
            <EnvironmentOutlined style={{ color: '#888' }} />
            <Text type="secondary">{`${location?.city}`}</Text>
          </Space>
          <Rate disabled defaultValue={rating} allowHalf style={{ display: 'block', marginBottom: '16px' }} />
          <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
            {description}
          </Paragraph>
          <Space wrap size={[8, 8]}>
            {facilities.slice(0, 3).map((facility, index) => (
              <Tag key={index}>{facility}</Tag>
            ))}
          </Space>
        </Col>

        <Col xs={24} md={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="large" align="end">
            <PriceTag>
              <div className="price">{price?.toLocaleString('fa-IR')}</div>
              <div className="per-night">تومان/شب</div>
            </PriceTag>
            <Button type="primary" size="large" block>
              مشاهده و رزرو
            </Button>
          </Space>
        </Col>
      </Row>
    </StyledListItem>
  );
};

export default HotelListItem;