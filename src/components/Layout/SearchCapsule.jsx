import React, { useState } from 'react';
import { Row, Col, Select, Button, Grid, Form, Tooltip, ConfigProvider } from 'antd';
import { DatePicker as DatePickerJalali, JalaliLocaleListener } from 'antd-jalali';
import { MoneyCollectOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchHotels, fetchReservations } from '../../api/jsonServer';
import { useNotification } from '../../context/NotificationContext';
import fa_IR from 'antd/locale/fa_IR';
import { useNavigate } from 'react-router-dom';

import { formatDateForDB } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const { RangePicker: RangePickerJalali } = DatePickerJalali;
const { useBreakpoint } = Grid;
const { Option } = Select;

const SearchCapsule = ({ variant = 'hero' }) => {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const isNavbarVariant = variant === 'navbar';
  const notification = useNotification();

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
  });

  const calculateNights = (dates) => {
    if (!dates || dates.length !== 2) return 0;
    const [checkIn, checkOut] = dates;
    return Math.ceil(Math.abs(checkOut.diff(checkIn)) / (1000 * 60 * 60 * 24));
  };

  const handleHotelChange = (hotelId) => {
    const hotel = hotels.find((h) => h.id === hotelId);
    setSelectedHotel(hotel);
  };

  const handleFinish = async (values) => {
    if (!isAuthenticated) {
      notification.info({ message: 'ورود لازم است', description: 'برای ثبت رزرو، لطفا ابتدا وارد شوید.' });
      navigate('/login');
      return;
    }

    try {
      const allReservations = await fetchReservations();
      const [newCheckIn_Jalali, newCheckOut_Jalali] = values.dates;

      const checkInForDB = formatDateForDB(newCheckIn_Jalali);
      const checkOutForDB = formatDateForDB(newCheckOut_Jalali);

      const conflictingReservation = allReservations.find(reservation => {
        const isSameHotel = (reservation.hotel?.id || reservation.hotelId) === values.hotelId;
        if (!isSameHotel || reservation.status === 'cancelled') return false;

        const existingCheckIn = dayjs(reservation.checkIn);
        const existingCheckOut = dayjs(reservation.checkOut);
        const newGregorianCheckIn = dayjs(checkInForDB);
        const newGregorianCheckOut = dayjs(checkOutForDB);
        return newGregorianCheckIn.isBefore(existingCheckOut) && newGregorianCheckOut.isAfter(existingCheckIn);
      });

      if (conflictingReservation) {
        notification.error({
          message: 'تاریخ انتخاب شده در دسترس نیست',
          description: 'متاسفانه این هتل در بازه زمانی انتخابی شما قبلاً رزرو شده است.'
        });
        return;
      }

      const nights = calculateNights(values.dates);
      const totalPrice = (selectedHotel?.price || 0) * nights;

      const reservationDetails = {
        userId: user.id,
        hotelId: values.hotelId,
        hotelName: selectedHotel?.name,
        price: selectedHotel?.price,
        totalPrice,
        nights,
        checkIn: checkInForDB,
        checkOut: checkOutForDB,
        guests: {
          adults: parseInt(values.guests, 10),
          children: 0,
        },
        hotel: selectedHotel
      };

      // Navigate to the payment page, passing all the prepared data in the state
      navigate('/payment', { state: { reservationDetails } });

    } catch (error) {
      notification.error({ message: 'خطا', description: 'خطا در بررسی رزروهای موجود.' });
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price);

  const AuthWrapper = ({ children }) => {
    if (isAuthenticated) return children;
    return (
      <Tooltip title="برای ثبت رزرو ابتدا وارد شوید" placement="bottom">
        {children}
      </Tooltip>
    );
  };

  return (
    <ConfigProvider locale={fa_IR} direction="rtl">
      <JalaliLocaleListener />
      <div
        className={`search-capsule ${isNavbarVariant ? 'navbar-variant' : ''}`}
        style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: isNavbarVariant ? '0' : 'clamp(16px, 3vw, 24px)',
          background: isNavbarVariant ? 'transparent' : 'white',
          borderRadius: '24px',
          boxShadow: isNavbarVariant ? 'none' : '0 4px 20px rgba(0,0,0,0.2)',
          opacity:'0.8'
        }}
      >
        {!isNavbarVariant && (
          <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 2vw, 24px)', fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: '500'}}>
            {isAuthenticated ? 'یک اقامتگاه رزرو کنید' : 'مقصد سفر کجاست؟'}
          </div>
        )}

        <Form form={form} onFinish={handleFinish}>
          <Row gutter={[16, 16]} align="middle" justify="center" style={{ width: '100%' }}>
            <Col xs={24} sm={24} md={isNavbarVariant ? 6 : 8}>
              <Form.Item name="hotelId" noStyle rules={[{ required: true, message: 'لطفا هتل را انتخاب کنید!' }]}>
                <Select
                  showSearch
                  size={isNavbarVariant ? 'middle' : 'large'}
                  placeholder=" نام اقامتگاه"
                  loading={hotelsLoading}
                  onChange={handleHotelChange}
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                >
                  {hotels.map(hotel => (
                    <Option key={hotel.id} value={hotel.id} label={hotel.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{hotel.name}</span>
                        <span style={{ fontSize: '0.8em', color: '#888' }}>
                          <MoneyCollectOutlined style={{ marginLeft: '4px' }} /> {formatPrice(hotel.price)}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={isNavbarVariant ? 7 : 7}>
              <Form.Item name="dates" noStyle
                rules={[
                  {
                    required: true,
                    message: 'لطفاً تاریخ اقامت را انتخاب کنید'
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value.length < 2) {
                        return Promise.reject(new Error('لطفاً تاریخ اقامت را انتخاب کنید'));
                      }
                      const [checkIn, checkOut] = value;
                      if (checkIn.isSame(checkOut, 'day')) {
                        return Promise.reject(new Error('تاریخ ورود و خروج نمی‌تواند یکسان باشد'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}>
                <RangePickerJalali
                  style={{ width: '100%' }}
                  size={isNavbarVariant ? 'middle' : 'large'}
                  format="YYYY/MM/DD"
                  disabledDate={(current) => current && current.endOf('day').isBefore(dayjs())}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={isNavbarVariant ? 4 : 4}>
              <Form.Item
                name="guests"
                initialValue={2}
                noStyle
                rules={[
                  { required: true, message: 'لطفاً تعداد بزرگسالان را وارد کنید' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const children = Number(getFieldValue('children') || 0);
                      const total = Number(value) + children;
                      if (selectedHotel?.maxGuests && total > selectedHotel.maxGuests) {
                        return Promise.reject(`تعداد کل نفرات (${total}) بیش از حد مجاز (${selectedHotel.maxGuests}) است`);
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Select size={isNavbarVariant ? 'middle' : 'large'} style={{ width: '100%' }}>
                  <Option value={1}>1 نفر</Option>
                  <Option value={2}>2 نفر</Option>
                  <Option value={3}>3 نفر</Option>
                  <Option value={4}>4 نفر</Option>
                  <Option value={5}>5 نفر</Option>
                  <Option value={6}>+6 نفر</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={isNavbarVariant ? 4 : 5}>
              <AuthWrapper>
                <Button
                  type="primary"
                  htmlType="submit"
                  size={isNavbarVariant ? 'middle' : 'large'}
                  style={{ width: '100%' }}
                >
                  {isAuthenticated ? 'ادامه و پرداخت' : 'ادامه و پرداخت'}
                </Button>
              </AuthWrapper>
            </Col>
          </Row>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default SearchCapsule;