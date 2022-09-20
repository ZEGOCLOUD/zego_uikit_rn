# Create new prebuilt package

`npx create-react-native-library new_prebuilt`

# Create new demo for both UIKit and Prebuilt

1. `react-native init --version "0.68.2" --skip-install ZegoPrebuiltLiveStreaming`
2. Copy `metro.config.js` from `prebuilt/live_streaming/example`
3. Update `package.json` file

```json
"dependencies": {
    "@zegocloud/zego-uikit-rn": "link: ../../../", // Add this line
    "@zegocloud/zego-uikit-prebuilt-live-streaming-rn": "link: ../" // Add this line
```


