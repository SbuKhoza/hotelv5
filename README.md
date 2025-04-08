# Steady Hotel Admin Management System

## Overview
Steady Hotel Management System is a comprehensive web application designed for hotel administrators to efficiently manage accommodations, bookings, users, and gain insights through a detailed dashboard. Built with React and Firebase, this system provides a user-friendly interface to handle various aspects of hotel management.

## Author
Sibusiso Khozaem

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Login Details](#login-details)
- [Project Structure](#project-structure)
- [Pages Description](#pages-description)
- [Firebase Configuration](#firebase-configuration)
- [Data Models](#data-models)
- [Components](#components)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

## Features
- **Dashboard**: Visual representation of key metrics, including total accommodations, users, bookings, revenue, and occupancy rates
- **User Management**: View and manage user accounts
- **Accommodation Management**: Add, edit, and delete accommodation listings
- **Booking Management**: Process bookings with status tracking (confirmed, pending, cancelled, completed)
- **Search and Filtering**: Search for accommodations or bookings by various criteria
- **Visual Charts**: View revenue trends and accommodation type distribution
- **Responsive Design**: Works on multiple device sizes

## Tech Stack
- **Frontend**: React.js
- **Routing**: React Router
- **UI Components**: Material UI
- **Charts**: Recharts
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage

## Installation
1. Clone the repository
```bash
git clone https://github.com/SbuKhoza/hotelv5
cd hotelv5
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Build for production
```bash
npm run build
```

## Login Details
- **Email**: admin@steady.co.za
- **Password**: 12345678

## Project Structure
```
hotelv5/
├── public/
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Accommodation.js
│   │   ├── Bookings.js
│   │   ├── Dashboard.js
│   │   ├── Home.js
│   │   └── Users.js
│   ├── service/
│   │   └── firebase.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Pages Description

### Dashboard
The dashboard provides a comprehensive overview of the hotel's operations with:
- Summary cards showing key metrics (accommodations, users, bookings, revenue, etc.)
- Revenue chart displaying financial performance over the last 6 months
- Pie chart showing the distribution of accommodation types
- Lists of popular accommodations and recent bookings

### Bookings Management
The bookings page allows administrators to:
- View all bookings with guest details, accommodation information, check-in/out dates, and status
- Filter bookings by status (confirmed, pending, cancelled, completed)
- Search for bookings by guest name or accommodation
- Edit booking details, including status, dates, and pricing
- Delete bookings when necessary

### Accommodation Management
This page enables administrators to manage all property listings, including:
- Adding new accommodations with details like name, type, price, and availability
- Editing existing accommodation details
- Uploading and managing accommodation images
- Viewing occupancy status

### Users Management
The users page displays all registered users with:
- Profile pictures
- Names
- Email addresses
- Phone numbers

## Firebase Configuration
The system uses Firebase for backend services. The configuration includes:
- Firebase Authentication for user management
- Firestore Database for storing data
- Firebase Storage for image uploads

Firebase configuration is set up in `src/service/firebase.js`.

## Data Models

### Users Collection
```
users/
├── id: String
├── name: String
├── email: String
├── phone: String
└── profilePicture: String (URL)
```

### Accommodation Collection
```
accommodation/
├── id: String
├── name: String
├── type: String
├── price: Number
├── description: String
├── images: Array<String> (URLs)
├── features: Array<String>
├── guests: Number
├── availability: Number
└── totalUnits: Number
```

### Bookings Collection
```
bookings/
├── id: String
├── accommodationId: String (reference)
├── accommodationName: String
├── userName: String
├── userId: String (reference)
├── checkIn: Timestamp
├── checkOut: Timestamp
├── totalPrice: Number
├── status: String (confirmed, pending, cancelled, completed)
└── createdAt: Timestamp
```

## Components

### Navbar
The navigation component provides access to all main sections of the application:
- Dashboard
- Users
- Accommodations
- Bookings

## Troubleshooting

### Common Issues
1. **Firebase Connection Issues**:
   - Verify that the Firebase configuration in `src/service/firebase.js` is correct
   - Check Firebase console to ensure services are active

2. **Data Not Updating**:
   - Clear browser cache and reload
   - Check Firestore rules to ensure proper read/write permissions

3. **Chart Rendering Issues**:
   - Ensure that data format matches what Recharts expects
   - Check for null values in dataset

## Future Enhancements
- Implement user authentication levels (admin, manager, staff)
- Add reporting and analytics features