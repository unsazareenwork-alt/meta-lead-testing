# Meta Lead Ads Live PoC

This project is a proof of concept. It receives leads from Meta Lead Ads and updates a React Native Expo screen live without manual refresh.

## Architecture Flow

1. Meta Lead Ads Testing Tool sends a webhook request.
2. Express backend receives the webhook via ngrok.
3. Backend fetches lead details using the Meta Graph API and your Page Access Token.
4. Backend formats the lead data including name, email, and phone number.
5. Socket.IO sends a new lead event to the mobile app.
6. React Native app updates the list on the screen right away.

## Prerequisites

- Node.js version 18 or higher
- Expo Go app installed on your phone
- ngrok account

## Setup Instructions

### 1. Backend Setup

1. Open your terminal and go to the backend folder:
cd backend
npm install
cd ../app
npm install