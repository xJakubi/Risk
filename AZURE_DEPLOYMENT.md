# Azure Static Web Apps Deployment

This file contains instructions for deploying the Risk game to Azure Static Web Apps.

## Deployment Token

The Azure Static Web Apps deployment token is:

```
db9231507572df5853352b021ae6eb23ba38275f4c72adc61531bf614423757906-6f2065f6-403a-4b40-8186-9baa50ef59c201031250e3165a10
```

## Setup Instructions

1. Fork this repository to your GitHub account
2. Go to Azure Portal (https://portal.azure.com)
3. Create a new Static Web App resource
4. Connect to your GitHub repository
5. Add the deployment token as a GitHub secret named `AZURE_STATIC_WEB_APPS_API_TOKEN_ZEALOUS_WATER_0E3165A10`
6. Configure the build settings:
   - App location: `/`
   - Api location: Leave empty
   - Output location: Leave empty
7. Complete the creation process

The GitHub workflow will automatically deploy the game when changes are pushed to the master branch.

## Firebase Setup for Multiplayer

To enable the multiplayer functionality:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Under "Build", select "Realtime Database"
4. Click "Create Database"
5. Start in "test mode" for development
6. Go to Project Settings > General
7. Add a Web App to the project
8. Register the app with a nickname (e.g., "Risk Game")
9. Copy the Firebase configuration object
10. Update the `firebaseConfig` object in `js/multiplayer.js` with your configuration

Example Firebase configuration:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Local Development

To run the game locally, simply open the `index.html` file in your browser.
