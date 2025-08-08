import React from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Card
} from 'antd';
import { 
  EnvironmentFilled, 
  PhoneFilled, 
  MailFilled, 
  ClockCircleFilled,
  WhatsAppOutlined,
  MessageFilled,
  SendOutlined,
  FacebookFilled,
  InstagramFilled,
  TwitterCircleFilled,
  LinkedinFilled
} from '@ant-design/icons';
import styled from 'styled-components';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useNotification } from '../context/NotificationContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendPrivateMessage } from '../api/jsonServer';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

// Styled Components
const ContactWrapper = styled.div`
  max-width: 1200px;
  margin: 80px auto 0;
  padding: 0 24px;
`;

const ContactHeader = styled.div`
  text-align: center;
  margin-bottom: 64px;
  
  h2 {
    font-size: 2.5rem;
    color: #1890ff;
    margin-bottom: 16px;
    position: relative;
    
    &::after {
      content: '';
      display: block;
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #1890ff, #52c41a);
      margin: 16px auto 0;
      border-radius: 2px;
    }
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    max-width: 700px;
    margin: 0 auto;
  }
`;

const FormCard = styled(Card)`
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
  
  .ant-card-head {
    border-bottom: none;
    padding: 24px;
    
    .ant-card-head-title {
      font-size: 1.5rem;
      color: #1890ff;
      padding: 0;
    }
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const ContactInfoSection = styled.div`
  padding: 40px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: url('https://img.icons8.com/ios-filled/100/0077b5/water-wave.png') no-repeat;
    background-size: contain;
    opacity: 0.1;
  }
`;

const ContactCard = styled(Card)`
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(24, 144, 255, 0.15);
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const ContactIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  
  svg {
    font-size: 24px;
    color: white;
  }
`;

const ContactMethod = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  svg {
    font-size: 18px;
    color: #1890ff;
    margin-left: 10px;
  }
  
  a {
    color: #333;
    transition: color 0.3s;
    
    &:hover {
      color: #1890ff;
      text-decoration: underline;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  a {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(24, 144, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    
    &:hover {
      background: #1890ff;
      transform: translateY(-3px);
      
      svg {
        color: white;
      }
    }
    
    svg {
      color: #1890ff;
      font-size: 18px;
    }
  }
`;

const SubmitButton = styled(Button)`
  height: 48px;
  font-size: 16px;
  padding: 0 32px;
  border-radius: 8px;
  background: linear-gradient(90deg, #1890ff, #096dd9);
  border: none;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }
`;

