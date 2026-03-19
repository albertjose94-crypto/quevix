# 🚀 Quevix Mobile App - APK Build Guide

## ✅ Setup Completed

### Files Configured:
- ✅ **google-services.json** - Downloaded and placed in `/app/mobile/`
- ✅ **Firebase config** - Updated in `/app/mobile/src/firebaseConfig.js`
- ✅ **app.json** - Configured with package name `com.quevix.queue`
- ✅ **eas.json** - Build configuration ready

---

## 📱 Build APK - Complete Steps

### Option 1: Build with EAS (Recommended - Cloud Build)

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

**Don't have an account?**
- Go to: https://expo.dev/signup
- Create free account
- Use same email for login

#### Step 3: Navigate to Mobile Directory
```bash
cd /app/mobile
```

#### Step 4: Install Dependencies
```bash
npm install
```

#### Step 5: Configure EAS Build
```bash
eas build:configure
```

**When prompted:**
- Choose: **Android**
- Accept defaults

#### Step 6: Build APK
```bash
eas build --platform android --profile preview
```

**This will:**
- Upload your code to Expo servers
- Build APK in the cloud (~15-20 minutes)
- Provide download link when complete

#### Step 7: Download APK
- Check email for build complete notification
- Or visit: https://expo.dev/accounts/[your-account]/projects/quevix-queue/builds
- Click download APK link
- Transfer to Android device

#### Step 8: Install on Device
1. Enable "Install from unknown sources" on Android
2. Open APK file
3. Tap "Install"
4. Open Quevix Queue app

---

### Option 2: Build Locally (Advanced)

#### Requirements:
- Android Studio installed
- JDK 17+
- Android SDK tools

#### Steps:
```bash
cd /app/mobile

# Install dependencies
npm install

# Generate Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎨 Create App Icons (Before Building)

### Quick Method: Use Placeholder

I'll create simple icon files for you:

```bash
cd /app/mobile/assets

# Create placeholder icon (you can replace with custom design later)
# For now, EAS will use default Expo icon
```

### Professional Method: Custom Icons

**Create these files:**
- `icon.png` - 1024x1024 (app icon)
- `adaptive-icon.png` - 1024x1024 (Android adaptive icon)
- `splash.png` - 1284x2778 (splash screen)
- `notification-icon.png` - 96x96 (notification icon)
- `favicon.png` - 48x48 (web favicon)

**Design tips:**
- Simple, recognizable logo
- High contrast colors
- Avoid fine details (they get lost at small sizes)
- Use brand colors (purple/pink gradient from web app)

**Tools:**
- Figma (free): https://figma.com
- Canva (free): https://canva.com
- Icon generator: https://easyappicon.com

**Or use online services:**
- https://www.appicon.co
- Upload 1024x1024 image
- Download all sizes

---

## 🔧 Troubleshooting

### Issue: "Missing google-services.json"
**Fix:** File is already in `/app/mobile/google-services.json` ✅

### Issue: "Build failed - Invalid package name"
**Fix:** Package name is correct: `com.quevix.queue` ✅

### Issue: "Firebase not connecting"
**Fix:** Firebase config already updated in:
- `/app/mobile/src/firebaseConfig.js`
- Uses same config as web app ✅

### Issue: "Expo account required"
**Solution:**
1. Go to https://expo.dev/signup
2. Sign up (free)
3. Run `eas login`
4. Enter credentials

### Issue: "Build taking too long"
**Normal:** Cloud builds take 15-20 minutes
**Check status:** https://expo.dev (login to see builds)

### Issue: "Can't install APK"
**Fix:**
1. Go to Settings → Security
2. Enable "Install from unknown sources"
3. Or: Settings → Apps → Chrome → Install unknown apps → Allow

---

## 📦 Build Profiles Explained

### Preview Profile (Recommended for Testing)
```json
{
  "preview": {
    "android": {
      "buildType": "apk"
    }
  }
}
```

**Use for:**
- Testing
- Internal distribution
- Quick iterations
- Sharing with team

**Build command:**
```bash
eas build --platform android --profile preview
```

### Production Profile (For Play Store)
```json
{
  "production": {
    "android": {
      "buildType": "app-bundle"
    }
  }
}
```

**Use for:**
- Google Play Store submission
- Official releases
- After testing is complete

**Build command:**
```bash
eas build --platform android --profile production
```

---

## 🎯 Quick Start (Fastest Way)

**If you want APK RIGHT NOW:**

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Navigate to mobile folder
cd /app/mobile

# 3. Login (create account if needed)
eas login

# 4. Start build
eas build --platform android --profile preview
```

