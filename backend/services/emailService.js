import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL ERROR:', error);
    console.log('Please check your .env file and Gmail app password');
  } else {
    console.log('✅ Email service ready! Sending from:', process.env.EMAIL_USER);
  }
});

export const sendPromoCodeEmail = async (toEmail, username, promoCode, discount) => {
  console.log(`📧 Attempting to send email to: ${toEmail}`);
  
  const mailOptions = {
    from: `"DeltaPlus Promo" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🎉 Your ${discount}% Discount Promo Code from DeltaPlus`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <img src="https://via.placeholder.com/80x80?text=DP" alt="DeltaPlus" style="width: 80px; height: 80px; border-radius: 50%; background: white; padding: 10px;">
            <h1 style="color: white; margin: 20px 0 0 0;">DeltaPlus</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${username}! 👋</h2>
            <p style="color: #666; line-height: 1.6;">Great news! You've received an exclusive promo code from DeltaPlus.</p>
            
            <div style="background-color: #f0fdf4; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your Promo Code</p>
              <h1 style="font-size: 48px; letter-spacing: 5px; margin: 0; color: #4CAF50; font-weight: bold;">${promoCode}</h1>
            </div>
            
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0;">💰 Discount Details</h3>
              <p style="font-size: 32px; font-weight: bold; color: #4CAF50; margin: 10px 0;">${discount}% OFF</p>
              <p style="color: #666;">Use this code at checkout to get ${discount}% discount on your purchase.</p>
            </div>
            
            <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>⚠️ Important Notes:</strong><br>
                • This promo code is valid for one-time use only<br>
                • Code will be marked as used after validation<br>
                • Enter the code exactly as shown above
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message from DeltaPlus Promo System.<br>
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${username}!
      
      Here's your exclusive promo code: ${promoCode}
      
      Discount: ${discount}% OFF
      
      How to use:
      1. Go to DeltaPlus validation page  
      2. Enter the promo code: ${promoCode}
      3. Get ${discount}% discount on your purchase
      
      Important:
      - This code is valid for one-time use only
      - Code will be marked as used after validation
      
      Thank you for choosing DeltaPlus!
      
      ---
      This is an automated message. Please do not reply.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${toEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};