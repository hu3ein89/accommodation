import React, { useState, useMemo } from "react";
import { Modal, Form, Input, Button, notification, Space, Select, Upload, Rate, Row, Col, Popconfirm, InputNumber, Card, Avatar, List } from "antd";
import { PlusOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHotel, fetchHotels, deleteHotel } from "../../api/jsonServer";
import styled from "styled-components";

const { Option } = Select;

const StyledUploadCard = styled(Upload)`
  .ant-upload.ant-upload-select {
    width: 100%;
    height: 150px;
    margin: 0 auto;
    background-color: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const HotelCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .ant-card-body {
    padding: 16px;
  }
  
  @media (min-width: 768px) {
    .ant-card-body {
      display: flex;
      align-items: center;
    }
    
    .hotel-image {
      margin-right: 16px;
    }
  }
`;

const HotelInfo = styled.div`
  flex: 1;
  
  .hotel-name {
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 16px;
  }
  
  .hotel-details {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.65);
  }
  
  .hotel-price {
    font-weight: 500;
    color: #1890ff;
  }
`;

const ManageHotels = ({ onEditHotel }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [searchText, setSearchText] = useState("");

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["hotels"],
    queryFn: fetchHotels,
  });

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const handleImageChange = info => {
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, setImageUrl);
    }
  };

  const createHotelMutation = useMutation({
    mutationFn: createHotel,
    onSuccess: (newlyCreatedHotel) => {
      notification.success({ message: 'هتل با موفقیت ایجاد شد' });
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      onEditHotel(newlyCreatedHotel.id);
    },
    onError: (error) => notification.error({ message: "خطا در ایجاد هتل", description: error.message }),
  });

  const deleteHotelMutation = useMutation({
    mutationFn: deleteHotel,
    onSuccess: () => {
      notification.success({ message: "هتل با موفقیت حذف شد" });
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
    onError: (error) => notification.error({ message: "خطا در حذف هتل", description: error.message }),
  });

  const handleAddHotel = async (values) => {
    if (!imageUrl) {
      notification.error({ message: 'لطفا یک تصویر اصلی برای هتل آپلود کنید.' });
      return;
    }

    const newHotelData = {
      ...values,
      image: imageUrl,
      images: [imageUrl],
      description: "",
      facilities: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await createHotelMutation.mutateAsync(newHotelData);
  };

  const filteredAndSortedHotels = useMemo(() => {
    let processedHotels = hotels.filter(hotel =>
      (hotel.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (hotel.location?.city?.toLowerCase() || '').includes(searchText.toLowerCase())
    );
    return processedHotels;
  }, [searchText, hotels]);

  return (
    <Card title="لیست هتل‌ها">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { form.resetFields(); setImageUrl(''); setIsAddModalOpen(true); }}
          style={{ marginBottom: 16 }}
        >
          افزودن هتل جدید
        </Button>

        <Input
          placeholder="جستجوی هتل..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />
      </Space>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <LoadingOutlined style={{ fontSize: 24 }} />
        </div>
      ) : (
        <List
          dataSource={filteredAndSortedHotels}
          pagination={{
            position: 'bottom',
            align: 'center',
            pageSize: 5,
          }}
          renderItem={(hotel) => (
            <HotelCard hoverable>
              <div className="hotel-image">
                <Avatar
                  src={hotel.image}
                  shape="square"
                  size={100}
                  style={{ borderRadius: '4px', margin: '10px' }}
                />
              </div>
              <HotelInfo>
                <div className="hotel-name">{hotel.name}</div>
                <div className="hotel-details">
                  {/* This will now display correctly if your fetchHotels API function is also corrected */}
                  <span>شهر: {hotel.location?.city || hotel.city}</span>
                  <span className="hotel-price">قیمت: {hotel.price?.toLocaleString() || '0'} تومان</span>
                </div>
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => onEditHotel(hotel.id)}
                    size="small"
                  >
                    ویرایش محتوا
                  </Button>
                  <Popconfirm
                    title="آیا از حذف این هتل مطمئن هستید؟"
                    onConfirm={() => deleteHotelMutation.mutate(hotel.id)}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    > حذف
                    </Button>
                  </Popconfirm>
                </Space>
              </HotelInfo>
            </HotelCard>
          )}
        />
      )}

      <Modal
        title="افزودن هتل جدید"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleAddHotel}>
          <Form.Item name="name" label="نام هتل" rules={[{ required: true }]}><Input /></Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="city" label="شهر" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="price" label="قیمت پایه (تومان)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="maxGuests" label="  تعداد نفرات مجاز" rules={[{ required: true }]}>
                <InputNumber />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="category" label="دسته‌بندی" rules={[{ required: true }]}>
                <Select>
                  <Option value="villa">ویلا</Option>
                  <Option value="cottage">کلبه</Option>
                  <Option value="apartment">آپارتمان</Option>
                  <Option value="beach">ساحلی</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={12}>
              <Form.Item name="rating" label="امتیاز اولیه" initialValue={4} rules={[{ required: true }]}>
                <Rate />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="تصویر اصلی هتل" required>
            <StyledUploadCard
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={({ onSuccess }) => onSuccess("ok")}
              onChange={handleImageChange}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="hotel preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div>
                  {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>بارگذاری</div>
                </div>
              )}
            </StyledUploadCard>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createHotelMutation.isPending}>
              ایجاد هتل و ادامه
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageHotels;