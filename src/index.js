import ZegoUIKitInternal from './components/internal/ZegoUIKitInternal'
import ZegoAudioVideoView from './components/audio_video/ZegoAudioVideoView'
import ZegoCameraStateIcon from './components/audio_video/ZegoCameraStateIcon'
import ZegoMicrophoneStateIcon from './components/audio_video/ZegoMicrophoneStateIcon'
import ZegoSwitchCameraButton from './components/audio_video/ZegoSwitchCameraButton'
import ZegoToggleMicrophoneButton from './components/audio_video/ZegoToggleMicrophoneButton'
import ZegoToggleCameraButton from './components/audio_video/ZegoToggleCameraButton'
import ZegoSwitchAudioOutputButton from './components/audio_video/ZegoSwitchAudioOutputButton'
import ZegoAudioVideoContainer from './components/audio_video_container/ZegoAudioVideoContainer'
import ZegoLeaveButton from './components/audio_video/ZegoLeaveButton'
import ZegoInRoomMessageInput from './components/in_room_message/ZegoInRoomMessageInput'
import ZegoInRoomMessageView from './components/in_room_message/ZegoInRoomMessageView'

export default {
    init: ZegoUIKitInternal.connectSDK,
    uninit: ZegoUIKitInternal.disconnectSDK,
    useFrontFacingCamera: ZegoUIKitInternal.useFrontFacingCamera,
    isMicrophoneOn: ZegoUIKitInternal.isMicDeviceOn,
    isCameraOn: ZegoUIKitInternal.isCameraDeviceOn,
    setAudioOutputToSpeaker: ZegoUIKitInternal.setAudioOutputToSpeaker,
    turnMicrophoneOn: ZegoUIKitInternal.turnMicDeviceOn,
    turnCameraOn: ZegoUIKitInternal.turnCameraDeviceOn,
    onMicrophoneOn: ZegoUIKitInternal.onMicDeviceOn,
    onCameraOn: ZegoUIKitInternal.onCameraDeviceOn,
    onAudioOutputDeviceChanged: ZegoUIKitInternal.onAudioOutputDeviceTypeChange,
    onSoundLevelUpdated: ZegoUIKitInternal.onSoundLevelUpdate,
    // onAudioVideoAvailable
    // onAudioVideoUnavailable
    joinRoom: ZegoUIKitInternal.joinRoom,
    leaveRoom: ZegoUIKitInternal.leaveRoom,
    onOnlySelfInRoom: ZegoUIKitInternal.onOnlySelfInRoom,
    onRoomStateChanged: ZegoUIKitInternal.onRoomStateChanged,
    connectUser: ZegoUIKitInternal.connectUser,
    disconnectUser: ZegoUIKitInternal.disconnectUser,
    getUser: ZegoUIKitInternal.getUser,
    getAllUsers: ZegoUIKitInternal.getAllUsers,
    onUserJoin: ZegoUIKitInternal.onUserJoin,
    onUserLeave: ZegoUIKitInternal.onUserLeave,
    onAudioVideoAvailable: ZegoUIKitInternal.onAudioVideoAvailable,
    onAudioVideoUnavailable: ZegoUIKitInternal.onAudioVideoUnavailable,
    getInRoomMessages: ZegoUIKitInternal.getInRoomMessages,
    sendInRoomMessage: ZegoUIKitInternal.sendInRoomMessage,
    onInRoomMessageReceived: ZegoUIKitInternal.onInRoomMessageReceived,
    onInRoomMessageSent: ZegoUIKitInternal.onInRoomMessageSent,
}

export {
    ZegoAudioVideoView,
    ZegoCameraStateIcon,
    ZegoMicrophoneStateIcon,
    ZegoSwitchCameraButton,
    ZegoToggleMicrophoneButton,
    ZegoToggleCameraButton,
    ZegoSwitchAudioOutputButton,
    ZegoAudioVideoContainer,
    ZegoLeaveButton,
    ZegoInRoomMessageInput,
    ZegoInRoomMessageView
}


