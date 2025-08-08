import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Modal,
  Typography,
  Badge,
  Empty,
  Card,
  Divider,
  Avatar,
  Tag,
  Space,
  Popconfirm,
  message as antdMessage,
  List,
  Row
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  MailOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';

import { fetchPrivateMessages, updatePrivateMessageStatus, deletePrivateMessage } from '../../api/jsonServer';
import { useNotification } from '../../context/NotificationContext';

const { Title, Text, Paragraph } = Typography;

const MessageContainer = styled.div`
  .message-item {
    transition: all 0.3s ease;
    border-radius: 8px;
    margin-bottom: 8px;
    padding: 12px 16px;
    border-left: 3px solid transparent;
    cursor: pointer;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    &.unread {
      border-left-color: #1890ff;
      background-color: #f6fbff;
      
      .message-sender, .message-subject {
        font-weight: 600;
      }
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .message-preview {
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .message-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }

    .message-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  @media (max-width: 768px) {
    .message-item {
      padding: 12px;
    }
  }
`;

const ManageMessages = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const queryClient = useQueryClient();
  const notification = useNotification();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['privateMessages'],
    queryFn: fetchPrivateMessages,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updatePrivateMessageStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateMessages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePrivateMessage,
    onSuccess: () => {
      notification.success({ message: 'پیام با موفقیت حذف شد' });
      queryClient.invalidateQueries({ queryKey: ['privateMessages'] });
      antdMessage.success('پیام حذف شد');
    },
    onError: (error) => {
      notification.error({ message: 'خطا در حذف پیام', description: error.message });
    }
  });

  const showMessageModal = (message) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    if (message.status === 'unread') {
      updateStatusMutation.mutate({ messageId: message.id, status: 'read' });
    }
  };

  const handleDelete = (messageId, e) => {
    e?.stopPropagation();
    deleteMutation.mutate(messageId);
  };
  console.log("All messages data:", messages);
  return (
    <MessageContainer>
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>صندوق پیام‌ها</Title>
            <Badge
              count={messages.filter(m => m.status === 'unread').length}
              style={{ backgroundColor: '#1890ff' }}
            />
          </Space>
        }
        loading={isLoading}
        headStyle={{ borderBottom: 'none', padding: '0 24px' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        {messages.length === 0 ? (
          <Empty
            description="پیامی یافت نشد"
            imageStyle={{ height: 80 }}
            style={{ padding: '40px 0' }}
          />
        ) : (
          <List
            dataSource={messages}
            renderItem={(message) => (
              <div
                key={message.id}
                className={`message-item ${message.status === 'unread' ? 'unread' : ''}`}
                onClick={() => showMessageModal(message)}
              >
                <div className="message-header">
                  <Space>
                    <Avatar
                      size="default"
                      icon={<UserOutlined />}
                      src={message.senderInfo?.avatar}
                      style={{ backgroundColor: '#7265e6' }}
                    />
                    <div>
                      <Text className="message-sender">{message.senderInfo.name}</Text>
                    </div>
                  </Space>
                  <Space>
                    {message.status === 'unread' && (
                      <Tag color="blue" icon={<CheckOutlined />}>جدید</Tag>
                    )}
                  </Space>
                </div>

                <div>
                  <Text strong className="message-subject">{message.subject}</Text>
                  <Paragraph className="message-preview">
                    {message.content.substring(0, 50)}...
                  </Paragraph>
                </div>

                <div className="message-footer">
                  <Tag icon={<ClockCircleOutlined />} color="default">
                    {dayjs(message.createdAt).format('YYYY/MM/DD HH:mm')}
                  </Tag>
                  <div className="message-actions">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        showMessageModal(message);
                      }}
                    >
                      مشاهده
                    </Button>
                    <Popconfirm
                      title="آیا از حذف این پیام مطمئن هستید؟"
                      onConfirm={(e) => handleDelete(message.id, e)}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="بله"
                      cancelText="خیر"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={(e) => e.stopPropagation()}
                      >
                        حذف
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </Card>

      <Modal
        title={
          <Space>
            <Text strong>{selectedMessage?.subject}</Text>
            {selectedMessage?.status === 'unread' && (
              <Tag color="blue" icon={<CheckOutlined />}>جدید</Tag>
            )}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: '700px', top: 20 }}
        bodyStyle={{ padding: '24px' }}
      >

        {selectedMessage && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Avatar
                size={48}
                icon={<UserOutlined />}
                src={selectedMessage.senderInfo?.avatar}
                style={{ backgroundColor: '#7265e6', marginLeft: 12 }}
              />
              <div>
                <Text strong style={{ fontSize: '1.1em' }}>{selectedMessage.senderInfo.name}</Text>
                <Row>
                  <a href={`mailto:${selectedMessage.senderInfo.email}`}>
                    <MailOutlined style={{ marginRight: 4 }} />
                    {selectedMessage.senderInfo.email}
                  </a>
                </Row>
                <Row>
                  {selectedMessage.senderInfo.phone && (
                    <a
                      href={`tel:${selectedMessage.senderInfo.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#1890ff',
                        textDecoration: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.3s',
                        ':hover': {
                          backgroundColor: '#f0f0f0',
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <PhoneOutlined/>
                      <Text style={{ color: 'inherit' }}>{selectedMessage.senderInfo.phone}</Text>
                    </a>
                  )}
                </Row>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <Paragraph style={{
                whiteSpace: 'pre-wrap',
                marginBottom: 0,
                fontSize: '1.05em',
                lineHeight: 1.6
              }}>
                {selectedMessage.content}
              </Paragraph>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Tag icon={<ClockCircleOutlined />}>
                {dayjs(selectedMessage.createdAt).format('YYYY/MM/DD HH:mm')}
              </Tag>

              <Button type="primary" onClick={() => setIsModalVisible(false)}>
                بستن
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MessageContainer >
  );
};

export default ManageMessages;