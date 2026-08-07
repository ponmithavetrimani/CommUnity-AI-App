# CommUnity AI API Documentation

Base URL:

http://localhost:5000/api

---

## Authentication

### Send OTP

POST /auth/send-otp

Body:

{
  "phone": "9876543210"
}

---

### Verify OTP

POST /auth/verify-otp

Body:

{
  "phone": "9876543210",
  "otp": "123456"
}

Response:

{
  "success": true,
  "token": "jwt-token"
}

---

## Journey

### Start Journey

POST /journey/start

Headers:

Authorization: Bearer JWT_TOKEN

Body:

{
  "source": "Bus Stand",
  "destination": "College"
}

---

### End Journey

POST /journey/end

Headers:

Authorization: Bearer JWT_TOKEN

Body:

{
  "journeyId": "123"
}

---

## Buddy

### Find Buddy

POST /buddy/match

---

## Risk

### Assess Risk

POST /risk/analyze

---

## Emergency

### SOS

POST /emergency/sos