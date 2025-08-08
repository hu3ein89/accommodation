import React from 'react';
import { Layout, Row, Col, Typography, Card, Avatar, Statistic } from 'antd';
import { TeamOutlined, HomeOutlined, SmileOutlined, UserOutlined, StarFilled, CalendarFilled } from '@ant-design/icons';
import styled from 'styled-components';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import img from '../assets/images/aboutus.png'

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const PageHeader = styled.div`
  height: 50vh;
  min-height: 400px;
  background-image: linear-gradient(135deg, rgba(0, 80, 150, 0.85), rgba(0, 120, 200, 0.85)), url('https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: 0;
    right: 0;
    height: 100px;
    background: white;
    transform: skewY(-3deg);
    z-index: 1;
  }
`;

const Section = styled.div`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled(Title)`
  text-align: center;
  margin-bottom: 48px !important;
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
`;

const TeamCard = styled(Card)`
  text-align: center;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .ant-card-body {
    padding: 32px 24px;
  }
`;

const StatisticCard = styled(Card)`
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .ant-statistic-title {
    font-size: 16px;
    color: #666;
    font-family: 'Vazir';
  }

  .ant-statistic-content {
    font-size: 36px;
    color: #1890ff;
    font-family: 'Vazir';
  }
`;

const AboutUsPage = () => {
  const teamMembers = [
    { 
      name: 'محمد محمدی', 
      role: 'مدیرعامل و موسس', 
      bio: 'بیش از ۱۵ سال تجربه در صنعت هتلداری و مدیریت اقامتگاه‌های لوکس',
      avatar: '/path/to/avatar1.jpg' 
    },
    { 
      name: 'رضا رضایی', 
      role: 'مدیر فنی', 
      bio: 'متخصص در توسعه پلتفرم‌های رزرو آنلاین با ۱۰ سال سابقه کاری',
      avatar: '/path/to/avatar2.jpg' 
    },
    { 
      name: 'سارا کریمی', 
      role: 'مدیر بازاریابی', 
      bio: 'کارشناس ارشد بازاریابی دیجیتال با تخصص در صنعت گردشگری',
      avatar: '/path/to/avatar3.jpg' 
    },
  ];

  return (
    <Layout>
      <Navbar />
      <Content style={{ backgroundColor: 'white'}}>
        <PageHeader >
          <div>
            <Title style={{ color: 'white', fontWeight: 'bold', fontSize: '3.5rem', marginBottom: '16px',fontFamily:'Vazir' }}>داستان هتل‌یار</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto',fontFamily:'Vazir'  }}>
              ما با اشتیاق و تعهد، بهترین تجربه اقامتی را برای شما خلق می‌کنیم
            </Paragraph>
          </div>
        </PageHeader>

        <Section>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: '24px',fontFamily:'Vazir'  }}>ماموریت ما</Title>
              <Paragraph style={{ fontSize: '16px', lineHeight: '2.2', color: '#555',textAlign:'justify', fontFamily: 'Vazir'}}>
                ماموریت ما در هتل‌یار، ایجاد تجربه‌ای بی‌نظیر و خاطره‌انگیز از سفر برای شماست. ما معتقدیم که هر سفر فرصتی برای کشف شگفتی‌های جدید است و یک اقامتگاه مناسب، بخش جدایی‌ناپذیر این تجربه است. ما با فراهم آوردن بستری امن و راحت، بهترین اقامتگاه‌ها را در شمال ایران به شما معرفی می‌کنیم تا با خیالی آسوده، از سفر خود لذت ببرید.
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <img 
                src={img}
                alt="Our Mission" 
                style={{ 
                  width: '100%', 
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease',
                  ':hover': {
                    transform: 'scale(1.02)'
                  }
                }} 
              />
            </Col>
          </Row>
        </Section>

        <Section style={{ background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
          <SectionTitle level={2} style={{fontFamily:'Vazir' }}>تیم ما</SectionTitle>
          <Row gutter={[24, 24]} justify="center">
            {teamMembers.map(member => (
              <Col xs={24} sm={12} md={8} key={member.name}>
                <TeamCard>
                  <Avatar 
                    size={120} 
                    src={member.avatar} 
                    icon={<UserOutlined />}
                    style={{ 
                      backgroundColor: '#1890ff',
                      fontSize: '48px',
                      margin: '0 auto'
                    }} 
                  />
                  <Title level={4} style={{ marginTop: '24px', marginBottom: '8px', color: '#333', fontFamily: 'Vazir' }}>{member.name}</Title>
                  <Paragraph type="secondary" style={{ fontSize: '16px', fontFamily: 'Vazir' }}>{member.role}</Paragraph>
                  <Paragraph style={{ marginTop: '16px', color: '#666', fontFamily: 'Vazir' }}>{member.bio}</Paragraph>
                </TeamCard>
              </Col>
            ))}
          </Row>
        </Section>
        
        <Section>
          <SectionTitle style={{fontFamily:'Vazir' }} level={2}>هتل‌یار در یک نگاه</SectionTitle>
          <Row gutter={[24, 24]} style={{textAlign:'center'}}>
            <Col xs={24} sm={12} md={6}>
              <StatisticCard>
                <Statistic
                  title="اقامتگاه‌های منتخب" 
                  value={120} 
                  prefix={<HomeOutlined style={{ color: '#1890ff', fontSize: '32px' }} />} 
                />
                <Paragraph style={{ marginTop: '8px', color: '#666', fontFamily: 'Vazir' }}>در ۳۰ شهر شمال</Paragraph>
              </StatisticCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatisticCard>
                <Statistic 
                  title="سال فعالیت" 
                  value={8} 
                  prefix={<CalendarFilled style={{ color: '#fa8c16', fontSize: '32px' }} />} 
                />
                <Paragraph style={{ marginTop: '8px', color: '#666', fontFamily: 'Vazir' }}>از ۱۳۹۵ تاکنون</Paragraph>
              </StatisticCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatisticCard>
                <Statistic 
                  title="رضایت مشتریان" 
                  value={4.8} 
                  precision={1}
                  suffix={<StarFilled style={{ color: '#fadb14', fontSize: '20px' }} />} 
                  prefix={<SmileOutlined style={{ color: '#52c41a', fontSize: '32px' }} />} 
                />
                <Paragraph style={{ marginTop: '8px', color: '#666', fontFamily: 'Vazir' }}>از ۵ امتیاز</Paragraph>
              </StatisticCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatisticCard>
                <Statistic 
                  title="اعضای تیم" 
                  value={12} 
                  prefix={<TeamOutlined style={{ color: '#722ed1', fontSize: '32px' }} />} 
                />
                <Paragraph style={{ marginTop: '8px', color: '#666', fontFamily: 'Vazir' }}>متخصص و دلسوز</Paragraph>
              </StatisticCard>
            </Col>
          </Row>
        </Section>

        <Section style={{ backgroundColor: '#f0f9ff', borderRadius: '16px' }}>
          <SectionTitle style={{fontFamily:'Vazir' }} level={2}>چرا هتل‌یار را انتخاب کنید؟</SectionTitle>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: '12px', height: '100%' }}>
                <Title level={4} style={{ color: '#1890ff', fontFamily: 'Vazir' }}>تضمین بهترین قیمت</Title>
                <Paragraph style={{ fontFamily: 'Vazir', textAlign: 'justify' }}>
                  ما با اقامتگاه‌ها مستقیماً همکاری می‌کنیم تا بهترین قیمت‌ها را به شما ارائه دهیم. اگر قیمت کمتری برای اقامتگاه مورد نظر خود در جای دیگر پیدا کنید، ما تفاوت قیمت را به شما بازمی‌گردانیم.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: '12px', height: '100%' }}>
                <Title level={4} style={{ color: '#1890ff', fontFamily: 'Vazir' }}>پشتیبانی ۲۴ ساعته</Title>
                <Paragraph style={{ fontFamily: 'Vazir', textAlign: 'justify' }}>
                  تیم پشتیبانی ما در تمام ساعات شبانه‌روز آماده پاسخگویی به سوالات و حل مشکلات شماست. چه در سفر باشید و چه در مرحله برنامه‌ریزی، همیشه کنار شما هستیم.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Section>
      </Content>
      <Footer />
    </Layout>
  );
};

export default AboutUsPage;