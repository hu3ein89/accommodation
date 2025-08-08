import axios from 'axios';
import bcrypt from 'bcryptjs';
import { sendResetPasswordEmail } from '../utils/email/emailjsService';

const API_URL = 'http://localhost:3000';

// Generate secure token
const generateToken = () => {
  const array = new Uint32Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('');
};

// Password hashing helper
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const validateResetToken = async (token) => {
  try {
    const { data: tokens } = await axios.get(`${API_URL}/resetTokens?token=${token}`);
    if (!tokens.length) {
      throw new Error('لینک بازیابی نامعتبر است');
    }
    
    const tokenData = tokens[0];
    if (new Date(tokenData.expiresAt) < new Date()) {
      await axios.delete(`${API_URL}/resetTokens/${tokenData.id}`);
      throw new Error('لینک بازیابی منقضی شده است');
    }
    
    return tokenData;
  } catch (error) {
    console.error('Token validation error:', error);
    throw new Error('خطا در بررسی لینک بازیابی');
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    // 1. Find user
    const { data: users } = await axios.get(`${API_URL}/users?email=${email}`);
    if (!users.length) {
      throw new Error('کاربری با این ایمیل یافت نشد');
    }

    const user = users[0];
    console.log('Attempting to send email to:', user.email);

    // 2. Create reset token
    const token = generateToken();
    await axios.post(`${API_URL}/resetTokens`, {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour expiry
    });

    // 3. Send email with reset link
    await sendResetPasswordEmail(email, `${user.firstName} ${user.lastName}`, token);

    return { 
      success: true, 
      message: 'لینک بازیابی به ایمیل شما ارسال شد'
    };

  } catch (error) {
    console.error('Password reset error:', error);
    if (error.response?.status === 404) {
      throw new Error('خطا در سرور: لطفا بعدا تلاش کنید');
    }
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    // 1. Validate token
    const tokenData = await validateResetToken(token);
    
    // 2. Hash new password properly
    const hashedPassword = await hashPassword(newPassword);
    
    // 3. Update user with hashed password
    await axios.patch(`${API_URL}/users/${tokenData.userId}`, {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    // 4. Clean up token
    await axios.delete(`${API_URL}/resetTokens/${tokenData.id}`);
    
    return { 
      success: true,
      userId: tokenData.userId
    };
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Login verification
export const verifyLogin = async (email, password) => {
  try {
    // 1. Find user
    const { data: users } = await axios.get(`${API_URL}/users?email=${email}`);
    if (!users.length) {
      throw new Error('کاربری با این ایمیل یافت نشد');
    }

    // 2. Verify password
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('رمز عبور اشتباه است');
    }

    // 3. Update last login
    await axios.patch(`${API_URL}/users/${user.id}`, {
      lastLogin: new Date().toISOString()
    });

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    requirements: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    }
  };
};