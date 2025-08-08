import React, { useState, useCallback } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { Form, Input, Row, Col, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const FormWrapper = styled.div`
  margin-top: 24px;
`;

const generateMathCaptcha = () => {
  const operator = Math.random() > 0.5 ? '+' : '-';
  
  let num1, num2;
  
  if (operator === '-') {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * num1) + 1;
  } else {

    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
  }
  
  const solution = operator === '+' ? num1 + num2 : num1 - num2;
  
  const ltrExpression = `\u200E(${num1} ${operator} ${num2})\u200E`;
  
  return {
    text: ltrExpression,
    solution: solution.toString()
  };
};

const CustomPaymentForm = ({ onPaymentSubmit, isProcessing }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    focus: '',
  });

  const [captcha, setCaptcha] = useState(() => generateMathCaptcha());
  const [form] = Form.useForm();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      const cleanedValue = value.replace(/\D/g, '');
      setCardData(prev => ({ ...prev, [name]: cleanedValue }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInputFocus = (e) => {
    setCardData((prev) => ({ ...prev, focus: e.target.name }));
  };

  const validateCaptcha = (_, value) => {
    if (!value || value !== captcha.solution) {
      return Promise.reject(new Error('حاصل عبارت ریاضی نادرست است'));
    }
    return Promise.resolve();
  };

  const onFinish = (values) => {
    if (values.captcha !== captcha.solution) {
      message.error('حاصل عبارت ریاضی نادرست است');
      refreshCaptcha();
      return;
    }

    if (!values.secondPassword || values.secondPassword.length !== 6) {
      message.error('رمز دوم اینترنتی باید 6 رقمی باشد');
      return;
    }

    onPaymentSubmit(cardData);
  };

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateMathCaptcha());
    form.setFieldsValue({ captcha: '' });
  }, [form]);

  return (
    <div>
      <div style={{direction:'ltr'}}>
        <Cards
          number={cardData.number}
          expiry={cardData.expiry}
          cvc={cardData.cvc}
          name={cardData.name}
          focused={cardData.focus}
          placeholders={{ name: 'نام شما' }}
          locale={{ valid: 'معتبر تا' }}
        />
        <FormWrapper>
          <Form 
            layout="vertical" 
            onFinish={onFinish} 
            form={form}
            onFinishFailed={() => message.error('لطفا اطلاعات را به درستی وارد کنید')}
          >
            <Form.Item label="شماره کارت" required>
              <Input
                name="number"
                placeholder="**** **** **** ****"
                value={cardData.number}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                maxLength={16}
                style={{ direction: 'ltr', textAlign: 'left' }}
                required
              />
            </Form.Item>
            <Form.Item label="نام دارنده کارت" required>
              <Input
                name="name"
                placeholder="محمد محمدی"
                value={cardData.name}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                required
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="CVV" required>
                  <Input
                    name="cvc"
                    placeholder="123"
                    value={cardData.cvc}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    maxLength={4}
                    required
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="تاریخ انقضا" required>
                  <Input
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    maxLength={5}
                    required
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="captcha"
              label={
                <div style={{ display: 'flex', alignItems: 'center'}}>
                  <span>حاصل عبارت {captcha.text}</span>
                  <ReloadOutlined 
                    onClick={refreshCaptcha} 
                    style={{ marginRight: 8, cursor: 'pointer', paddingLeft: 8 }}
                  />
                </div>
              }
              rules={[
                { required: true, message: 'لطفا حاصل عبارت را وارد کنید' },
                { validator: validateCaptcha }
              ]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="secondPassword"
              label="رمز دوم اینترنتی"
              rules={[
                { required: true, message: 'لطفا رمز دوم را وارد کنید' },
                { len: 6, message: 'رمز دوم باید 6 رقمی باشد' },
                { pattern: /^\d+$/, message: 'رمز دوم باید عددی باشد' }
              ]}
            >
              <Input.Password maxLength={6} />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? 'در حال پردازش...' : 'پرداخت'}
              </Button>
            </Form.Item>
          </Form>
        </FormWrapper>
      </div>
    </div>
  );
};

export default CustomPaymentForm;