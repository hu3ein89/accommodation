import React from 'react';
import { Typography, Select, Grid } from 'antd';
import slider from '../../assets/images/slider.jpg';
import SearchCapsule from './SearchCapsule';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid; 

const HeroSection = () => {
  const screens = useBreakpoint();

  return (
    <div className='hero-section' style={{
      minHeight: '400px', 
      height: 'auto',
      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slider})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      color: '#000',
      marginTop: '64px',
      padding: '40px 20px', 
      position: 'relative',
      fontSize:'small'
    }}>
      <div className="hero-content-wrapper"> 
        {/* Text Content */}
        <div style={{ marginBottom: '40px' }}>
          <Title style={{ 
            color: 'white', 
            fontSize: screens.md ? '48px' : '32px', 
            marginBottom: '24px',
            fontFamily: 'vazir', 
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            اجاره ویلا، سوئیت و اقامتگاه در شمال ایران
          </Title>
          <Text style={{ 
            color: 'white', 
            fontSize: screens.md ? '20px' : '16px',
            marginBottom: '32px',
            fontFamily: 'vazir',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}>
            سفر از تو، جاباما
          </Text>
        </div>
      </div>
      <SearchCapsule />
    </div>
  );
};

export default HeroSection;