**Then:**
- Wait 15-20 mins
- Get email with download link
- Download APK
- Install on phone
- Done! 🎉

---

## 📱 Test Mobile App Before Building

**Quick test with Expo Go (no APK needed):**

```bash
cd /app/mobile
npm install
npx expo start
```

**Then:**
1. Install "Expo Go" app on your phone:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. Scan QR code from terminal

3. Test all features:
   - Barber dashboard
   - Admin panel
   - Real-time sync
   - Notifications

**Benefits:**
- Instant testing (no build needed)
- See changes in real-time
- Debug easily
- Free

**Limitations:**
- Need internet
- Expo Go app required
- Not standalone APK

---

## 🚀 After APK is Built

### Test Checklist:

**Barber Dashboard:**
- [ ] See waiting queue
- [ ] Call next customer works
- [ ] Mark done removes customer
- [ ] Notifications arrive
- [ ] Real-time sync works

**Admin Panel:**
- [ ] Shop open/close toggle
- [ ] Adjust active chairs
- [ ] View statistics
- [ ] Clear queue works
- [ ] Reset day works

**Integration with Web:**
- [ ] Customer joins on web → Appears in mobile
- [ ] Barber calls next → Web updates
- [ ] Shop status syncs both ways

### Share APK:

**Methods:**
1. **Google Drive:**
   - Upload APK to Drive
   - Share link with team

2. **WhatsApp/Email:**
   - Send APK file directly
   - Recipients install on Android

3. **Firebase App Distribution:**
   - Upload to Firebase Console
   - Invite testers via email
   - Track installations

4. **Internal Link:**
   - Host on your server
   - Share download link
   - Track downloads

---

## 🎨 Recommended Icons

**For Quevix Queue System:**

**Style suggestion:**
- Icon: Purple/pink gradient circle
- Symbol: Queue number "#" or line of people icons
- Background: Gradient from purple to pink
- Text: Optional "Q" letter

**Colors (from web app):**
- Primary: `#a855f7` (purple-500)
- Secondary: `#ec4899` (pink-500)
- Background: `#0f172a` (slate-900)

**Example concept:**
```
🟣 Purple circle background
👥 White queue icon in center
#  Or large "#" symbol
```

---

## 📊 Build Status Check

**Check your build:**
```bash
eas build:list
```

**Or visit:**
https://expo.dev/accounts/[your-username]/projects/quevix-queue/builds

**Build States:**
- 🟡 **In Queue** - Waiting to start
- 🔵 **Building** - Currently building
- 🟢 **Finished** - Ready to download
- 🔴 **Failed** - Check error logs

---

## 🔐 Security Notes

**google-services.json:**
- ✅ Already placed correctly
- ⚠️ Contains API keys (safe for client app)
- ✅ Configured for package: `com.quevix.queue`
- ✅ Project: quevix-4f006

**Firebase Security:**
- Update Firestore rules before production
- Review in Firebase Console
- Restrict write access as needed

---

## 💡 Pro Tips

**1. Test First:**
Use Expo Go for quick testing before building APK

**2. Version Control:**
Update version in `app.json` before each build:
```json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

**3. Build Locally for Speed:**
If you have Android Studio, local builds are faster

**4. Multiple Builds:**
EAS free plan: 30 builds/month (plenty for testing)

**5. Automatic Updates:**
Use EAS Update for over-the-air updates (no new APK needed)

---

## 📞 Support

**EAS Build Issues:**
- Docs: https://docs.expo.dev/build/introduction/
- Forum: https://forums.expo.dev/

**Firebase Issues:**
- Check google-services.json is valid
- Verify package name matches: `com.quevix.queue`
- Ensure Firebase config is correct

**App Issues:**
- Test with Expo Go first
- Check Firebase Console for data
- Verify real-time sync
- Check device logs

---

## ✅ Final Checklist Before Building

- [x] google-services.json placed in `/app/mobile/`
- [x] Firebase config updated in `firebaseConfig.js`
- [x] Package name correct: `com.quevix.queue`
- [x] app.json configured
- [x] eas.json configured
- [ ] Icons created (or use default)
- [ ] Tested with Expo Go
- [ ] Ready to build APK

---

## 🎉 Ready to Build!

**Everything is configured. Run this command to build:**

```bash
cd /app/mobile
eas build --platform android --profile preview
```

**Or test first with:**

```bash
cd /app/mobile
npx expo start
```

---

**Your mobile app is ready for building!** 🚀

Files configured:
- ✅ google-services.json
- ✅ Firebase config
- ✅ Build configuration

Next: Follow the build steps above to generate your APK!
