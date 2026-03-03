# Building APK for MyDent App

## Prerequisites

1. Make sure you have Node.js installed
2. Make sure you have Expo CLI installed
3. Make sure you have EAS CLI installed

## Installation

If you don't have EAS CLI installed, install it globally:

```bash
yarn global add eas-cli
```

## Login to Expo

You need to log in to your Expo account:

```bash
eas login
```

Use the credentials for the account that owns this project (satyam786).

## Configure EAS (Already Done)

The eas.json file has already been configured with three build profiles:
- development: For development builds with development client
- preview: For internal distribution as APK
- production: For production builds as App Bundle

## Build the APK

To build an APK for Android, run:

```bash
eas build --profile preview --platform android
```

This will:
1. Upload your project to Expo's servers
2. Build the APK
3. Provide you with a download link when complete

## Alternative: Development Build

For a development build that works with the Expo Go app:

```bash
eas build --profile development --platform android
```

## Download the Build

After the build completes, you can download it using:

```bash
eas build:download
```

Or download it directly from the Expo website using the link provided in the build output.

## Troubleshooting

If you encounter issues:
1. Make sure you're logged in: `eas whoami`
2. Check your project configuration in app.json
3. Ensure all assets are properly referenced
4. Check the Expo status page for any service outages

## Notes

- The first build may take longer as Expo needs to install dependencies
- Make sure you have a stable internet connection during the build process
- The APK will be signed with Expo's development certificate for preview builds