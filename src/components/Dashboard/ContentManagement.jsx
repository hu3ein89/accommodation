import React, { useState, useEffect } from 'react';
import { Form, Input, Button, notification, Tabs, Upload, Space, Select, Card, Empty, Spin, Alert, Popconfirm, Image as AntdImage, Row, Col, Rate, InputNumber, Collapse, Typography, Tag } from 'antd';
import { PlusOutlined, ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHotelDetails, updateHotel, fetchHotels } from '../../api/jsonServer';
import styled from 'styled-components';

const ResponsiveContainer = styled.div`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ImagePreviewWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  border-radius: 8px;
  overflow: hidden;
  display: inline-block;
  margin: 8px;
  
  &:hover .delete-btn {
    display: block;
  }

  .delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    display: none;
    z-index: 10;
  }

  .ant-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
`;

const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
`;

const UploadButton = styled.div`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
  background: #fafafa;

  &:hover {
    border-color: #1890ff;
    background: #e6f7ff;
  }
`;

const predefinedAmenities = {
  general: [
    'پارکینگ',
    'WiFi رایگان',
    'لابی',
    'آسانسور',
    'اتاق کنفرانس',
    'خدمات 24 ساعته',
    'سرویس حمل چمدان',
    'صندوق امانات',
    'خدمات روم سرویس'
  ],
  wellness: [
    'استخر',
    'سونا',
    'جکوزی',
    'سالن ماساژ',
    'سالن بدنسازی',
    'مرکز اسپا',
    'سالن یوگا',
    'حمام ترکی'
  ],
  dining: [
    'رستوران',
    'کافی شاپ',
    'صبحانه رایگان',
    'سرو غذا در اتاق',
    'بار',
    'لانژ'
  ]
};

const HotelContentEditor = ({ hotelId, onBackToList }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [imageList, setImageList] = useState([]);

  const { data: hotel, isLoading, isError, error } = useQuery({
    queryKey: ['hotelDetails', hotelId],
    queryFn: () => fetchHotelDetails(hotelId),
    enabled: !!hotelId,
  });

  useEffect(() => {
    if (hotel) {
      form.setFieldsValue(hotel);
      const imagesFromDb = Array.isArray(hotel.images) && hotel.images.length > 0 
        ? hotel.images 
        : (hotel.image ? [hotel.image] : []);
      setImageList(imagesFromDb.map((url, index) => ({
        uid: `existing-${index}`, 
        name: `image-${index}.png`, 
        status: 'done', 
        url: url,
      })));
    }
  }, [hotel, form]);

  const updateHotelMutation = useMutation({
    mutationFn: (updatedData) => updateHotel(hotelId, updatedData),
    onSuccess: () => {
      notification.success({ message: 'موفقیت', description: 'تغییرات با موفقیت ذخیره شد.' });
      queryClient.invalidateQueries({ queryKey: ['hotelDetails', hotelId] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel', hotelId] });
    },
    onError: (err) => notification.error({ message: 'خطا', description: err.message }),
  });

  const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
  
  const handleFormSubmit = async (values) => {
    const finalImageUrls = imageList.map(file => file.url);
    const updatedData = { 
      ...hotel, 
      ...values,
      images: finalImageUrls,
      image: finalImageUrls[0] || null 
    };
    await updateHotelMutation.mutateAsync(updatedData);
  };
  
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const base64Url = await getBase64(file);
      const newImage = { uid: file.uid, name: file.name, status: 'done', url: base64Url };
      setImageList(prev => [...prev, newImage]);
      onSuccess("ok");
    } catch (err) { onError(err); }
  };

  const handleImageRemove = (fileToRemove) => {
    setImageList(prev => prev.filter(item => item.uid !== fileToRemove.uid));
  };

  if (isLoading) return <Spin tip="در حال بارگذاری..." size="large" />;
  if (isError) return <Alert message="خطا در بارگذاری اطلاعات" description={error.message} type="error" showIcon />;

  const renderFacilitySelector = () => (
    <Select
      mode="tags"
      style={{ width: '100%' }}
      placeholder="امکانات را انتخاب کنید یا وارد نمایید"
      dropdownRender={(menu) => (
        <div>
          <div style={{ padding: '5px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <Space wrap>
              {predefinedAmenities.dining.map(facility => (
                <Tag
                  key={facility}
                  style={{ cursor: 'pointer', margin: '2px' }}
                  onClick={() => {
                    const currentFacilities = form.getFieldValue('facilities') || [];
                    if (!currentFacilities.includes(facility)) {
                      form.setFieldsValue({
                        facilities: [...currentFacilities, facility]
                      });
                    }
                  }}
                >
                  {facility}
                </Tag>
              ))}
            </Space>
            <Space wrap>
              {predefinedAmenities.general.map(facility => (
                <Tag
                  key={facility}
                  style={{ cursor: 'pointer', margin: '2px' }}
                  onClick={() => {
                    const currentFacilities = form.getFieldValue('facilities') || [];
                    if (!currentFacilities.includes(facility)) {
                      form.setFieldsValue({
                        facilities: [...currentFacilities, facility]
                      });
                    }
                  }}
                >
                  {facility}
                </Tag>
              ))}
            </Space>
            <Space wrap>
              {predefinedAmenities.wellness.map(facility => (
                <Tag
                  key={facility}
                  style={{ cursor: 'pointer', margin: '2px' }}
                  onClick={() => {
                    const currentFacilities = form.getFieldValue('facilities') || [];
                    if (!currentFacilities.includes(facility)) {
                      form.setFieldsValue({
                        facilities: [...currentFacilities, facility]
                      });
                    }
                  }}
                >
                  {facility}
                </Tag>
              ))}
            </Space>
          </div>
          {menu}
        </div>
      )}
    />
  );
  const tabItems = [
    { 
      key: '1', 
      label: 'اطلاعات پایه', 
      children: (
        <>
          <Form.Item name="name" label="نام هتل" rules={[{ required: true, message: 'نام هتل الزامی است!' }]}>
            <Input />
          </Form.Item>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="city" label="شهر" rules={[{ required: true, message: 'شهر الزامی است!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="category" label="دسته‌بندی" rules={[{ required: true, message: 'دسته‌بندی الزامی است!' }]}>
                <Select>
                  <Select.Option value="villa">ویلا</Select.Option>
                  <Select.Option value="cottage">کلبه</Select.Option>
                  <Select.Option value="apartment">آپارتمان</Select.Option>
                  <Select.Option value="beach">ساحلی</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="maxGuests" label="تعداد نفرات مجاز" rules={[{ required: true }]}>
                <InputNumber />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="rating" label="امتیاز" rules={[{ required: true, message: 'امتیاز الزامی است!' }]}>
            <Rate />
          </Form.Item>
        </>
      )
    },
    { 
      key: '2', 
      label: 'اطلاعات کلی', 
      children: (
        <>
          <Form.Item name="description" label="توضیحات هتل">
            <Input.TextArea rows={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rules" label="قوانین">
            <Input.TextArea rows={4} style={{ width: '100%' }} />
          </Form.Item>
        </>
      )
    },
    { 
      key: '3', 
      label: 'گالری تصاویر', 
      children: (
        <GalleryContainer>
          {imageList.map((image) => (
            <ImagePreviewWrapper key={image.uid}>
              <AntdImage 
                src={image.url || image.thumbUrl}
                preview={{ mask: null }}
              />
              <Popconfirm
                title="آیا از حذف این تصویر مطمئن هستید؟"
                onConfirm={() => handleImageRemove(image)}
                okText="بله"
                cancelText="خیر"
              >
                <Button 
                  danger 
                  shape="circle" 
                  icon={<DeleteOutlined />}
                  className="delete-btn"
                  size="small"
                />
              </Popconfirm>
            </ImagePreviewWrapper>
          ))}
          <Upload
            customRequest={handleImageUpload}
            listType="picture-card"
            showUploadList={false}
            accept="image/*"
            multiple
          >
            <UploadButton>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>آپلود</div>
            </UploadButton>
          </Upload>
        </GalleryContainer>
      )
    },
    { 
      key: '4', 
      label: 'امکانات', 
      children: (
        <Form.Item name="facilities" label="امکانات هتل">
          {renderFacilitySelector()}
        </Form.Item>
      )
    },
  ];

  return (
    <ResponsiveContainer>
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Button 
          onClick={onBackToList} 
          icon={<ArrowRightOutlined />} 
          style={{ marginBottom: '24px' }}
        >
          بازگشت به لیست هتل‌ها
        </Button>
        <Tabs 
          defaultActiveKey="1" 
          items={tabItems} 
          tabPosition="top"
          style={{ width: '100%' }}
        />
        <Form.Item style={{ marginTop: 24 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={updateHotelMutation.isPending}
            style={{ width: '100%', maxWidth: '200px' }}
          >
            ذخیره تمام تغییرات
          </Button>
        </Form.Item>
      </Form>
    </ResponsiveContainer>
  );
};

const ContentManagement = ({ hotelId, onBackToList }) => {
  const { data: hotels = [], isLoading } = useQuery({ queryKey: ['hotels'], queryFn: fetchHotels });
  return (
    <Card title="ویرایش جزئیات و محتوای هتل">
      {!hotelId ? (
        <Empty description="برای شروع، از صفحه «لیست هتل‌ها» یک هتل را برای ویرایش انتخاب کنید." />
      ) : (
        <HotelContentEditor hotelId={hotelId} key={hotelId} onBackToList={() => onBackToList(null)} />
      )}
    </Card>
  );
};

export default ContentManagement;