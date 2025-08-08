import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography, ConfigProvider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarOutlined, 
  DollarCircleOutlined, 
  ArrowDownOutlined, 
  ArrowUpOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { fetchAllTransactions, fetchReservations } from '../../api/jsonServer';
import { JalaliLocaleListener } from 'antd-jalali';
import fa_IR from 'antd/locale/fa_IR';

const { Title } = Typography;

const TRANSACTION_TYPES = {
  payment: {
    text: 'پرداخت ورودی',
    color: 'green',
    icon: <ArrowDownOutlined />,
    direction: 'in'
  },
  refund_request: {
    text: 'درخواست بازپرداخت',
    color: 'orange',
    direction: 'out'
  },
  refund_processed: {
    text: 'بازپرداخت انجام شده',
    color: 'red',
    icon: <ArrowUpOutlined />,
    direction: 'out'
  },
  default: {
    text: 'نامشخص',
    color: 'gray',
    direction: 'neutral'
  }
};

export const DashboardStats = () => {
  const { data: reservations = [], isLoading: loadingReservations } = useQuery({ 
    queryKey: ['reservations'], 
    queryFn: fetchReservations 
  });
  
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({ 
    queryKey: ['allTransactions'], 
    queryFn: fetchAllTransactions 
  });

  const financialSummary = useMemo(() => {
    const summary = {
      totalIncome: 0,
      totalRefunds: 0,
      netIncome: 0,
      pendingRefunds: 0
    };

    transactions.forEach(t => {
      const config = TRANSACTION_TYPES[t.type] || TRANSACTION_TYPES.default;

      if (config.direction === 'in') {
        summary.totalIncome += Math.abs(t.amount);
      } else if (t.type === 'refund_processed') {
        summary.totalRefunds += Math.abs(t.amount);
      } else if (t.type === 'refund_request' && t.status === 'pending') {
        summary.pendingRefunds += Math.abs(t.amount);
      }
    });

    summary.netIncome = summary.totalIncome - summary.totalRefunds;
    return summary;
  }, [transactions]);

  const reservationStats = useMemo(() => ({
    total: reservations.length,
    completed: reservations.filter(r => r.status === 'completed').length,
  }), [reservations]);

  const monthlyData = useMemo(() => {
    const monthNames = [
      "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];
    
    return monthNames.map((month, index) => ({
      name: month,
      bookings: reservations.filter(r => new Date(r.checkIn).getMonth() === index).length,
      revenue: transactions
        .filter(t => new Date(t.createdAt).getMonth() === index)
        .filter(t => TRANSACTION_TYPES[t.type]?.direction === 'in')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 1000000
    }));
  }, [reservations, transactions]);

  const isLoading = loadingReservations || loadingTransactions;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider direction="rtl" locale={fa_IR}>
      <JalaliLocaleListener />
      <div style={{ padding: '16px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>داشبورد مدیریتی</Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}  md={8}>
            <Card>
              <Statistic
                title="مجموع درآمدها"
                value={financialSummary.totalIncome}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowDownOutlined />}
                suffix="تومان"
                formatter={(value) => value.toLocaleString('fa-IR')}
              />
            </Card>
          </Col>
          <Col xs={24}  md={8}>
            <Card>
              <Statistic
                title="رزروهای تکمیل شده"
                value={reservationStats.total}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CalendarOutlined />}
                formatter={(value) => value.toLocaleString('fa-IR')}
              />
            </Card>
          </Col>
          <Col xs={24}  md={8}>
            <Card>
              <Statistic
                title="درآمد خالص"
                value={financialSummary.netIncome}
                precision={0}
                valueStyle={{
                  color: financialSummary.netIncome >= 0 ? '#3f8600' : '#cf1322'
                }}
                prefix={<DollarCircleOutlined />}
                suffix="تومان"
                formatter={(value) => value.toLocaleString('fa-IR')}
              />
            </Card>
          </Col>
        </Row>

        <Card title="روند درآمد و رزروها" style={{ marginBottom: '24px' }}>
          <div style={{ height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${value.toFixed(2)} میلیون تومان` : value,
                    name === 'revenue' ? 'درآمد' : 'رزروها'
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  name="رزروها"
                  stroke="#1890ff"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="درآمد (میلیون تومان)"
                  stroke="#3f8600"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default DashboardStats;