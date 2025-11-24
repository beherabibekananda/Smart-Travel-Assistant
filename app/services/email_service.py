class EmailService:
    @staticmethod
    def send_booking_confirmation(email: str, booking_details: dict):
        print(f"============================================")
        print(f"📧 SENDING EMAIL TO: {email}")
        print(f"SUBJECT: Booking Confirmation - {booking_details.get('place_name')}")
        print(f"BODY:")
        print(f"Hello {booking_details.get('user_name')},")
        print(f"Your booking at {booking_details.get('place_name')} is confirmed!")
        print(f"Date: {booking_details.get('date')}")
        print(f"Status: {booking_details.get('status')}")
        print(f"============================================")

    @staticmethod
    def send_password_reset(email: str, token: str):
        print(f"============================================")
        print(f"📧 SENDING EMAIL TO: {email}")
        print(f"SUBJECT: Password Reset Request")
        print(f"BODY:")
        print(f"Use this token to reset your password: {token}")
        print(f"============================================")

email_service = EmailService()
