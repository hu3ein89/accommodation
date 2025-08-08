// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import fa_IR from 'antd/locale/fa_IR';
import { AuthProvider } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext';
import App from './App';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import 'dayjs/locale/fa';
import './styles/font.css'

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

dayjs.extend(jalaliday);
dayjs.calendar('jalali'); 
dayjs.locale('fa'); 

// react-query settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      retry: 1, 
      staleTime: 5 * 60 * 1000, 

      onError: (error) => {
        if (error.response?.status !== 500) {
          notification.error({
            message: 'خطا در دریافت داده‌ها',
            description: 'خطایی در ارتباط با سرور رخ داده است',
            duration: 5 
          });
        }
      },

      cacheTime: 10 * 60 * 1000, // 10 minutes cache retention
      refetchOnReconnect: true, //  for mobile users
      refetchOnMount: true // Ensures fresh data on component mount
    },
    mutations: {
      onError: (error) => {
        notification.error({
          message: 'خطا در عملیات',
          description: error.message || 'خطایی رخ داده است',
          duration: 5
        });
      }
    }
  }
});

// antd settings
const antdConfig = {
  direction: 'rtl',
  locale: fa_IR,
  theme: {
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontSize: 14,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ReservationProvider>
          <AuthProvider>
            <ConfigProvider {...antdConfig}>
              <AntApp>
                <App />
              </AntApp>
            </ConfigProvider>
          </AuthProvider>
        </ReservationProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);