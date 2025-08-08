import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <Result
      status="404"
      title="صفحه مورد نظر یافت نشد"
      subTitle="متاسفانه صفحه مورد نظر یافت نشد"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
           بازگشت به صفحه اصلی
        </Button>
      }
    />
  );
};

export default Unauthorized;