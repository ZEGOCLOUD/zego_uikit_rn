# Clone project

# Completed clone
1. `git clone --recurse-submodules git@git.e.coding.zego.cloud:dev/solution_os/zego_uikit_rn.git`
2. `cd prebuilts/xxx`
3. `git checkout master & git pull`


# Create new prebuilt package

`npx create-react-native-library new_prebuilt`

# Create new demo for both UIKit and Prebuilt

1. `react-native init --version "0.68.2" --skip-install ZegoPrebuiltLiveStreaming`
2. `react-native-rename ZegoPrebuiltLiveStreaming -b com.zegocloud.uikit.rn.zegoprebuiltlivestreaming`
3. Copy `metro.config.js` from `prebuilt/live_streaming/example`
4. Update `package.json` file

```json
"dependencies": {
    "@zegocloud/zego-uikit-rn": "link: ../../../", // Add this line
    "@zegocloud/zego-uikit-prebuilt-live-streaming-rn": "link: ../" // Add this line
```
5. Add `KeyCenter.js` under example/src with contents as below:
```json
const KeyCenter = {
    appID: 252984006,
    appSign: '7328c93dfd9c7cf300818cde931c661b545bfc098fce80c722fdbd8d1a3b262a',
}

export default KeyCenter
```

# Run the demo

1. Run `yarn install & yarn prepare` under zego_uikit_rn
2. Go to prebuilts/xxx and run `yarn install yarn example android`

