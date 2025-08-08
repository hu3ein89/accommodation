import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Layout, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { createUser } from '../../api/jsonServer';
import { hashPassword, validatePasswordStrength } from '../../utils/authHelper';
import Navbar from '../Layout/Navbar';
import '../../styles/Auth.css';
import {useNotification} from '../../context/NotificationContext';

const { Content } = Layout;
const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const notification = useNotification()

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const passwordValidation = validatePasswordStrength(values.password);
      if (!passwordValidation.isValid) {
        setPasswordError('رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک، عدد و کاراکتر ویژه باشد');
        return;
      }

      const { confirmPassword, ...userData } = values;

      const newUser = {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        status: 'active'
      };

      const createdUser = await createUser(newUser);
      queryClient.invalidateQueries({ queryKey: ["users"] });

      notification.success({
        message: 'ثبت نام موفق',
        description: 'حساب کاربری شما با موفقیت ایجاد شد.',
      });

      login(createdUser);
      //Navigate to the appropriate dashboard
      navigate(createdUser.role === 'Hotel Manager' ? '/admin-dashboard' : '/user-dashboard');

    } catch (error) {
      notification.error({
        message: 'خطا در ثبت نام',
        description: error.message || 'مشکلی در ثبت نام پیش آمده است.',
      });
    } finally {
      setLoading(false);
    }
  };
  const validatePassword = (_, value) => {
    const validation = validatePasswordStrength(value);
    if (validation.isValid) {
      setPasswordError(null);
      return Promise.resolve();
    }
    return Promise.reject(new Error('رمز عبور ضعیف است'));
  };
  return (
    <Layout className="layout">
      <Navbar />
      <Content>
        <div className="auth-page">
          <Row justify="center" align="middle" className="auth-container">
            <Col xs={22} sm={16} md={12} lg={8}>
              <Card bordered={false} className="auth-card">
                <h1 className="auth-title">ثبت نام در هتل‌یار</h1>
                {passwordError && <Alert message={passwordError} type="error" showIcon style={{ marginBottom: 24 }} />}
                <Form
                  name="register"
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        rules={[{ required: true, message: 'لطفا نام خود را وارد کنید' }]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="نام"
                          className="auth-input"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        rules={[{ required: true, message: 'لطفا نام خانوادگی خود را وارد کنید' }]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="نام خانوادگی"
                          className="auth-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'لطفا ایمیل خود را وارد کنید' },
                      { type: 'email', message: 'ایمیل معتبر نیست' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="ایمیل"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'لطفا رمز عبور را تأیید کنید' },
                      { validator: validatePassword }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="رمز عبور"
                      className="auth-input"
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'لطفا رمز عبور را تأیید کنید' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('رمزهای عبور مطابقت ندارند'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="تأیید رمز عبور"
                      className="auth-input"
                    />
                  </Form.Item>
                  <Form.Item
                    name="phoneNumber"
                    rules={[{ required: true, message: 'لطفا شماره تماس خود را وارد کنید' }]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="شماره تماس"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    initialValue="Guest"
                  >
                    <Select className="auth-select">
                      <Option value="Guest">مهمان</Option>
                      <Option value="Hotel Manager">مدیر هتل</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item className="auth-submit">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      className="auth-button"
                    >
                      ثبت نام
                    </Button>
                  </Form.Item>

                  <div className="auth-links">
                    <Button type="link" onClick={() => navigate('/login')}>
                      قبلا ثبت نام کرده‌اید؟ وارد شوید
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default Register;