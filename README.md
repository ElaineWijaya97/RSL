# Inventaris App

A simple inventory management application with cloud sync across devices.

## 🌐 Live Site

**https://elainewijaya97.github.io/RSL/**

## ☁️ Cloud Sync Setup (Required for Multi-Device)

To enable data sync across all devices and accounts, you need to set up Firebase:

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Enable **Firestore Database**:
   - Go to "Firestore Database" in left menu
   - Click "Create database"
   - Start in **test mode** (for now)
   - Choose a location close to you

### Step 2: Get Firebase Config

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the `</>` (Web) icon to add a web app
5. Register your app (name it "Inventaris")
6. Copy the `firebaseConfig` object

### Step 3: Update Config in index.html

1. Open `index.html` in your editor
2. Find the Firebase config section (around line 20-30)
3. Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### Step 4: Set Firestore Security Rules (Important!)

1. Go to Firestore Database → Rules
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /inventaris/{document=**} {
         allow read, write: if true; // Public read/write (for now)
       }
     }
   }
   ```
3. Click "Publish"

**Note:** For production, you should add authentication. The current setup allows anyone to read/write.

### Step 5: Deploy

1. Commit and push your changes:
   ```bash
   git add index.html
   git commit -m "Add Firebase config"
   git push origin main
   ```

2. Wait for GitHub Pages to update (1-2 minutes)

### ✅ Verification

- Open your site on multiple devices/browsers
- Make a change on one device
- Refresh other devices - changes should appear automatically!

## Setup GitHub Pages (If you get 404 error)

1. Go to: https://github.com/ElaineWijaya97/RSL/settings/pages
2. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
3. Click **Save**
4. Wait 2-5 minutes for GitHub to build your site
5. Refresh the page - you should see a green checkmark when it's ready

**Note:** First-time setup can take 5-10 minutes. Be patient!

## Local Development

To run locally:
```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Login

Default admin password: `inventaris123`

## Features

- ✅ Cloud sync across all devices (with Firebase)
- ✅ Real-time updates
- ✅ Auto-save
- ✅ Photo uploads
- ✅ Expiry date tracking
- ✅ Quantity management
