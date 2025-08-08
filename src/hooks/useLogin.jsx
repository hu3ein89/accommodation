import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByEmail, updateUserLogin } from "../api/jsonServer";
import { useAuth } from "../context/AuthContext";
import { verifyPassword } from "../utils/authHelper"
import {useNotification} from "../context/NotificationContext"


export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();

    const handleLogin = async (values) => {
        try {
            setIsLoading(true);
            const user = await getUserByEmail(values.email);
            
            if (!user) {
                throw new Error('کاربری با این ایمیل یافت نشد');
            }
            
            const isPasswordValid = await verifyPassword(values.password, user.password);
            
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            await updateUserLogin(user.id, {
                lastLogin: new Date().toISOString()
            });
            
            login(user);
            
            notification.success({
                message: 'ورود با موفقیت انجام شد',
                description: `${user.firstName} ${user.lastName} عزیز خوش آمدید` 
            });

            // Redirect based on role
            const dashboardPath = user.role === 'Guest' ? '/' : '/';
            navigate(dashboardPath);
            
            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            notification.error({
                message: 'خطا در عملیات ورود',
                description: 'ایمیل یا رمز عبور اشتباه است  '
            });
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };
    
    return { handleLogin, isLoading };
};