import emailjs from '@emailjs/browser';

// Initialize with your credentials
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

export const sendResetPasswordEmail = async (toEmail, userName, resetToken) => {
  const encodedToken = encodeURIComponent(resetToken);
  const resetLink = `${import.meta.env.VITE_FRONTEND_URL}/reset-password/${encodedToken}`;
  
  try {

    const templateParams = {
        to_email: toEmail,
        name: userName,
        reset_link: resetLink,
        from_name:"hotelYar"
      };
      console.log('Sending email with params:', templateParams);
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('Reset password email sent successfully');
    return true;
  } catch (error) {
    console.error('EmailJS error:', error);
    throw new Error('خطا در ارسال ایمیل بازیابی');
  }
};