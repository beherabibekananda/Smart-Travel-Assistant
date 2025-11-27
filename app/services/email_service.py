import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
        self.from_name = os.getenv("FROM_NAME", "Smart Travel Assistant")
        
    def _send_email(self, to_email: str, subject: str, html_body: str, text_body: str = None):
        """Send email using SMTP."""
        # If SMTP not configured, print to console instead
        if not self.smtp_user or not self.smtp_password:
            print(f"============================================")
            print(f"📧 [DEV MODE] EMAIL TO: {to_email}")
            print(f"SUBJECT: {subject}")
            print(f"BODY:\n{text_body or html_body}")
            print(f"============================================")
            return
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add text and HTML parts
            if text_body:
                msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                
            print(f"✅ Email sent successfully to {to_email}")
            
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")
            # Fallback to console printing
            print(f"============================================")
            print(f"📧 [FALLBACK] EMAIL TO: {to_email}")
            print(f"SUBJECT: {subject}")
            print(f"BODY:\n{text_body or html_body}")
            print(f"============================================")
    
    @staticmethod
    def send_booking_confirmation(email: str, booking_details: dict):
        service = EmailService()
        subject = f"Booking Confirmation - {booking_details.get('place_name')}"
        text_body = f"""
Hello {booking_details.get('user_name')},

Your booking at {booking_details.get('place_name')} is confirmed!

Date: {booking_details.get('date')}
Status: {booking_details.get('status')}

Thank you for using Smart Travel Assistant!
        """
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Booking Confirmed! ✓</h2>
                <p>Hello <strong>{booking_details.get('user_name')}</strong>,</p>
                <p>Your booking at <strong>{booking_details.get('place_name')}</strong> is confirmed!</p>
                <ul>
                    <li><strong>Date:</strong> {booking_details.get('date')}</li>
                    <li><strong>Status:</strong> {booking_details.get('status')}</li>
                </ul>
                <p>Thank you for using Smart Travel Assistant!</p>
            </body>
        </html>
        """
        service._send_email(email, subject, html_body, text_body)

    @staticmethod
    def send_password_reset(email: str, token: str):
        service = EmailService()
        subject = "Password Reset Request"
        text_body = f"""
Hello,

You requested a password reset for your Smart Travel Assistant account.

Your reset token is: {token}

This token will expire in 30 minutes.

If you didn't request this, please ignore this email.
        """
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your Smart Travel Assistant account.</p>
                <p>Your reset token is: <strong style="font-size: 18px; color: #2563eb;">{token}</strong></p>
                <p>This token will expire in 30 minutes.</p>
                <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
            </body>
        </html>
        """
        service._send_email(email, subject, html_body, text_body)
    
    @staticmethod
    def send_otp_email(email: str, otp_code: str, user_name: str):
        """Send OTP verification email to user."""
        service = EmailService()
        subject = "Verify Your Email - Smart Travel Assistant"
        text_body = f"""
Hello {user_name},

Thank you for signing up for Smart Travel Assistant!

Your verification code is: {otp_code}

This code will expire in 5 minutes.

If you didn't create an account, please ignore this email.
        """
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Smart Travel Assistant</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px;">
                    <h2 style="color: #1f2937;">Hello {user_name}! 👋</h2>
                    <p style="color: #4b5563; font-size: 16px;">Thank you for signing up for Smart Travel Assistant!</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #e5e7eb;">
                        <p style="color: #6b7280; margin: 0 0 10px 0;">Your verification code is:</p>
                        <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 10px 0;">{otp_code}</h1>
                        <p style="color: #ef4444; font-size: 14px; margin: 10px 0 0 0;">⏰ Expires in 5 minutes</p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">Enter this code on the verification page to complete your signup.</p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you didn't create an account, please ignore this email.</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    <p>© 2025 Smart Travel Assistant. All rights reserved.</p>
                </div>
            </body>
        </html>
        """
        service._send_email(email, subject, html_body, text_body)

email_service = EmailService()
