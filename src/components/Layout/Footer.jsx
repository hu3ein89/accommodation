import React from 'react';
import { Layout, Row, Col, Typography, Divider, Input, Button } from 'antd';
import {
  PhoneFilled,
  MailFilled,
  EnvironmentFilled,
  FacebookFilled,
  TwitterCircleFilled,
  InstagramFilled,
  LinkedinFilled,
  YoutubeFilled
} from '@ant-design/icons';
import '../../styles/Footer.css';
import logo from '../../assets/logo.png';
import '../../styles/font.css';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Footer = () => {
  return (
    <AntFooter style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '40px 20px 20px',
      color: 'white',
      direction: 'rtl',
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Logo Section with Tagline */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <img
            src={logo}
            alt="هتل یار"
            style={{
              maxWidth: '200px',
              width: '100%',
              height: 'auto',
              filter: 'brightness(0) invert(1)',
              marginBottom: '15px'
            }}
          />
          <Text style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '16px',
            fontFamily: 'Vazir',
            display: 'block',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            ارائه کننده بهترین تجربه‌های اقامتی در سراسر ایران
          </Text>
        </div>

        {/* Main Footer Content */}
        <Row 
          gutter={[
            { xs: 20, sm: 30, md: 40 },
            { xs: 30, sm: 30, md: 40 }
          ]}
          justify="space-between"
        >
          {/* About Us Column */}
          <Col xs={24} sm={12} md={6} style={{ padding: '0 15px' }}>
            <Title level={4} style={{
              color: 'white',
              marginBottom: '20px',
              position: 'relative',
              paddingBottom: '10px',
              fontWeight: '600',
              fontSize: '18px',
              fontFamily: 'Vazir'
            }}>
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '50px',
                height: '3px',
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                borderRadius: '3px'
              }}></span>
              درباره ما
            </Title>
            <Text style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '14px',
              lineHeight: '1.8',
              display: 'block',
              fontFamily: 'Vazir',
              marginBottom: '15px'
            }}>
              مجموعه ما با بیش از یک دهه تجربه در زمینه رزرو آنلاین اقامتگاه، بهترین خدمات را به شما ارائه می‌دهد.
            </Text>
          </Col>

          {/* Quick Links Column */}
          <Col xs={24} sm={12} md={6} style={{ padding: '0 15px' }}>
            <Title level={4} style={{
              color: 'white',
              marginBottom: '20px',
              position: 'relative',
              paddingBottom: '10px',
              fontWeight: '600',
              fontSize: '18px',
              fontFamily: 'Vazir'
            }}>
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '50px',
                height: '3px',
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                borderRadius: '3px'
              }}></span>
              دسترسی سریع
            </Title>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { name: 'صفحه اصلی', icon: '🏠' },
                { name: 'ویلاها', icon: '🏡' },
                { name: 'هتل‌ها', icon: '🏨' },
                { name: 'آپارتمان‌ها', icon: '🏢' },
                { name: 'تجربه‌های منحصر به فرد', icon: '✨' }
              ].map((item) => (
                <a 
                  key={item.name} 
                  href="#"
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Vazir',
                    padding: '6px 0',
                    ':hover': {
                      color: '#3b82f6',
                      transform: 'translateX(-5px)'
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </div>
          </Col>

          {/* Contact Us Column */}
          <Col xs={24} sm={12} md={6} style={{ padding: '0 15px' }}>
            <Title level={4} style={{
              color: 'white',
              marginBottom: '20px',
              position: 'relative',
              paddingBottom: '10px',
              fontWeight: '600',
              fontSize: '18px',
              fontFamily: 'Vazir'
            }}>
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '50px',
                height: '3px',
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                borderRadius: '3px'
              }}></span>
              ارتباط با ما
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '8px',
                transition: 'all 0.3s',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(-5px)'
                }
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '10px',
                  flexShrink: 0
                }}>
                  <PhoneFilled style={{ color: '#3b82f6', fontSize: '16px' }} />
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontFamily: 'Vazir' }}>
                  ۰۲۱-۱۲۳۴۵۶۷۸
                </Text>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '8px',
                transition: 'all 0.3s',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(-5px)'
                }
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '10px',
                  flexShrink: 0
                }}>
                  <MailFilled style={{ color: '#3b82f6', fontSize: '16px' }} />
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontFamily: 'Vazir' }}>
                  info@hotelyar.com
                </Text>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '8px',
                transition: 'all 0.3s',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(-5px)'
                }
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '10px',
                  flexShrink: 0
                }}>
                  <EnvironmentFilled style={{ color: '#3b82f6', fontSize: '16px' }} />
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontFamily: 'Vazir' }}>
                  تهران، خیابان ولیعصر، پلاک ۱۲۳
                </Text>
              </div>
            </div>
          </Col>

          {/* Newsletter Column */}
          <Col xs={24} sm={12} md={6} style={{ padding: '0 15px' }}>
            <Title level={4} style={{
              color: 'white',
              marginBottom: '20px',
              position: 'relative',
              paddingBottom: '10px',
              fontWeight: '600',
              fontSize: '18px',
              fontFamily: 'Vazir'
            }}>
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '50px',
                height: '3px',
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                borderRadius: '3px'
              }}></span>
              خبرنامه
            </Title>
            <Text style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '14px',
              marginBottom: '15px',
              display: 'block',
              fontFamily: 'Vazir',
              lineHeight: '1.6'
            }}>
              برای دریافت آخرین تخفیف‌ها و پیشنهادهای ویژه ایمیل خود را وارد کنید
            </Text>
            <Search
              placeholder="آدرس ایمیل"
              enterButton={
                <span style={{ fontFamily: 'Vazir' }}>عضویت</span>
              }
              size="large"
              style={{ 
                marginBottom: '25px',
                direction: 'ltr'
              }}
              onSearch={value => console.log(value)}
            />
            
            <Text style={{
              color: 'white',
              fontSize: '16px',
              marginBottom: '15px',
              display: 'block',
              fontFamily: 'Vazir'
            }}>
              ما را دنبال کنید
            </Text>
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {[
                { icon: <FacebookFilled />, color: '#3b5998', name: 'فیس بوک' },
                { icon: <TwitterCircleFilled />, color: '#1da1f2', name: 'توییتر' },
                { icon: <InstagramFilled />, color: '#e1306c', name: 'اینستاگرام' },
                { icon: <LinkedinFilled />, color: '#0077b5', name: 'لینکدین' },
                { icon: <YoutubeFilled />, color: '#ff0000', name: 'یوتیوب' }
              ].map((item, index) => (
                <Button
                  key={index}
                  shape="circle"
                  icon={item.icon}
                  title={item.name}
                  style={{
                    backgroundColor: item.color,
                    color: 'white',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    ':hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 4px 8px ${item.color}40`
                    }
                  }}
                />
              ))}
            </div>
          </Col>
        </Row>

        <Divider style={{ 
          borderColor: 'rgba(255,255,255,0.1)', 
          margin: '40px 0 20px' 
        }} />

        {/* Copyright Section */}
            <Text style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              textAlign: 'center',
              display: 'block',
              fontFamily: 'Vazir'
            }}>
              © {new Date().getFullYear()}  هتل یار - تمامی حقوق محفوظ است | طراحی و توسعه با تیم طراحی 8968
            </Text>
      </div>
    </AntFooter>
  );
};

export default Footer;