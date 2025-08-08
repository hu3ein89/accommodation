import React from 'react';
import { Form, Input, Button, Card, Row, Col, Layout, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { validateEmail } from '../../utils/Validation';
import { useLogin } from '../../hooks/useLogin';
import Navbar from '../Layout/Navbar';
import '../../styles/Auth.css';

const { Content } = Layout;

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, isLoading } = useLogin();

  const onFinish = async (values) => {
    await handleLogin(values);
  };

  return (
    <Layout className='layout'>
      <Navbar/>
      <Content>
        <Row justify="center" className="auth-container">
          <Col xs={22} sm={16} md={12} lg={8}>
            <Card className="auth-center">
              <div className="auth-title">ورود به سیستم</div>
              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
                validateTrigger="onBlur"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'لطفا ایمیل خود را وارد کنید' },
                    { validator: validateEmail }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="ایمیل"
                    className="auth-input"
                    autoComplete='email'
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'لطفا رمز عبور را وارد کنید' },
                    { min: 8, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="رمز عبور"
                    className="auth-input"
                    autoComplete='current-password'
                  />
                </Form.Item>

                <Form.Item>
                  <Checkbox name="remember">مرا به خاطر بسپار</Checkbox>
                </Form.Item>

                <Form.Item className="auth-submit">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    className="auth-button"
                  >
                    ورود به حساب کاربری
                  </Button>
                </Form.Item>
                <div className="auth-links">
                  <Button type="link" onClick={() => navigate('/register')}>
                    حساب کاربری ندارید؟ ثبت نام کنید
                  </Button>
                  <Button type="link" onClick={() => navigate('/forgot-password')} style={{ marginTop: '5px' }}>
                    رمز عبور را فراموش کرده اید؟
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Login;