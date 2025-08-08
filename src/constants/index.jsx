import React from 'react';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export const STATUS_CONFIG = {
  pending: { 
    color: "gold", 
    icon: <ClockCircleOutlined />, 
    text: "در انتظار تایید" 
  },
  confirmed: { 
    color: "green", 
    icon: <CheckCircleOutlined />, 
    text: "تایید شده" 
  },
  cancelled: { 
    color: "red", 
    icon: <CloseCircleOutlined />, 
    text: "لغو شده" 
  },
  cancelled_refund_pending: { 
    color: "orange", 
    icon: <ClockCircleOutlined />, 
    text: "در انتظار بازپرداخت" 
  },
  refund_processed: { 
    color: "purple", 
    icon: <CheckCircleOutlined />, 
    text: "بازپرداخت شده" 
  },
  expired: {
    text: 'منقضی شده',
    color: 'default',
    icon: <ClockCircleOutlined />
  },
  default: {
    color: "gold", 
    icon: <ClockCircleOutlined />, 
    text: "در انتظار تایید" 
  }
  
};