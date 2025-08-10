import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllTransactions, approveRefund } from '../../api/jsonServer';
import { Card, Tag, Button, Typography, Spin, Row, Col, Segmented, notification, Table, Statistic, Input, Select, Space, Popconfirm, Empty, ConfigProvider, Grid } from 'antd';
import { DatePicker as DatePickerJalali, JalaliLocaleListener } from 'antd-jalali';
import fa_IR from 'antd/locale/fa_IR';
import { ArrowDownOutlined, ArrowUpOutlined, SyncOutlined, CheckCircleOutlined, SearchOutlined, FilterOutlined, DownloadOutlined, DollarOutlined, RedoOutlined, ReloadOutlined } from '@ant-design/icons';
import { exportToExcel } from '../../utils/exportHelpers';
import { parseDBDateToJalali, formatJalaliDate, formatDateForDisplay } from '../../utils/dateUtils';

const { Text } = Typography;
const { RangePicker: RangePickerJalali } = DatePickerJalali;
const { Option } = Select;
const { useBreakpoint } = Grid;

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
    icon: <SyncOutlined spin />,
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

const STATUS_COLORS = {
  pending: 'orange',
  completed: 'green',
  failed: 'red',
  successful: 'green',
  cancelled: 'gray'
};

const TransactionCard = ({ transaction, onApproveRefund, isLoading }) => {
  const typeConfig = TRANSACTION_TYPES[transaction.type] || TRANSACTION_TYPES.default;
  
  return (
    <Card 
      size="small" 
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <Tag color={typeConfig.color} icon={typeConfig.icon}>
            {typeConfig.text}
          </Tag>
          <Text strong>{transaction.amount.toLocaleString('fa-IR')} تومان</Text>
        </Space>
      }
      extra={
        <Tag color={STATUS_COLORS[transaction.status] || 'default'}>
          {transaction.status === 'pending' ? 'در انتظار' :
            transaction.status === 'completed' ? 'تکمیل شده' :
              transaction.status === 'failed' ? 'ناموفق' :
                transaction.status === 'successful' ? 'موفق' :
                  transaction.status === 'cancelled' ? 'لغو شده' : transaction.status}
        </Tag>
      }
    >
      <Row gutter={16}>
        <Col span={24}>
          <Text strong>توضیحات: </Text>
          <Text>{transaction.description || 'ندارد'}</Text>
        </Col>
        <Col span={24}>
          <Text strong>تاریخ: </Text>
          <Text>{formatDateForDisplay(transaction.createdAt)}</Text>
        </Col>
        {transaction.reservationId && (
          <Col span={24}>
            <Text strong>شناسه رزرو: </Text>
            <Text>{transaction.reservationId}</Text>
          </Col>
        )}
        {transaction.type === 'refund_request' && transaction.status === 'pending' && (
          <Col span={24} style={{ marginTop: 12 }}>
            <Popconfirm
              title="آیا از تایید این بازپرداخت اطمینان دارید؟"
              onConfirm={() => onApproveRefund(transaction.id)}
              okText="بله"
              cancelText="خیر"
              okButtonProps={{ className: 'confirm-button' }}
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={isLoading}
                block
              >
                تایید بازپرداخت
              </Button>
            </Popconfirm>
          </Col>
        )}
      </Row>
    </Card>
  );
};

