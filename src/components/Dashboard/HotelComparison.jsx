import React, { useState } from 'react';
import { Card, Select, Table, Rate, Button, Space, Empty, notification, Row, Col, Statistic, Form, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetchHotels, fetchReservations } from '../../api/jsonServer';
import {
  SwapOutlined,
  BookOutlined
} from '@ant-design/icons';
import '../../styles/HotelComparison.css';

const HotelComparison = ({ onReserveClick, selectedHotels, setSelectedHotels, hotel, onViewDetails }) => {
  const [form] = Form.useForm();

  const { data: hotels = [], isPending: isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
    onError: (error) => {
      notification.error({
        message: 'خطا',
        description: error.message || 'خطا در دریافت اطلاعات هتل‌ها'
      });
    }
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations,
    onError: (error) => {
      notification.error({
        message: 'خطا',
        description: error.message || 'خطا در دریافت اطلاعات رزروها'
      });
    }
  });


  const handleHotelSelect = (value, position) => {
    const newSelectedHotels = [...selectedHotels];
    if (position === 'first') {
      newSelectedHotels[0] = value;
    } else {
      newSelectedHotels[1] = value;
    }
    setSelectedHotels(newSelectedHotels); // Update state in UserDashboard
    form.setFieldsValue({
      [position === 'first' ? 'firstHotel' : 'secondHotel']: value
    });
  };

  const handleRemoveHotel = (position) => {
    const newSelectedHotels = [...selectedHotels];
    if (position === 'first') {
      newSelectedHotels[0] = null;
      form.setFieldsValue({ firstHotel: undefined });
    } else {
      newSelectedHotels[1] = null;
      form.setFieldsValue({ secondHotel: undefined });
    }
    setSelectedHotels(newSelectedHotels);
  };

  const handleBooking = (hotelId) => {
    const hotelToBook = hotels.find(h => h.id === hotelId);
    if (hotelToBook && onReserveClick) {
      onReserveClick(hotelToBook);
    } else {
      notification.error({
        message: 'خطای هتل',
        description: 'اطلاعات هتل برای رزرو یافت نشد.'
      });
    }
  };

  const renderHotelSelectors = () => (
    <Row gutter={[16, 16]} className="mb-6 hotel-selector-row">
      <Col xs={24} lg={12}>
        <Card
          title={<span className="card-title">هتل اول</span>}
          className="hotel-selector-card"
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <Form.Item name="firstHotel" style={{ marginBottom: 0 }}>
            <Select
              placeholder="هتل اول را انتخاب کنید"
              className="w-full hotel-select-input"
              onChange={(value) => handleHotelSelect(value, 'first')}
              value={selectedHotels[0]}
              showSearch
              optionFilterProp="children"
              suffixIcon={<span className="select-arrow">▼</span>}
            >
              {hotels
                .filter(hotel => hotel.id !== selectedHotels[1])
                .map(hotel => (
                  <Select.Option key={hotel.id} value={hotel.id}>
                    <div className="hotel-option">
                      <span>{hotel.name}</span>
                      <Rate disabled defaultValue={hotel.rating} className="hotel-rating" />
                    </div>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card
          title={<span className="card-title">هتل دوم</span>}
          className="hotel-selector-card"
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <Form.Item name="secondHotel" style={{ marginBottom: 0 }}>
            <Select
              placeholder="هتل دوم را انتخاب کنید"
              className="w-full hotel-select-input"
              onChange={(value) => handleHotelSelect(value, 'second')}
              value={selectedHotels[1]}
              showSearch
              optionFilterProp="children"
              suffixIcon={<span className="select-arrow">▼</span>}
            >
              {hotels
                .filter(hotel => hotel.id !== selectedHotels[0])
                .map(hotel => (
                  <Select.Option key={hotel.id} value={hotel.id}>
                    <div className="hotel-option">
                      <span>{hotel.name}</span>
                      <Rate disabled defaultValue={hotel.rating} className="hotel-rating" />
                    </div>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );

  const renderComparisonTable = () => {
    if (selectedHotels.filter(Boolean).length < 2) return null;

    const hotel1 = hotels.find(h => h.id === selectedHotels[0]);
    const hotel2 = hotels.find(h => h.id === selectedHotels[1]);

    const reservation1 = reservations.find(r => r.hotelId === selectedHotels[0]);
    const reservation2 = reservations.find(r => r.hotelId === selectedHotels[1]);

    const comparisonData = [
      {
        key: '1',
        feature: 'نام هتل',
        hotel1: <span className="hotel-name">{reservation1?.hotelName || hotel1?.name || 'نام هتل'}</span>,
        hotel2: <span className="hotel-name">{reservation2?.hotelName || hotel2?.name || 'نام هتل'}</span>,
      },
      {
        key: '2',
        feature: 'درجه هتل',
        hotel1: <Rate disabled defaultValue={hotel1?.rating || 0} className="hotel-rate" />,
        hotel2: <Rate disabled defaultValue={hotel2?.rating || 0} className="hotel-rate" />,
      },
      {
        key: '3',
        feature: 'قیمت پایه',
        hotel1: hotel1?.price ? (
          <Statistic
            value={hotel1.price}
            suffix="ریال"
            groupSeparator=","
            valueStyle={{ fontSize: '16px', color: '#1890ff' }}
            className="price-stat"
          />
        ) : '-',
        hotel2: hotel2?.price ? (
          <Statistic
            value={hotel2.price}
            suffix="ریال"
            groupSeparator=","
            valueStyle={{ fontSize: '16px', color: '#1890ff' }}
            className="price-stat"
          />
        ) : '-',
      },
      {
        key: '4',
        feature: 'امکانات',
        hotel1: (
          <Space wrap size={[8,8]}>
            {hotel1?.facilities?.map((facility, index) => (
              <Tag key={index}>{facility}</Tag>
            ))}
          </Space>
        ),
        hotel2: (
          <Space wrap size={[8, 8]}>
            {hotel2?.facilities?.map((facility, index) => (
              <Tag key={index}>{facility}</Tag>
            ))}
          </Space>
        ),
      },
      {
        key: '5',
        feature: 'رزرو',
        hotel1: (
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => handleBooking(hotel1?.id)}
            className="book-button"
            size="large"
          >
            رزرو
          </Button>
        ),
        hotel2: (
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => handleBooking(hotel2?.id)}
            className="book-button"
            size="large"
          >
            رزرو
          </Button>
        ),
      },
    ];

    return (
      <div className="comparison-table-container">
        <Table
          columns={[
            {
              title: 'ویژگی',
              dataIndex: 'feature',
              key: 'feature',
              width: 150,
              render: (text) => <span className="feature-title">{text}</span>
            },
            {
              title: (
                <Space direction="vertical" align="center" className="hotel-header">
                  <span className="hotel-title">{hotel1?.name?.fa || hotel1?.name}</span>
                  <Button
                    size="small"
                    onClick={() => handleRemoveHotel('first')}
                    className="remove-button"
                  >
                    حذف
                  </Button>
                </Space>
              ),
              dataIndex: 'hotel1',
              key: 'hotel1',
              align: 'center'
            },
            {
              title: (
                <Space direction="vertical" align="center" className="hotel-header">
                  <span className="hotel-title">{hotel2?.name?.fa || hotel2?.name}</span>
                  <Button
                    size="small"
                    onClick={() => handleRemoveHotel('second')}
                    className="remove-button"
                  >
                    حذف
                  </Button>
                </Space>
              ),
              dataIndex: 'hotel2',
              key: 'hotel2',
              align: 'center'
            },
          ]}
          dataSource={comparisonData}
          pagination={false}
          bordered
          className="comparison-table"
          rowClassName={() => "comparison-row"}
        />
      </div>
    );
  };

  return (
    <Card
      title={
        <Space className="header-title">
          <SwapOutlined className="header-icon" />
          <span>مقایسه هتل‌ها</span>
        </Space>
      }
      className="hotel-comparison-card"
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Form form={form}>
        {renderHotelSelectors()}
      </Form>

      {selectedHotels.filter(Boolean).length < 2 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="empty-message">لطفاً دو هتل را برای مقایسه انتخاب کنید</span>}
          className="empty-state"
        />
      ) : (
        renderComparisonTable()
      )}
    </Card>
  );
};

export default HotelComparison;