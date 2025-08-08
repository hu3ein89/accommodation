import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout, Row, Col, Card, Button, Alert, Statistic, Divider, Typography } from 'antd';
import styled from 'styled-components';

import { createReservationWithTransaction } from '../api/jsonServer';
import { useNotification } from '../context/NotificationContext';
import { useReservations } from '../context/ReservationContext';
import Navbar from '../components/Layout/Navbar';
import CustomPaymentForm from '../components/payment/CustomPaymentForm';

const { Content } = Layout;
const { Title } = Typography;

const PaymentWrapper = styled.div`
  max-width: 800px;
  margin: 120px auto 48px auto;
`;

const PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { incrementReservations } = useReservations();

  const reservationDetails = state?.reservationDetails;

  const createReservationWithTransactionMutation = useMutation({
    mutationFn: createReservationWithTransaction,
    onSuccess: (_data) => {
      notification.success({
        message: 'پرداخت موفق',
        description: 'رزرو و پرداخت شما با موفقیت ثبت شد.',
      });
      incrementReservations();
      queryClient.invalidateQueries({ queryKey: ['userReservations'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      navigate('/user-dashboard');
    },
    onError: (error) => {
      let description = error.message;
      
      const reservationIdMatch = error.message.match(/رزرو با شناسه (\w+) ممکن است ثبت شده باشد/);
      if (reservationIdMatch) {
        description = `خطا در سیستم پرداخت. رزرو شما با شناسه ${reservationIdMatch[1]} ثبت شده است اما پرداخت تکمیل نشد. لطفاً با پشتیبانی تماس بگیرید.`;
      }
  
      notification.error({
        message: 'خطا در ثبت رزرو و پرداخت',
        description,
        duration: 10
      });
    },
  });

  const handlePaymentSubmit = (cardData) => {
    console.log('Simulating payment with card data:', cardData);
    console.log('Reservation details:', reservationDetails);

    if (!reservationDetails) {
      notification.error({
        message: 'خطا',
        description: 'اطلاعات رزرو یافت نشد. لطفاً از ابتدا مراحل را طی کنید.',
      });
      return;
    }

    const priceAsString = String(reservationDetails.totalPrice || '0');
    const cleanedPrice = parseFloat(priceAsString.replace(/[^0-9.]/g, ''));

    if (isNaN(cleanedPrice)) {
        notification.error({
            message: 'خطا در اطلاعات رزرو',
            description: 'مبلغ نهایی نامعتبر است.',
        });
        return;
    }
    
    const requiredFields = ['hotelId', 'userId', 'totalPrice', 'checkIn', 'checkOut', 'guests'];
    const missingFields = requiredFields.filter(field => !reservationDetails[field]);
    if (missingFields.length > 0) {
      notification.error({
        message: 'خطا در اطلاعات رزرو',
        description: `فیلدهای الزامی مفقود هستند: ${missingFields.join(', ')}`,
      });
      return;
    }

    // Validate guests structure
    if (!reservationDetails.guests || typeof reservationDetails.guests.adults !== 'number') {
      notification.error({
        message: 'خطا در اطلاعات رزرو',
        description: 'اطلاعات تعداد مهمان‌ها نامعتبر است',
      });
      return;
    }

    const finalReservationData = {
      ...reservationDetails,
      status: {
        booking: 'pending',
        checkIn: 'pending',
        checkOut: 'pending',
      },
    };

    const transactionData = {
      userId: reservationDetails.userId,
      reservationId: null,
      type: 'payment',
      amount: Number(reservationDetails.totalPrice),
      status: 'successful',
      description: `پرداخت برای رزرو جدید در ${reservationDetails.hotelName || 'اقامتگاه'}`,
    };

    console.log('Submitting reservation data:', finalReservationData);
    console.log('Submitting transaction data:', transactionData);

    createReservationWithTransactionMutation.mutate({
      reservationData: finalReservationData,
      transactionData,
    });
  };

  if (!reservationDetails) {
    return (
      <Layout>
        <Navbar />
        <Content style={{ padding: '50px', marginTop: '80px', textAlign: 'center' }}>
          <Alert
            message="خطا"
            description="اطلاعات رزرو یافت نشد. لطفاً از ابتدا مراحل را طی کنید."
            type="error"
            showIcon
          />
          <Button type="primary" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>
            بازگشت به صفحه اصلی
          </Button>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <Content>
        <PaymentWrapper>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="خلاصه رزرو">
                <Statistic title="نام اقامتگاه" value={reservationDetails.hotelName || 'نامشخص'} />
                <Divider />
                <Statistic
                  title="تاریخ ورود"
                  value={reservationDetails.checkIn?.replace(/-/g, '/') || 'نامشخص'}
                />
                <Divider />
                <Statistic
                  title="مبلغ نهایی"
                  value={reservationDetails.totalPrice || 0}
                  precision={0}
                  suffix="تومان"
                  valueStyle={{ color: '#1677ff', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="اطلاعات پرداخت">
                <CustomPaymentForm
                  isProcessing={createReservationWithTransactionMutation.isPending}
                  onPaymentSubmit={handlePaymentSubmit}
                />
              </Card>
            </Col>
          </Row>
        </PaymentWrapper>
      </Content>
    </Layout>
  );
};

export default PaymentPage;