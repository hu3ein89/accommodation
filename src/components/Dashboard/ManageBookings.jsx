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
    
    // Only refetch transactions if status changed to cancelled
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
    
    // Optimistically update the UI
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
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>مدیریت رزروها</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={reservationsLoading}
        >
          بارگذاری مجدد
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
              title={`رزرو شماره: ${record.id}`}
              extra={getStatusTag(record.status)}
              style={{ width: '100%' }}
              actions={[
                <Button
                  type="text"
                  icon={expandedKeys.includes(record.id) ? <UpOutlined /> : <DownOutlined />}
                  onClick={() => toggleExpand(record.id)}
                >
                  
                  {expandedKeys.includes(record.id) ? 'بستن جزئیات' : 'مشاهده جزئیات'}
                </Button>,
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedBooking(record);
                    form.setFieldsValue({ status: record.status });
                    setEditModal(true);
                  }}
                >
                  تغییر وضعیت
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
                    icon={<DeleteOutlined />}
                    loading={deleteBookingMutation.isLoading && deleteBookingMutation.variables === record.id}
                  >
                    حذف
                  </Button>
                </Popconfirm>
              ]}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <strong style={{ color: 'Highlight' }}>نام مهمان: </strong>
                    <span>
                      {record?.user?.firstName || 'نامشخص'} {record?.user?.lastName || ''}
                      {!record?.user?.firstName && !record?.user?.lastName && record.hotelName && record.hotelName}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: 'violet' }}>هتل: </strong>
                    <span>{record?.hotel?.name || record.hotelName || "نامشخص"}</span>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <div>
                    <strong style={{ color: 'springgreen' }}>تاریخ ورود: </strong>
                    <span>{record.checkIn.replace(/-/g, '/') || "نامشخص"}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'red' }}>تاریخ خروج: </strong>
                    <span>{record.checkOut?.replace(/-/g, '/') || 'نامشخص'}</span>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <div>
                    <strong style={{ color: 'yellowgreen' }}>مبلغ: </strong>
                    <span>
                      {((record.totalPrice || 0)).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </Col>
              </Row>

              {expandedKeys.includes(record.id) && (
                <>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Card size="small" title="اطلاعات رزرو">
                        <p>تعداد بزرگسال: {record.guests?.adults || 1}</p>
                        <p>تعداد کودک: {record.guests?.children || 0}</p>
                        <p>تاریخ ثبت: {(record.checkIn)?.replace(/-/g, '/') || "نامشخص"}</p>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Card size="small" title="اطلاعات مهمان">
                        <p>نام: {record.user?.firstName || 'نامشخص'} {record.user?.lastName || ''}</p>
                        <p>ایمیل: {record.user?.email || "نامشخص"}</p>
                        <p>تلفن: {record.user?.phoneNumber || "نامشخص"}</p>
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
            <Select>
              <Option value="confirmed">تایید شده</Option>
              <Option value="pending">در انتظار</Option>
              <Option value="cancelled">لغو شده</Option>
              <Option value="cancelled_refund_pending">در انتظار بازپرداخت</Option>
              <Option value="refund_processed">  بازپرداخت شده</Option>
            </Select>
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button
                onClick={() => {
                  setEditModal(false);
                  form.resetFields();
                }}
              >
                انصراف
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateStatusMutation.isLoading}
              >
                ثبت تغییرات
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ManageBookings;