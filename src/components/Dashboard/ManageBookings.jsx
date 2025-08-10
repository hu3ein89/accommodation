import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Select,
  Popconfirm,
  Card,
  Row,
  Col,
  Divider,
  Collapse,
  Empty,
  Spin,
  Space,
  Tag
} from "antd";
import { EditOutlined, DeleteOutlined, ReloadOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservationStatus, deleteReservation, createTransaction } from "../../api/jsonServer";
import { STATUS_CONFIG } from "../../constants/index";
import { useNotification } from "../../context/NotificationContext";

const { Option } = Select;
const { Panel } = Collapse;

const ManageBookings = ({ limit, loading: externalLoading }) => {
  const queryClient = useQueryClient();
  const [editModal, setEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [form] = Form.useForm();
  const notification = useNotification();

  const { data: reservations = [], isLoading: reservationsLoading, error } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      try {
        const [reservationsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/reservations`),
          axios.get(`${API_URL}/private_messages`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/notifications`).catch(() => ({ data: [] }))
        ]);
        return reservationsRes.value?.data || [];
      } catch (error) {
        throw new Error('خطا در دریافت اطلاعات رزروها');
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    onError: () => {
      notification.error({
        message: 'خطا',
        description: 'خطا در دریافت اطلاعات رزروها',
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateReservationStatus,
    onSuccess: (updatedReservation) => {
      queryClient.setQueryData(['reservations'], (old) => 
        old.map(r => r.id === updatedReservation.id ? updatedReservation : r)
      );
      
      if (updatedReservation.status.booking === 'cancelled') {
        queryClient.invalidateQueries({
          queryKey: ['allTransactions'],
          exact: true
        });
      }
      
      notification.success({ 
        message: "موفقیت", 
        description: "وضعیت رزرو با موفقیت به‌روزرسانی شد" 
      });
      setEditModal(false);
    },
    onError: (error) => {
      notification.error({ 
        message: "خطا", 
        description: error.message || "خطا در به‌روزرسانی وضعیت" 
      });
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (id) => deleteReservation(id, false),
    onSuccess: (response) => {
      const deletedId = response.id;
      
      queryClient.setQueryData(['reservations'], (old) => 
        old.filter(r => r.id !== deletedId)
      );

      const reservation = reservations.find(r => r.id === deletedId);
      if (reservation?.status?.booking === 'cancelled_refund_pending') {
        createTransaction({
          userId: reservation.userId,
          reservationId: reservation.id,
          type: 'refund_processed',
          amount: -reservation.totalPrice,
          status: 'completed',
          description: `بازپرداخت پس از حذف رزرو #${reservation.id}`,
        }).then(() => {
          queryClient.invalidateQueries(['allTransactions']);
        });
      }

      notification.success({
        message: "موفقیت",
        description: "رزرو با موفقیت حذف شد"
      });
    },
    onError: (error) => {
      notification.error({ 
        message: "خطا", 
        description: error.message || "خطا در لغو رزرو" 
      });
    }
  });

  const handleUpdateStatus = async (values) => {
    if (!selectedBooking?.id) {
      notification.error({ message: "خطا", description: "شناسه رزرو نامعتبر است" });
      return;
    }

    try {
      const updatedReservation = await updateStatusMutation.mutateAsync({
        id: selectedBooking.id,
        status: values.status,
      });

      if (values.status === 'cancelled' && selectedBooking.userId) {
        await createTransaction({
          userId: selectedBooking.userId,
          reservationId: selectedBooking.id,
          type: 'refund_processed',
          amount: -selectedBooking.totalPrice,
          status: 'completed',
          description: `استرداد وجه برای رزرو #${selectedBooking.id}`,
        });
      }
    } catch (error) {
      console.error("خطا در به‌روزرسانی وضعیت:", error);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      const reservation = reservations.find(r => r.id === id);
      const prevBookingStatus = typeof reservation.status === 'object' ? reservation.status.booking : reservation.status;

      await deleteBookingMutation.mutateAsync(id);

      if (prevBookingStatus === 'cancelled_refund_pending') {
        await createTransaction({
          userId: reservation.userId,
          reservationId: reservation.id,
          type: 'refund_processed',
          amount: -reservation.totalPrice,
          status: 'completed',
          description: `بازپرداخت پس از حذف رزرو #${reservation.id}`,
        });
        queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
        notification.success({ message: 'تراکنش بازپرداخت پس از حذف ثبت شد.' });
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const refundPendingReservations = reservations.filter(
    r =>
      typeof r.status === 'object' &&
      r.status.booking === 'cancelled_refund_pending'
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries(['reservations']);
  };

  const getStatusTag = (status) => {
    const statusStr = typeof status === 'object' ? status.booking : status;
    const config = STATUS_CONFIG[statusStr] || STATUS_CONFIG.pending;

    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const toggleExpand = (id) => {
    if (expandedKeys.includes(id)) {
      setExpandedKeys(expandedKeys.filter(key => key !== id));
    } else {
      setExpandedKeys([...expandedKeys, id]);
    }
  };

  return (
    <div style={{ padding: '0 8px',maxWidth:'100%', overflowX:'hidden' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',flexWrap: 'wrap' }}>
      <h2 style={{ 
          margin: 0, 
          fontSize: 'clamp(16px, 4vw, 18px)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>مدیریت رزروها</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={reservationsLoading}
          size="small"
          style={{ marginTop: '4px' }}
        >
          <span className="responsive-text">بارگذاری مجدد</span>
        </Button>
      </div>

      {reservationsLoading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" />
        </div>
      ) : reservations.length === 0 ? (
        <Empty description="هیچ رزروی یافت نشد" />
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {reservations.map(record => (
            <Card
              key={record.id}
              title={<span style={{ 
                fontSize: 'clamp(10px, 2.5vw, 14px)',
                display: 'inline-block',
                width: '100%',
                textAlign: 'center'
              }}>
                رزرو شماره: {record.id}
              </span>}
              extra={<div style={{ textAlign: 'center' }}>
              {getStatusTag(record.status)}
            </div>}
              style={{ width: '100%',minWidth: '280px' }}
              headStyle={{ 
                padding: '0 8px',
                textAlign: 'center'
              }}
              bodyStyle={{ 
                padding: '12px 8px'
              }}
              actions={[
                <Button
                  type="text"
                  size="small"
                  icon={expandedKeys.includes(record.id) ? <UpOutlined /> : <DownOutlined />}
                  onClick={() => toggleExpand(record.id)}
                >
                  <span className="responsive-text">
                    {expandedKeys.includes(record.id) ? 'بستن' : 'جزئیات'}
                  </span>
                </Button>,
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedBooking(record);
                    form.setFieldsValue({ status: record.status });
                    setEditModal(true);
                  }}
                >
                  <span className="responsive-text">تغییر</span>
                </Button>,
                <Popconfirm
                  title="آیا از حذف این رزرو اطمینان دارید؟"
                  onConfirm={() => handleDeleteBooking(record.id)}
                  okText="بله"
                  cancelText="خیر"
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={deleteBookingMutation.isLoading && deleteBookingMutation.variables === record.id}
                  >
                    <span className="responsive-text">حذف</span>
                  </Button>
                </Popconfirm>
              ]}
            >
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <strong style={{ color: 'Highlight', fontSize: '12px' }}>نام مهمان: </strong>
                    <span style={{ fontSize: '12px' }}>
                      {record?.user?.firstName || 'نامشخص'} {record?.user?.lastName || ''}
                      {!record?.user?.firstName && !record?.user?.lastName && record.hotelName && record.hotelName}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: 'violet', fontSize: '12px' }}>هتل: </strong>
                    <span style={{ fontSize: '12px' }}>{record?.hotel?.name || record.hotelName || "نامشخص"}</span>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <div>
                    <strong style={{ color: 'springgreen', fontSize: '12px' }}>تاریخ ورود: </strong>
                    <span style={{ fontSize: '12px' }}>{record.checkIn.replace(/-/g, '/') || "نامشخص"}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'red', fontSize: '12px' }}>تاریخ خروج: </strong>
                    <span style={{ fontSize: '12px' }}>{record.checkOut?.replace(/-/g, '/') || 'نامشخص'}</span>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <div>
                    <strong style={{ color: 'yellowgreen', fontSize: '12px' }}>مبلغ: </strong>
                    <span style={{ fontSize: '12px' }}>
                      {((record.totalPrice || 0)).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </Col>
              </Row>

              {expandedKeys.includes(record.id) && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Row gutter={[8, 8]}>
                    <Col xs={24} sm={12} md={12}>
                      <Card size="small" title="اطلاعات رزرو" headStyle={{ fontSize: '12px' }} bodyStyle={{ padding: '8px' }}>
                        <p style={{ marginBottom: '8px', fontSize: '12px' }}>تعداد بزرگسال: {record.guests?.adults || 1}</p>
                        <p style={{ marginBottom: '8px', fontSize: '12px' }}>تعداد کودک: {record.guests?.children || 0}</p>
                        <p style={{ marginBottom: '0', fontSize: '12px' }}>تاریخ ثبت: {(record.checkIn)?.replace(/-/g, '/') || "نامشخص"}</p>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} md={12}>
                      <Card size="small" title="اطلاعات مهمان" headStyle={{ fontSize: '12px' }} bodyStyle={{ padding: '8px' }}>
                        <p style={{ marginBottom: '8px', fontSize: '12px' }}>نام: {record.user?.firstName || 'نامشخص'} {record.user?.lastName || ''}</p>
                        <p style={{ marginBottom: '8px', fontSize: '12px' }}>ایمیل: {record.user?.email || "نامشخص"}</p>
                        <p style={{ marginBottom: '0', fontSize: '12px' }}>تلفن: {record.user?.phoneNumber || "نامشخص"}</p>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="تغییر وضعیت رزرو"
        visible={editModal}
        onCancel={() => {
          setEditModal(false);
          form.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? '90%' : '50%'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStatus}
          initialValues={{
            status: selectedBooking?.status,
          }}
        >
          <Form.Item
            name="status"
            label="وضعیت"
            rules={[{ required: true, message: "لطفاً وضعیت را انتخاب کنید" }]}
          >
            <Select size="large">
              <Option value="confirmed">تایید شده</Option>
              <Option value="pending">در انتظار</Option>
              <Option value="cancelled">لغو شده</Option>
              <Option value="cancelled_refund_pending">در انتظار بازپرداخت</Option>
              <Option value="refund_processed">بازپرداخت شده</Option>
            </Select>
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button
                onClick={() => {
                  setEditModal(false);
                  form.resetFields();
                }}
                size={window.innerWidth < 768 ? 'middle' : 'large'}
              >
                انصراف
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateStatusMutation.isLoading}
                size={window.innerWidth < 768 ? 'middle' : 'large'}
              >
                ثبت تغییرات
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        @media (max-width: 768px) {
          .responsive-text {
            display: none;
          }
          .ant-card-actions > li {
            margin: 4px 0 !important;
          }
          .ant-card-head-title {
            padding: 8px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageBookings;