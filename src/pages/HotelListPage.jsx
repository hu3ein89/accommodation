import React, { useState, useMemo } from 'react';
import { Layout, Input, Button, Typography, Space, Select, Skeleton, Pagination, Card } from 'antd';
import { useQuery } from '@tanstack/react-query'; 
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { fetchHotels } from '../api/jsonServer';
import Navbar from '../components/Layout/Navbar';
import HotelListItem from '../components/hotels/HotelListItem';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const PageHeader = styled.div`
  background: #fff;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px 0;
`;

const HotelListPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Show 9 hotels per page

  const { data: hotels = [], isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
  });

  const filteredAndSortedHotels = useMemo(() => {
    let processedHotels = hotels.filter(hotel =>
      (hotel.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (hotel.location?.city?.toLowerCase() || '').includes(searchText.toLowerCase())
    );

    switch (sortOrder) {
      case 'price_asc':
        processedHotels.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        processedHotels.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        processedHotels.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return processedHotels;
  }, [searchText, hotels, sortOrder]);

  // --- Slicing data for the current page ---
  const paginatedHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedHotels.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredAndSortedHotels, pageSize]);

  const renderContent = () => {
    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '12px' }}>
            <Title level={4} type="danger">خطا در بارگیری اطلاعات</Title>
            <Button type="primary" onClick={() => window.location.reload()}>تلاش مجدد</Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <Space direction="vertical" size="large" style={{width: '100%'}}>
            {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index}><Skeleton avatar={{size: 150, shape: 'square'}} paragraph={{ rows: 4 }} active /></Card>
            ))}
        </Space>
      );
    }
    
    return (
      <>
        {paginatedHotels.length > 0 ? (
          paginatedHotels.map(hotel => (
            <HotelListItem 
              key={hotel.id}
              hotel={hotel}
              onViewDetails={(id) => navigate(`/hotels/${id}`)}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '12px' }}>
            <Title level={4}>هتلی یافت نشد</Title>
            <Typography.Text type="secondary">با این مشخصات، هتلی در لیست ما وجود ندارد.</Typography.Text>
          </div>
        )}
      </>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5',marginTop:'60px' }}>
      <Navbar />
      <Content style={{ padding: '24px', maxWidth: '1200px',minHeight:'calc(100vh -64px)', marginTop:'80px', margin: '0 auto', width: '100%' }}>
        <PageHeader>
          <Title level={2} style={{ margin: 0, marginBottom: '24px', fontWeight: 'bold' }}>تمام اقامتگاه‌ها</Title>
          <Space wrap size={[16, 16]} style={{width: '100%'}}>
              <Input
                placeholder="جستجو در نام یا شهر هتل..."
                prefix={<SearchOutlined />}
                size="large"
                allowClear
                style={{flex: 1, minWidth: '300px'}}
                value={searchText}
                onChange={e => {
                  setSearchText(e.target.value);
                  setCurrentPage(1); // Reset to first page on new search
                }}
              />
              <Select
                defaultValue="default"
                size="large"
                style={{ width: '200px' }}
                onChange={value => {
                  setSortOrder(value);

                  setCurrentPage(1); // Reset to first page on sort change
                }}
              >
                <Option value="default">مرتب‌سازی بر اساس</Option>
                <Option value="price_asc">ارزان‌ترین</Option>
                <Option value="price_desc">گران‌ترین</Option>
                <Option value="rating_desc">بیشترین امتیاز</Option>
              </Select>
          </Space>
        </PageHeader>
        
        {renderContent()}

        {/* --- Render Pagination Controls --- */}
        {filteredAndSortedHotels.length > pageSize && (
            <PaginationContainer>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredAndSortedHotels.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    className='custom-pagination'
                />
            </PaginationContainer>
        )}
      </Content>
    </Layout>
  );
};

export default HotelListPage;