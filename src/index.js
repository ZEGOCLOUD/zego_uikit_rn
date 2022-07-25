// ZegoUIKit provider component to handle sdk connection and data
// export ZegoUIKitProvider from './ZegoUIKitProvider';

// // HOC for using ui-kit state
// // withZegoUIKitContext(MyCustomComponent) will give the zego state as props to MyCustomComponent
// export withZegoUIKitContext from './ZegoUIKitContext';
// export zegoUIKitSelectors from './selectors';

import ZegoUIKitInternal from './core/internal/ZegoUIKitInternal'
import ZegoVideoView from './components/audio_video/ZegoVideoView'
import ZegoCameraStatusIcon from './components/audio_video/ZegoCameraStatusIcon'
import ZegoMicStatusIcon from './components/audio_video/ZegoMicStatusIcon'
import ZegoSwitchCameraFacingButton from './components/audio_video/ZegoSwitchCameraFacingButton'
import ZegoToggleMicButton from './components/audio_video/ZegoToggleMicButton'
import ZegoToggleCameraButton from './components/audio_video/ZegoToggleCameraButton'
import ZegoToggleAudioOutputButton from './components/audio_video/ZegoToggleAudioOutputButton'
import ZegoAudioVideoContainer from './components/layout/AudioVideoContainer'

export default {
    connectSDK: ZegoUIKitInternal.connectSDK,
    disconnectSDK: ZegoUIKitInternal.disconnectSDK,
    useFrontFacingCamera: ZegoUIKitInternal.useFrontFacingCamera,
    isMicDeviceOn: ZegoUIKitInternal.isMicDeviceOn,
    isCameraDeviceOn: ZegoUIKitInternal.isCameraDeviceOn,
    turnMicDeviceOn: ZegoUIKitInternal.turnMicDeviceOn,
    turnCameraDeviceOn: ZegoUIKitInternal.turnCameraDeviceOn,
    onMicDeviceOn: ZegoUIKitInternal.onMicDeviceOn,
    onCameraDeviceOn: ZegoUIKitInternal.onCameraDeviceOn,
    joinRoom: ZegoUIKitInternal.joinRoom,
    leaveRoom: ZegoUIKitInternal.leaveRoom,
    onRoomStateChanged: ZegoUIKitInternal.onRoomStateChanged,
    setLocalUserInfo: ZegoUIKitInternal.setLocalUserInfo,
    getLocalUserInfo: ZegoUIKitInternal.getLocalUserInfo,
    onUserJoin: ZegoUIKitInternal.onUserJoin,
    onUserLeave: ZegoUIKitInternal.onUserLeave,
}

export {
    ZegoVideoView,
    ZegoCameraStatusIcon,
    ZegoMicStatusIcon,
    ZegoSwitchCameraFacingButton,
    ZegoToggleMicButton,
    ZegoToggleCameraButton,
    ZegoToggleAudioOutputButton,
    ZegoAudioVideoContainer,
}


