# CommUnity AI - System Architecture

## Overview

CommUnity AI is a women safety and smart travel companion platform that combines:

- Mobile Application (React Native + Expo)
- Backend API (Node.js + Express + TypeScript)
- MongoDB Atlas Database
- AI Agents Layer
- Firebase Push Notifications
- Socket.IO Real-Time Tracking

---

## Architecture Diagram

Mobile App
|
v
Backend API
|
|---- Authentication Service
|---- Journey Service
|---- Buddy Matching Service
|---- Emergency Service
|---- Risk Assessment Service
|
v
MongoDB Atlas

AI Layer
|
|---- Safety Agent
|---- Buddy Matching Agent
|---- Risk Assessment Agent
|---- Emergency Response Agent
|---- Trust Score Agent

External Services
|
|---- Firebase
|---- Google Maps
|---- Gemini AI

---

## Core Features

1. OTP Login
2. Live Journey Tracking
3. Smart Buddy Matching
4. SOS Emergency Alerts
5. Risk Assessment
6. Trust Score System
7. Push Notifications