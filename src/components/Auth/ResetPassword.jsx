import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Layout, Row, Col, Alert, Typography, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../../services/authService';
import Navbar from '../Layout/Navbar';
import '../../styles/Auth.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);
        const cleanToken = token ? decodeURIComponent(token) : '';
        console.log('Cleaned token:', cleanToken);

        await validateResetToken(cleanToken);
        setTokenValid(true);
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
        setError('لینک بازیابی نامعتبر یا منقضی شده است');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError('لینک بازیابی نامعتبر است');
    }
  }, [token]);
  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      await resetPassword(token, values.password);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'رمز عبور شما با موفقیت تغییر یافت',
            type: 'success'
          }
        });
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  if (loading && tokenValid === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="در حال بررسی لینک..." />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <Layout className="layout">
        <Navbar />
        <Content>
          <Row justify="center" align="middle" style={{ height: '80vh' }}>
            <Col xs={22} sm={16} md={12} lg={8}>
              <Card bordered={false} className="auth-card">
                <Alert
                  message="خطا"
                  description={error || 'لینک بازیابی نامعتبر می‌باشد'}
                  type="error"
                  showIcon
                />
                <Button
                  type="primary"
                  block
                  style={{ marginTop: 16 }}
                  onClick={() => navigate('/forgot-password')}
                >
                  درخواست لینک جدید
                </Button>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="layout">
      <Navbar />
      <Content>
        <div className="auth-page">
          <Row justify="center" align="middle" className="auth-container">
            <Col xs={22} sm={16} md={12} lg={8}>
              <Card bordered={false} className="auth-card">
                <Title level={2} className="auth-title">تغییر رمز عبور</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                  لطفا رمز عبور جدید خود را وارد کنید
                </Text>

                {success ? (
                  <Alert
                    message="رمز عبور با موفقیت تغییر کرد"
                    description="در حال انتقال به صفحه ورود..."
                    type="success"
                    showIcon
                  />
                ) : (
                  <>
                    {error && (
                      <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                        closable
                        onClose={() => setError(null)}
                      />
                    )}

                    <Form
                      name="reset_password"
                      onFinish={onFinish}
                      layout="vertical"
                      disabled={loading}
                    >
                      <Form.Item
                        name="password"
                        rules={[
                          {
                            required: true,
                            message: 'لطفا رمز عبور جدید را وارد کنید'
                          },
                          {
                            min: 8,
                            message: 'رمز عبور باید حداقل ۸ کاراکتر باشد'
                          },
                          {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                            message: 'رمز عبور باید شامل حروف بزرگ، کوچک، عدد و کاراکتر ویژه باشد'
                          }
                        ]}
                        hasFeedback
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="رمز عبور جدید"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                          {
                            required: true,
                            message: 'لطفا رمز عبور را تأیید کنید'
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('رمزهای عبور مطابقت ندارند'));
                            },
                          }),
                        ]}
                        hasFeedback
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="تکرار رمز عبور جدید"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          size="large"
                          style={{ marginTop: 8 }}
                        >
                          {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                        </Button>
                      </Form.Item>
                    </Form>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default ResetPassword;