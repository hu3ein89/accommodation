import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Spin, message, Card } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { sendPasswordResetEmail } from '../../services/authService';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const { success, message: successMessage } = 
        await sendPasswordResetEmail(values.email);
      
      if (success) {
        setSuccess(true);
        form.resetFields();
        message.success(successMessage);
      }
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'خطا در سیستم، لطفا بعدا تلاش کنید');
      message.error(err.message || 'خطا در ارسال لینک بازیابی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 500,
      margin: '40px auto',
      padding: 20
    }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          بازیابی رمز عبور
        </Title>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <Alert
              type="success"
              message="ایمیل ارسال شد"
              description="لینک بازیابی رمز عبور به ایمیل شما ارسال شده است. لطفا صندوق ورودی و یا اسپم ایمیل خود را بررسی کنید."
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Button 
              type="primary" 
              onClick={() => setSuccess(false)}
            >
              درخواست لینک جدید
            </Button>
          </div>
        ) : (
            <>
              <Text style={{ 
                display: 'block', 
                marginBottom: 24, 
                textAlign: 'center',
                color: '#666'
              }}>
                لطفا ایمیل حساب کاربری خود را وارد کنید
              </Text>
  
              {error && (
                <Alert
                  type="error"
                  message={error}
                  showIcon
                  closable
                  onClose={() => setError(null)}
                  style={{ marginBottom: 24 }}
                />
              )}

            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                name="email"
                rules={[
                  { 
                    required: true, 
                    message: 'لطفا ایمیل خود را وارد کنید' 
                  },
                  { 
                    type: 'email', 
                    message: 'فرمت ایمیل معتبر نیست' 
                  }
                ]}
                validateTrigger="onBlur"
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                  placeholder="example@gmail.com"
                  size="large"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{ height: 42 }}
                >
                  {loading ? <Spin size="small" /> : 'ارسال لینک بازیابی'}
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button 
            type="link" 
            onClick={() => window.history.back()}
            style={{ color: '#1890ff' }}
          >
            بازگشت به صفحه قبل
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;