# Web_API 6003CEM

This is a full-stack flight booking application that integrates various APIs to provide a user-friendly experience. The project includes a React frontend, an Express backend, and integrations with Amadeus API, Firestore, and Google Places.

## Features
- Flight search and booking
- Wishlist and place details
- Google Places integration
- User authentication with Clerk

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Firebase project setup with Firestore
- Amadeus API credentials
- Google Places API key

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Web_API_6003CEM
```

### 2. Install Dependencies
#### Backend
```bash
cd backend
npm install
```
#### Frontend
```bash
cd ../frontend/clerk-react
npm install
```

### 3. Configure Environment Variables
#### Backend
Create a `.env` file in the `backend` directory with the following:
```
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
FIREBASE_CLIENT_EMAIL=<your-firebase-client-email>
AMADEUS_API_KEY=<your-amadeus-api-key>
AMADEUS_API_SECRET=<your-amadeus-api-secret>
GOOGLE_PLACES_API_KEY=<your-google-places-api-key>
```

### 4. Start the Application
#### Backend
```bash
cd backend
npm start
```
#### Frontend
```bash
cd ../frontend/clerk-react
npm run dev
```

### 5. Access the Application
Open your browser and navigate to `http://localhost:5173`.

## Contributing
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