const ContactUsPage = () => {
  const [form] = Form.useForm();
  const notification = useNotification();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: sendPrivateMessage,
    onSuccess: () => {
      notification.success({ 
        message: 'پیام شما با موفقیت ارسال شد', 
        description: 'به زودی با شما تماس خواهیم گرفت.' 
      });
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['privateMessages'] });
    },
    onError: (error) => {
      notification.error({ 
        message: 'خطا در ارسال پیام', 
        description: error.message 
      });
    }
  });

  const onFinish = (values) => {
    mutation.mutate({
      subject: values.subject,
      message: values.message,
      sender: { id: user?.id || 'guest', name: values.name },
      email: values.email,
      phone: values.phone 
    });
  };

  return (
    <Layout style={{ backgroundColor: '#f9fafb' }}>
      <Navbar />
      <Content style={{ marginTop: '80px' }}>
        <ContactWrapper style={{ fontFamily: 'Vazir' }}>
          <ContactHeader>
            <Title level={2} style={{ fontFamily: 'Vazir' }}>تماس با ما</Title>
            <Paragraph style={{ fontFamily: 'Vazir' }}>
              ما همیشه برای کمک به شما آماده‌ایم. سوالات و پیشنهادات خود را با ما در میان بگذارید.
              تیم پشتیبانی ما در کمترین زمان ممکن پاسخگوی شما خواهد بود.
            </Paragraph>
          </ContactHeader>

          {/* Contact Info Section */}
          <ContactInfoSection>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', fontFamily: 'Vazir' }}>
                راه‌های ارتباط با هتل‌یار
              </Title>
              
              <Row gutter={[24, 24]}>
                {/* Address Card */}
                <Col xs={24} md={12} lg={6}>
                  <ContactCard>
                    <ContactIcon>
                      <EnvironmentFilled />
                    </ContactIcon>
                    <Title level={4} style={{ marginBottom: '16px', fontFamily: 'Vazir' }}>آدرس ما</Title>
                    
                    <Paragraph style={{ color: '#666', marginBottom: '24px', fontFamily: 'Vazir' }}>
                      دفتر مرکزی هتل‌یار در تهران واقع شده و در سراسر ایران خدمات ارائه می‌دهد.
                    </Paragraph>
                    
                    <ContactMethod>
                      <EnvironmentFilled />
                      <Text strong style={{ fontFamily: 'Vazir' }}>تهران، خیابان ولیعصر، پلاک ۱۲۳۴، طبقه ۵</Text>
                    </ContactMethod>
                    
                    <Button 
                      type="primary" 
                      ghost 
                      size="small" 
                      style={{ marginTop: '16px', fontFamily: 'Vazir' }}
                      onClick={() => window.open('https://maps.google.com?q=تهران، خیابان ولیعصر، پلاک ۱۲۳۴')}
                    >
                      مشاهده روی نقشه
                    </Button>
                  </ContactCard>
                </Col>
                
                {/* Phone Card */}
                <Col xs={24} md={12} lg={6}>
                  <ContactCard>
                    <ContactIcon>
                      <PhoneFilled />
                    </ContactIcon>
                    <Title level={4} style={{ marginBottom: '16px', fontFamily: 'Vazir' }}>تماس تلفنی</Title>
                    
                    <Paragraph style={{ color: '#666', marginBottom: '24px', fontFamily: 'Vazir' }}>
                      برای مشاوره رزرو و پشتیبانی می‌توانید با شماره‌های زیر تماس بگیرید.
                    </Paragraph>
                    
                    <ContactMethod>
                      <PhoneFilled />
                      <a href="tel:+982112345678" dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</a>
                    </ContactMethod>
                    
                    <ContactMethod>
                      <WhatsAppOutlined />
                      <a href="https://wa.me/989121234567" dir="ltr">۰۹۱۲-۱۲۳۴۵۶۷</a>
                    </ContactMethod>
                    
                    <Button 
                      type="primary" 
                      ghost 
                      size="small" 
                      style={{ marginTop: '16px', fontFamily: 'Vazir' }}
                      onClick={() => window.open('tel:+982112345678')}
                    >
                      تماس سریع
                    </Button>
                  </ContactCard>
                </Col>
                
                {/* Email Card */}
                <Col xs={24} md={12} lg={6}>
                  <ContactCard>
                    <ContactIcon>
                      <MailFilled />
                    </ContactIcon>
                    <Title level={4} style={{ marginBottom: '16px', fontFamily: 'Vazir' }}>راه‌های الکترونیکی</Title>
                    
                    <Paragraph style={{ color: '#666', marginBottom: '24px', fontFamily: 'Vazir' }}>
                      برای ارتباط از طریق ایمیل یا پیام‌رسان‌ها می‌توانید از اطلاعات زیر استفاده کنید.
                    </Paragraph>
                    
                    <ContactMethod>
                      <MailFilled />
                      <a href="mailto:info@hotelyar.com">info@hotelyar.com</a>
                    </ContactMethod>
                    
                    <ContactMethod>
                      <MessageFilled />
                      <a href="mailto:support@hotelyar.com">support@hotelyar.com</a>
                    </ContactMethod>
                    
                    <SocialLinks>
                      <a href="#"><FacebookFilled /></a>
                      <a href="#"><InstagramFilled /></a>
                      <a href="#"><TwitterCircleFilled /></a>
                      <a href="#"><LinkedinFilled /></a>
                    </SocialLinks>
                  </ContactCard>
                </Col>
                
                {/* Hours Card */}
                <Col xs={24} md={12} lg={6}>
                  <ContactCard>
                    <ContactIcon>
                      <ClockCircleFilled />
                    </ContactIcon>
                    <Title level={4} style={{ marginBottom: '16px', fontFamily: 'Vazir' }}>ساعات کاری</Title>
                    
                    <Paragraph style={{ color: '#666', marginBottom: '24px', fontFamily: 'Vazir' }}>
                      تیم پشتیبانی ما در تمام روزهای هفته آماده پاسخگویی به شماست.
                    </Paragraph>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ fontFamily: 'Vazir' }}>شنبه تا چهارشنبه:</Text>
                      <Paragraph style={{ margin: '4px 0', fontFamily: 'Vazir' }}>۸:۳۰ صبح تا ۵ بعدازظهر</Paragraph>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ fontFamily: 'Vazir' }}>پنجشنبه:</Text>
                      <Paragraph style={{ margin: '4px 0', fontFamily: 'Vazir' }}>۸:۳۰ صبح تا ۱۲ ظهر</Paragraph>
                    </div>
                    
                    <div>
                      <Text strong style={{ fontFamily: 'Vazir' }}>پشتیبانی ۲۴/۷:</Text>
                      <Paragraph style={{ margin: '4px 0', fontFamily: 'Vazir' }}>رزرو اضطراری و پشتیبانی فنی</Paragraph>
                    </div>
                  </ContactCard>
                </Col>
              </Row>
            </div>
          </ContactInfoSection>

          {/* Contact Form Section */}
          <FormCard title="فرم تماس با ما" id="contact-form">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="name" 
                    label={<span style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'Vazir' }}>نام شما</span>}
                    rules={[{ required: true, message: 'لطفا نام خود را وارد کنید' }]}
                  >
                    <Input size="large" placeholder="نام و نام خانوادگی" style={{ fontFamily: 'Vazir' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="email" 
                    label={<span style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'Vazir' }}>ایمیل شما</span>}
                    rules={[
                      { required: true, message: 'لطفا ایمیل معتبر وارد کنید' },
                      { type: 'email', message: 'لطفا ایمیل معتبر وارد کنید' }
                    ]}
                  >
                    <Input size="large" placeholder="example@email.com" style={{ fontFamily: 'Vazir' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="phone"
                label={<span style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'Vazir' }}>شماره تماس</span>}
                rules={[{ required: true, message: 'لطفا شماره تماس خود را وارد کنید' }]}
              >
                <Input
                  size="large"
                  prefix={<PhoneFilled />}
                  placeholder="شماره تماس"
                  style={{ fontFamily: 'Vazir' }}
                />
              </Form.Item>
              
              <Form.Item 
                name="subject" 
                label={<span style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'Vazir' }}>موضوع</span>}
                rules={[{ required: true, message: 'لطفا موضوع پیام را وارد کنید' }]}
              >
                <Input size="large" placeholder="موضوع پیام شما" style={{ fontFamily: 'Vazir' }} />
              </Form.Item>
              
              <Form.Item 
                name="message" 
                label={<span style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'Vazir' }}>متن پیام</span>}
                rules={[{ required: true, message: 'لطفا متن پیام خود را وارد کنید' }]}
              >
                <Input.TextArea 
                  rows={6} 
                  size="large" 
                  placeholder="پیام خود را با جزئیات بنویسید..." 
                  style={{ resize: 'none', fontFamily: 'Vazir' }}
                />
              </Form.Item>
              
              <Form.Item>
                <SubmitButton 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  loading={mutation.isPending}
                  icon={<SendOutlined />}
                  style={{ fontFamily: 'Vazir' }}
                >
                  ارسال پیام
                </SubmitButton>
              </Form.Item>
            </Form>
          </FormCard>
        </ContactWrapper>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ContactUsPage;