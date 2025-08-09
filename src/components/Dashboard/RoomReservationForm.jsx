import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Row, Col, Card, ConfigProvider, Tag, Space, Divider, Typography } from 'antd';
import { DatePicker as DatePickerJalali, JalaliLocaleListener } from 'antd-jalali';
import { useNavigate } from 'react-router-dom';
import fa_IR from 'antd/locale/fa_IR';
import dayjs from 'dayjs';
import { formatDateForDB } from '../../utils/dateUtils';
import { fetchHotels, fetchReservations } from '../../api/jsonServer';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { CalendarOutlined, InfoCircleOutlined, MoneyCollectOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import '../../styles/RoomReservationForm.css';


const { RangePicker: RangePickerJalali } = DatePickerJalali;
const { Option } = Select;
const {Text} = Typography;

const RoomReservationForm = ({ defaultHotel }) => {
  const notification = useNotification();
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [selectedHotel, setSelectedHotel] = useState(defaultHotel);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
  });

  useEffect(() => {
    // 1. Check if we have a default hotel and the hotel list has finished loading.
    if (defaultHotel && !hotelsLoading) {
      setSelectedHotel(defaultHotel);
      form.setFieldsValue({ hotelId: defaultHotel.id });
    }
  }, [defaultHotel, hotelsLoading, form]);

  const handleSubmit = async (values) => {
    if (!user?.id) {
      notification.error({ message: 'خطا', description: 'لطفاً ابتدا وارد حساب کاربری خود شوید' });
      return;
    }

    setIsSubmitting(true);

    try {
      const allReservations = await fetchReservations();
      const [newCheckIn, newCheckOut] = values.dates;

      const checkInForDB = formatDateForDB(newCheckIn);
      const checkOutForDB = formatDateForDB(newCheckOut);

      const conflictingReservation = allReservations.find(reservation => {
        const isSameHotel = (reservation.hotel?.id || reservation.hotelId) === values.hotelId;
        if (!isSameHotel) return false;

        // Check the nested booking status
        const bookingStatus = reservation.status?.booking;
        if (bookingStatus === 'cancelled' || bookingStatus === 'cancelled_refund_pending' || bookingStatus === 'refund_processed') {
          return false;
        }

        const existingCheckIn = dayjs(reservation.checkIn);
        const existingCheckOut = dayjs(reservation.checkOut);
        const newGregorianCheckIn = dayjs(checkInForDB);
        const newGregorianCheckOut = dayjs(checkOutForDB);

        return newGregorianCheckIn.isBefore(existingCheckOut) && newGregorianCheckOut.isAfter(existingCheckIn);
      });

      if (conflictingReservation) {
        notification.error({ message: 'تاریخ انتخاب شده در دسترس نیست', description: 'این اقامتگاه در بازه زمانی انتخابی شما قبلاً رزرو شده است.' });
        setIsSubmitting(false);
        return;
      }

      const nights = Math.ceil(Math.abs(newCheckOut.diff(newCheckIn)) / (1000 * 60 * 60 * 24));
      const totalPrice = (selectedHotel?.price || 0) * nights;

      const reservationDetails = {
        userId: user.id,
        hotelId: values.hotelId,
        hotelName: selectedHotel?.name || 'نامشخص',
        price: selectedHotel?.price || 0,
        totalPrice,
        nights,
        checkIn: checkInForDB,
        checkOut: checkOutForDB, 
        guests: { adults: values.adults, children: values.children || 0 },
        notes: values.notes,
      };

      navigate('/payment', { state: { reservationDetails } });

    } catch (error) {
      notification.error({ message: 'خطا', description: `خطا در بررسی اطلاعات: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHotelChange = (value) => {
    const hotel = hotels.find((h) => h.id === value);
    setSelectedHotel(hotel);
    form.setFieldsValue({ hotelId: value });
  };

  const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price) + ' تومان';

  return (
    <ConfigProvider locale={fa_IR} direction="rtl">
      <JalaliLocaleListener />
      <div className="reservation-form-container">
        <Card 
          title={<h2 className="form-title">ثبت اطلاعات رزرو</h2>} 
          className="reservation-form-card"
          actions={[
            <Button type="primary" block onClick={() => form.submit()} loading={isSubmitting}>
              ادامه و پرداخت
            </Button>
          ]}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item name="hotelId" label={<span className="form-label">انتخاب هتل</span>} rules={[{ required: true, message: 'لطفاً هتل را انتخاب کنید' }]}>
                  <Select 
                    placeholder="انتخاب هتل" 
                    onChange={handleHotelChange} 
                    loading={hotelsLoading} 
                    showSearch 
                    optionFilterProp="children"
                    size="large"
                  >
                    {hotels.map((hotel) => (
                      <Option key={hotel.id} value={hotel.id} label={hotel.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{hotel.name}</span>
                          <Tag color="blue" icon={<MoneyCollectOutlined />}>
                            {formatPrice(hotel.price)}
                          </Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {selectedHotel && (
                <Col xs={24}>
                  <Card 
                    bordered={false}
                    style={{ 
                      background: '#f9f9f9',
                      borderRadius: 8,
                      marginBottom: 16
                    }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div>
                        <Text strong style={{ fontSize: 16 }}>{selectedHotel.name}</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="blue" icon={<MoneyCollectOutlined />}>
                            قیمت شبانه: {formatPrice(selectedHotel.price)}
                          </Tag>
                          <Tag color="green">
                            حداکثر {selectedHotel.maxGuests} نفر
                          </Tag>
                        </div>
                      </div>

                      <Divider style={{ margin: '12px 0' }} />

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="dates"
                            label={
                              <span className="form-label">
                                <CalendarOutlined style={{ marginLeft: 8 }} />
                                تاریخ اقامت
                              </span>
                            }
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
                            ]}
                          >
                            <RangePickerJalali 
                              className="date-range-picker"
                              format="YYYY/MM/DD"
                              disabledDate={(current) => current && current.endOf('day').isBefore(dayjs())}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="adults"
                            label={
                              <span className="form-label">
                                <UserOutlined style={{ marginLeft: 8 }} />
                                تعداد بزرگسال
                              </span>
                            }
                            initialValue={1}
                            rules={[
                              { required: true, message: 'لطفاً تعداد بزرگسالان را وارد کنید' },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const children = getFieldValue('children') || 0;
                                  const total = value + children;
                                  if (selectedHotel && total > selectedHotel.maxGuests) {
                                    return Promise.reject(`تعداد کل نفرات (${total}) بیش از حد مجاز (${selectedHotel.maxGuests}) است`);
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                          >
                            <InputNumber 
                              min={1} 
                              max={10} 
                              className="guest-input" 
                              style={{ width: '100%' }} 
                              addonBefore="بزرگسال"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="children"
                            label={
                              <span className="form-label">
                                <UserOutlined style={{ marginLeft: 8 }} />
                                تعداد کودک
                              </span>
                            }
                            initialValue={0}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const adults = getFieldValue('adults') || 0;
                                  const total = adults + (value || 0);
                                  if (selectedHotel && total > selectedHotel.maxGuests) {
                                    return Promise.reject(`تعداد کل نفرات (${total}) بیش از حد مجاز (${selectedHotel.maxGuests}) است`);
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                          >
                            <InputNumber 
                              min={0} 
                              max={10} 
                              className="guest-input" 
                              style={{ width: '100%' }} 
                              addonBefore="کودک"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>
              )}

              <Col xs={24}>
                <Form.Item 
                  name="notes" 
                  label={
                    <span className="form-label">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                      توضیحات
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3} 
                    placeholder="توضیحات اضافی (مثال: نیاز به تخت اضافه، ساعت ورود خاص، و...)" 
                    className="notes-textarea" 
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default RoomReservationForm;