const ManageTransactions = () => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const { data: transactions = [], isLoading, isRefetching } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: fetchAllTransactions,
    refetchOnWindowFocus: true
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries(['alltransactions']);
  };

  const approveRefundMutation = useMutation({
    mutationFn: (transactionId) => {
      // Find the transaction to get its reservationId
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction || !transaction.reservationId) {
        throw new Error('تراکنش یا شناسه رزرو مرتبط یافت نشد');
      }

      // Calling the new, single API function
      return approveRefund({
        transactionId: transaction.id,
        reservationId: transaction.reservationId
      });
    },
    onSuccess: () => {
      notification.success({ message: 'بازپرداخت با موفقیت تایید و ثبت شد' });
    },
    onError: (error) => {
      notification.error({
        message: 'خطا در پردازش بازپرداخت',
        description: error.message,
      });
    },
    onSettled: () => {
      // Invalidate queries to refresh the UI completely
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['userReservations'] });
    }
  });

  // Calculate financial summary
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
        summary.totalIncome += t.amount;
      } else if (t.type === 'refund_processed') {
        summary.totalRefunds += Math.abs(t.amount);
      } else if (t.type === 'refund_request' && t.status === 'pending') {
        summary.pendingRefunds += Math.abs(t.amount);
      }
    });

    summary.netIncome = summary.totalIncome - summary.totalRefunds;

    return summary;
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply type filter
    if (filter === 'in') {
      result = result.filter(t => TRANSACTION_TYPES[t.type]?.direction === 'in');
    } else if (filter === 'out') {
      result = result.filter(t => TRANSACTION_TYPES[t.type]?.direction === 'out');
    }

    // Apply date range filter
    if (dateRange?.length === 2) {
      const [start, end] = dateRange;
      result = result.filter(t => {
        const date = parseDBDateToJalali(t.createdAt);
        return date.isSameOrAfter(start, 'day') && date.isSameOrBefore(end, 'day');
      });
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.id?.toLowerCase().includes(searchLower) ||
        (t.reservationId && t.reservationId.toLowerCase().includes(searchLower))
      );
    }

    // Apply type selection filter
    if (selectedTypes.length > 0) {
      result = result.filter(t => selectedTypes.includes(t.type));
    }

    // Apply status selection filter
    if (selectedStatuses.length > 0) {
      result = result.filter(t => selectedStatuses.includes(t.status));
    }

    // Sort by date (newest first)
    return result.sort((a, b) => {
      const dateA = parseDBDateToJalali(a.createdAt);
      const dateB = parseDBDateToJalali(b.createdAt);
      return dateB.unix() - dateA.unix();
    });
  }, [transactions, filter, dateRange, searchText, selectedTypes, selectedStatuses]);

  const handleExport = () => {
    const data = filteredTransactions.map(t => ({
      'شناسه': t.id,
      'نوع': TRANSACTION_TYPES[t.type]?.text || 'نامشخص',
      'مبلغ': t.amount,
      'وضعیت': t.status === 'pending' ? 'در انتظار' :
                t.status === 'completed' ? 'تکمیل شده' :
                t.status === 'failed' ? 'ناموفق' :
                t.status === 'successful' ? 'موفق' :
                t.status === 'cancelled' ? 'لغو شده' : t.status,
      'توضیحات': t.description || 'ندارد',
      'تاریخ': formatDateForDisplay(t.createdAt),
      'شناسه رزرو': t.reservationId || 'ندارد'
    }));
    
    exportToExcel(data, `تراکنش‌ها_${formatJalaliDate(parseDBDateToJalali(new Date()))}`);
  };

  const DescriptionCell = ({ text, record }) => {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 10;
    const shouldTruncate = text?.length > maxLength;
    
    // Combine description and reservationId if available
    const fullText = record.reservationId 
      ? `${text || ''} (شناسه رزرو: ${record.reservationId})`
      : text || 'ندارد';
  
    return (
      <div style={{fontSize:'12px'}}>
        {shouldTruncate && !expanded ? (
          <>
            {fullText.substring(0, maxLength)}...
            <Button 
              type="link" 
              size="small" 
              onClick={() => setExpanded(true)}
              style={{ 
                fontSize: '12px',
                padding: '0 4px',
                height: 'auto'
              }}
            >
              بیشتر
            </Button>
          </>
        ) : (
          <>
            {fullText}
            {shouldTruncate && (
              <Button 
                type="link" 
                size="small" 
                onClick={() => setExpanded(false)}
                style={{ 
                  fontSize: '12px',
                  padding: '0 4px',
                  height: 'auto'
                }}
              >
                کمتر
              </Button>
            )}
          </>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: 'نوع',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const config = TRANSACTION_TYPES[type] || TRANSACTION_TYPES.default;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      sorter: (a, b) => {
        const typeA = TRANSACTION_TYPES[a.type]?.text || '';
        const typeB = TRANSACTION_TYPES[b.type]?.text || '';
        return typeA.localeCompare(typeB);
      }
    },
    {
      title: 'مبلغ',
      dataIndex: 'amount',
      key: 'amount',
      width:120,
      render: (amount, record) => {
        const config = TRANSACTION_TYPES[record.type] || TRANSACTION_TYPES.default;
        const isNegative = config.direction === 'out';
        return (
          <Text ellipsis style={{ width: '100%', display: 'inline-block',fontSize:'13px' }} type={isNegative ? 'danger' : 'success'}>
            {amount.toLocaleString('fa-IR')} تومان
          </Text>
        );
      },
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {status === 'pending' ? 'در انتظار' :
            status === 'completed' ? 'تکمیل شده' :
              status === 'failed' ? 'ناموفق' :
                status === 'successful' ? 'موفق' :
                  status === 'cancelled' ? 'لغو شده' : status}
        </Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status)
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      fontSize:12,
      render: (text, record) => <DescriptionCell text={text} record={record} />
    },
    {
      title: 'تاریخ',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => formatDateForDisplay(date),
      sorter: (a, b) => {
        const dateA = parseDBDateToJalali(a.createdAt);
        const dateB = parseDBDateToJalali(b.createdAt);
        return dateA.unix() - dateB.unix();
      },
      defaultSortOrder: 'descend'
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.type === 'refund_request' && record.status === 'pending' && (
            <Popconfirm
              title="آیا از تایید این بازپرداخت اطمینان دارید؟"
              onConfirm={() => approveRefundMutation.mutate(record.id)}
              okText="بله"
              cancelText="خیر"
              okButtonProps={{ className: 'confirm-button' }}
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={approveRefundMutation.isLoading && approveRefundMutation.variables === record.id}
              >
                تایید
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <ConfigProvider direction="rtl" locale={fa_IR}>
      <JalaliLocaleListener />
      <Card
        title={
          <Space 
          style={{ 
            margin: 0,
            display: screens.md ? 'block' : 'none', 
            textAlign: 'center' 
          }}>
            <DollarOutlined />
            <span>مدیریت تراکنش‌ها</span>
            {isRefetching && <Spin indicator={<RedoOutlined spin />} />}
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              بارگذاری مجدد
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={filteredTransactions.length === 0}
            >
خروجی            </Button>
          </Space>
        }
      >
        {/* Summary Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
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
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="مجموع بازپرداخت‌ها"
                value={financialSummary.totalRefunds}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowUpOutlined />}
                suffix="تومان"
                formatter={(value) => value.toLocaleString('fa-IR')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="درآمد خالص"
                value={financialSummary.netIncome}
                precision={0}
                valueStyle={{
                  color: financialSummary.netIncome >= 0 ? '#3f8600' : '#cf1322'
                }}
                prefix={<DollarOutlined />}
                suffix="تومان"
                formatter={(value) => value.toLocaleString('fa-IR')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="بازپرداخت‌های در انتظار"
                value={financialSummary.pendingRefunds}
                precision={0}
                valueStyle={{ color: '#d46b08' }}
                prefix={<SyncOutlined />}
                suffix="تومان"
                formatter={(value) => value.toLocaleString('fa-IR')}
              />
            </Card>
          </Col>
        </Row>

        {/* Filter Controls */}
        <Card
          title="فیلترها"
          style={{ marginBottom: 24 }}
          extra={
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setDateRange([]);
                setSearchText('');
                setSelectedTypes([]);
                setSelectedStatuses([]);
              }}
            >
              بازنشانی فیلترها
            </Button>
          }
        >
          <Row gutter={16}>
            <Col span={24} style={{ marginBottom: 16 }}>
              <Segmented
                options={[
                  { label: 'همه', value: 'all' },
                  { label: 'ورودی‌ها', value: 'in' },
                  { label: 'خروجی‌ها', value: 'out' }
                ]}
                value={filter}
                onChange={setFilter}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
              <RangePickerJalali
                style={{ width: '100%' }}
                format="YYYY/MM/DD"
                onChange={(dates) => setDateRange(dates)}
                value={dateRange}
                placeholder={['شروع', 'پایان']}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
              <Input
                placeholder="جستجو در تراکنش‌ها..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
              <Select
                mode="multiple"
                placeholder="فیلتر بر اساس نوع"
                style={{ width: '100%' }}
                value={selectedTypes}
                onChange={setSelectedTypes}
                allowClear
              >
                {Object.keys(TRANSACTION_TYPES).map(key => (
                  <Option key={key} value={key}>
                    {TRANSACTION_TYPES[key].text}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
              <Select
                mode="multiple"
                placeholder="فیلتر بر اساس وضعیت"
                style={{ width: '100%' }}
                value={selectedStatuses}
                onChange={setSelectedStatuses}
                allowClear
              >
                <Option value="pending">در انتظار</Option>
                <Option value="completed">تکمیل شده</Option>
                <Option value="successful">موفق</Option>
                <Option value="failed">ناموفق</Option>
                <Option value="cancelled">لغو شده</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Transactions Display */}
        <Card>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin size="large" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <>
              {screens.lg ? (
                // Desktop - Table View
                <Table
                  columns={columns}
                  dataSource={filteredTransactions}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => `مجموع ${total.toLocaleString('fa-IR')} تراکنش`
                  }}
                  scroll={{ x: true }}
                  locale={{
                    emptyText: 'تراکنشی یافت نشد'
                  }}
                />
              ) : (
                // Mobile - Card View
                <div>
                  {filteredTransactions.map(transaction => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onApproveRefund={approveRefundMutation.mutate}
                      isLoading={approveRefundMutation.isLoading && approveRefundMutation.variables === transaction.id}
                    />
                  ))}
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">
                      نمایش {filteredTransactions.length} تراکنش
                    </Text>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="تراکنشی یافت نشد"
            />
          )}
        </Card>
      </Card>
    </ConfigProvider>
  );
};

export default ManageTransactions;