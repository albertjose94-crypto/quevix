# Quevix Mobile - React Native App

## Setup Instructions

### 1. Update Firebase Config

Edit `src/firebaseConfig.js` and replace placeholder values with your Firebase config.

### 2. Add google-services.json (Android)

1. Download from Firebase Console
2. Place in project root: `/app/mobile/google-services.json`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npx expo start
```

### 5. Test on Device

- Install Expo Go app on your phone
- Scan QR code from terminal

### 6. Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

## Features

- **Barber Dashboard:** View queue, call next, mark complete
- **Admin Panel:** Manage shop settings, view stats
- **Real-Time Sync:** Instant updates from Firebase
- **Push Notifications:** Get notified when customers join

## Notifications

- Requires physical device (not emulator)
- Permissions must be granted
- Works when app is in background

## Project Structure

```
/mobile/
├── App.js                    # Main navigation
├── src/
│   ├── firebaseConfig.js     # Firebase setup
│   ├── screens/
│   │   ├── BarberDashboard.js
│   │   └── AdminPanel.js
│   └── utils/
│       └── notifications.js   # FCM setup
├── app.json                  # Expo config
└── package.json
```
