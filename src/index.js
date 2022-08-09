import ZegoUIKitInternal from './components/internal/ZegoUIKitInternal'
import ZegoAudioVideoView from './components/audio_video/ZegoAudioVideoView'
import ZegoCameraStatusIcon from './components/audio_video/ZegoCameraStatusIcon'
import ZegoMicrophoneStatusIcon from './components/audio_video/ZegoMicophoneStatusIcon'
import ZegoSwitchCameraFacingButton from './components/audio_video/ZegoSwitchCameraFacingButton'
import ZegoToggleMicrophoneButton from './components/audio_video/ZegoToggleMicrophoneButton'
import ZegoToggleCameraButton from './components/audio_video/ZegoToggleCameraButton'
import ZegoSwitchAudioOutputButton from './components/audio_video/ZegoSwitchAudioOutputButton'
import ZegoAudioVideoContainer from './components/audio_video_container/ZegoAudioVideoContainer'
import ZegoQuitButton from './components/audio_video/ZegoQuitButton'
import ZegoUIKitPrebuiltCall from './prebuilts/call'

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
    ZegoAudioVideoView,
    ZegoCameraStatusIcon,
    ZegoMicrophoneStatusIcon,
    ZegoSwitchCameraFacingButton,
    ZegoToggleMicrophoneButton,
    ZegoToggleCameraButton,
    ZegoSwitchAudioOutputButton,
    ZegoAudioVideoContainer,
    ZegoQuitButton,

    ZegoUIKitPrebuiltCall,
}


