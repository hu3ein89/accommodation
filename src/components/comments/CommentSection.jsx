import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { List, Form, Input, Button, Skeleton, Typography, Avatar, Space, Divider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import 'dayjs/locale/fa';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { fetchCommentsForHotel, sendMessage } from '../../api/jsonServer';

dayjs.extend(relativeTime);
dayjs.locale('fa');

const { Text, Paragraph, Title, Link } = Typography;

const CommentSectionWrapper = styled.div`
  margin-top: 32px;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
`;

const CommentItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AdminReply = styled.div`
  background-color: #f6ffed;
  border-left: 3px solid #52c41a;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  position: relative;

  &:before {
    content: 'پاسخ مدیر';
    position: absolute;
    top: -10px;
    right: 16px;
    background: #52c41a;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
`;

const ReplyFormWrapper = styled.div`
  margin-top: 12px;
  margin-left: 44px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const CommentContent = styled.div`
  margin-left: 44px;
`;

const ReplyForm = ({ hotelId, parentId, onFinish }) => {
    const [form] = Form.useForm();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const postReplyMutation = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', hotelId] });
            form.resetFields();
            onFinish();
        }
    });

    const handleReplySubmit = (values) => {
        postReplyMutation.mutate({
            hotelId: hotelId,
            parentId: parentId,
            content: values.replyContent,
            sender: { id: 'admin', name: 'پشتیبانی هتل' }
        });
    };

    return (
        <Form form={form} onFinish={handleReplySubmit}>
            <Form.Item name="replyContent" rules={[{ required: true, message: 'لطفا پاسخ را وارد کنید' }]}>
                <Input.TextArea rows={2} placeholder="پاسخ خود را بنویسید..." />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" loading={postReplyMutation.isPending} type="primary" size="small">
                    ارسال پاسخ
                </Button>
                <Button type="text" size="small" onClick={onFinish} style={{ marginRight: 8 }}>
                    لغو
                </Button>
            </Form.Item>
        </Form>
    );
};

const CommentSection = ({ hotelId }) => {
    const [form] = Form.useForm();
    const { user, isAuthenticated } = useAuth();
    const notification = useNotification();
    const queryClient = useQueryClient();
    const [visibleComments, setVisibleComments] = useState(3);
    const [replyingTo, setReplyingTo] = useState(null);

    const { data: rawComments = [], isLoading: isLoadingComments } = useQuery({
        queryKey: ['comments', hotelId],
        queryFn: () => fetchCommentsForHotel(hotelId),
    });

    const nestedComments = useMemo(() => {
        const commentMap = {};
        const topLevelComments = [];

        rawComments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        rawComments.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].replies.push(comment);
            } else {
                topLevelComments.push(commentMap[comment.id]);
            }
        });

        topLevelComments.forEach(comment => {
            comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });

        return topLevelComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [rawComments]);

    const postCommentMutation = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', hotelId] });
            notification.success({ message: 'دیدگاه شما با موفقیت ثبت شد.' });
            form.resetFields();
        },
        onError: (error) => notification.error({ message: 'خطا در ثبت دیدگاه', description: error.message }),
    });

    const handleCommentSubmit = (values) => {
        if (!values.content?.trim()) return;
        postCommentMutation.mutate({
            hotelId: hotelId,
            content: values.content,
            sender: {
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'کاربر'
            }
        });
    };

    const commentsToShow = nestedComments.slice(0, visibleComments);
    const isAdmin = ['admin', 'hotel manager'].includes(user?.role?.toLowerCase());

    return (
        <CommentSectionWrapper>
            <Title level={4}>دیدگاه‌ها ({nestedComments.length})</Title>
            <Divider />

            {isAuthenticated ? (
                <div style={{ marginBottom: 24 }}>
                    <Form form={form} onFinish={handleCommentSubmit}>
                        <Form.Item name="content" rules={[{ required: true, message: 'لطفا متن دیدگاه را وارد کنید' }]}>
                            <Input.TextArea rows={4} placeholder="دیدگاه خود را بنویسید..." />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={postCommentMutation.isPending}>
                                ارسال دیدگاه
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            ) : (
                <Text type="secondary">برای ثبت دیدگاه، لطفا ابتدا <Link href="/login">وارد شوید</Link>.</Text>
            )}

            <Skeleton loading={isLoadingComments} active avatar paragraph={{ rows: 4 }}>
                <List
                    itemLayout="horizontal"
                    dataSource={commentsToShow}
                    renderItem={(comment) => (
                        <CommentItem key={comment.id}>
                            <CommentHeader>
                                <Avatar icon={<UserOutlined />} />
                                <Space style={{ marginLeft: 12 }}>
                                    <Text strong>{comment.sender?.name}</Text>
                                    <Text type="secondary">
                                        {dayjs(comment.createdAt).fromNow()}
                                    </Text>
                                </Space>
                              
                                    {isAdmin && (
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    >
                                        {replyingTo === comment.id ? 'لغو' : 'پاسخ'}
                                    </Button>
                                    )}
                               
                            </CommentHeader>

                            <CommentContent>
                                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                                    {comment.content}
                                </Paragraph>

                                {/* Admin replies */}
                                {comment.replies.map(reply => (
                                    <AdminReply key={reply.id}>
                                        <CommentHeader>
                                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                                            <Space style={{ marginLeft: 12 }}>
                                                <Text strong>{reply.sender.name}</Text>
                                                <Text type="secondary">
                                                    {dayjs(reply.createdAt).fromNow()}
                                                </Text>
                                            </Space>
                                        </CommentHeader>
                                        <CommentContent>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                                                {reply.content}
                                            </Paragraph>
                                        </CommentContent>
                                    </AdminReply>
                                ))}

                                {/* Reply form (only for admin) */}
                                {replyingTo === comment.id &&  isAdmin && (
                                    <ReplyFormWrapper>
                                        <ReplyForm
                                            hotelId={hotelId}
                                            parentId={comment.id}
                                            onFinish={() => setReplyingTo(null)}
                                        />
                                    </ReplyFormWrapper>
                                )}
                            </CommentContent>
                        </CommentItem>
                    )}
                />
            </Skeleton>

            {nestedComments.length > visibleComments && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Button onClick={() => setVisibleComments(prev => prev + 3)}>نمایش دیدگاه‌های بیشتر</Button>
                </div>
            )}

            {nestedComments.length > 3 && visibleComments >= nestedComments.length && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Button onClick={() => setVisibleComments(3)}>نمایش کمتر</Button>
                </div>
            )}
        </CommentSectionWrapper>
    );
};

export default CommentSection;