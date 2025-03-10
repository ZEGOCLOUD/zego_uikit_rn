import ZegoUIKitInternal from './components/internal/ZegoUIKitInternal';
import ZegoUIKitCorePlugin, {
  ZegoUIKitPluginType,
} from './components/internal/ZegoUIKitCorePlugin';
import { ZegoRoomPropertyUpdateType, ZegoToastType } from './components/internal/defines';
import ZegoAudioVideoView from './components/audio_video/ZegoAudioVideoView';
import ZegoCameraStateIcon from './components/audio_video/ZegoCameraStateIcon';
import ZegoMicrophoneStateIcon from './components/audio_video/ZegoMicrophoneStateIcon';
import ZegoSwitchCameraButton from './components/audio_video/ZegoSwitchCameraButton';
import ZegoToggleMicrophoneButton from './components/audio_video/ZegoToggleMicrophoneButton';
import ZegoToggleCameraButton from './components/audio_video/ZegoToggleCameraButton';
import ZegoSwitchAudioOutputButton from './components/audio_video/ZegoSwitchAudioOutputButton';
import ZegoAudioVideoContainer, {
  ZegoLayoutMode,
} from './components/audio_video_container/ZegoAudioVideoContainer';
import { ZegoViewPosition } from './components/audio_video_container/ZegoAudioVideoContainer/defines';
import ZegoLeaveButton from './components/audio_video/ZegoLeaveButton';
import ZegoInRoomMessageInput from './components/in_room_message/ZegoInRoomMessageInput';
import ZegoInRoomMessageView from './components/in_room_message/ZegoInRoomMessageView';
import ZegoMemberList from './components/in_room_member/ZegoMemberList';
import { ZegoAudioVideoResourceMode, ZegoUIKitVideoConfig } from './components/internal/defines';
import ZegoUIKitSignalingPluginImpl, {
  ZegoInvitationConnectionState,
  ZegoSendInvitationButton,
  ZegoCancelInvitationButton,
  ZegoAcceptInvitationButton,
  ZegoRefuseInvitationButton,
} from './plugins/invitation';
import ZegoUIKitLogger from './utils/kitlogger';
import ZegoUIKitReport from './utils/report';
import ZegoToast from './components/ZegoToast';

export default {
  init: ZegoUIKitInternal.connectSDK,
  uninit: ZegoUIKitInternal.disconnectSDK,
  useFrontFacingCamera: ZegoUIKitInternal.useFrontFacingCamera,
  isUsingFrontFacingCamera: ZegoUIKitInternal.isUsingFrontFacingCamera,
  isMicrophoneOn: ZegoUIKitInternal.isMicDeviceOn,
  isCameraOn: ZegoUIKitInternal.isCameraDeviceOn,
  setAudioOutputToSpeaker: ZegoUIKitInternal.setAudioOutputToSpeaker,
  turnMicrophoneOn: ZegoUIKitInternal.turnMicDeviceOn,
  turnCameraOn: ZegoUIKitInternal.turnCameraDeviceOn,
  onMicrophoneOn: ZegoUIKitInternal.onMicDeviceOn,
  onCameraOn: ZegoUIKitInternal.onCameraDeviceOn,
  onAudioOutputDeviceChanged: ZegoUIKitInternal.onAudioOutputDeviceTypeChange,
  onSoundLevelUpdated: ZegoUIKitInternal.onSoundLevelUpdate,
  joinRoom: ZegoUIKitInternal.joinRoom,
  leaveRoom: ZegoUIKitInternal.leaveRoom,
  isRoomConnected: ZegoUIKitInternal.isRoomConnected,
  onJoinRoom: ZegoUIKitInternal.onJoinRoom,
  onOnlySelfInRoom: ZegoUIKitInternal.onOnlySelfInRoom,
  onRoomStateChanged: ZegoUIKitInternal.onRoomStateChanged,
  onRequireNewToken: ZegoUIKitInternal.onRequireNewToken,
  connectUser: ZegoUIKitInternal.connectUser,
  disconnectUser: ZegoUIKitInternal.disconnectUser,
  getUser: ZegoUIKitInternal.getUser,
  getAllUsers: ZegoUIKitInternal.getAllUsers,
  getAudioVideoUsers: ZegoUIKitInternal.getAudioVideoUsers,
  getLocalUserInfo: ZegoUIKitInternal.getLocalUserInfo,
  setAppOrientation: ZegoUIKitInternal.setAppOrientation,
  setVideoConfig: ZegoUIKitInternal.setVideoConfig,
  onUserJoin: ZegoUIKitInternal.onUserJoin,
  onUserLeave: ZegoUIKitInternal.onUserLeave,
  onUserInfoUpdate: ZegoUIKitInternal.onUserInfoUpdate,
  onAudioVideoAvailable: ZegoUIKitInternal.onAudioVideoAvailable,
  onAudioVideoUnavailable: ZegoUIKitInternal.onAudioVideoUnavailable,
  muteUserAudio: ZegoUIKitInternal.muteUserAudio,
  muteUserVideo: ZegoUIKitInternal.muteUserVideo,
  getInRoomMessages: ZegoUIKitInternal.getInRoomMessages,
  sendInRoomMessage: ZegoUIKitInternal.sendInRoomMessage,
  onInRoomMessageReceived: ZegoUIKitInternal.onInRoomMessageReceived,
  onInRoomMessageSent: ZegoUIKitInternal.onInRoomMessageSent,
  onUserCountOrPropertyChanged: ZegoUIKitInternal.onUserCountOrPropertyChanged,
  setAudioVideoResourceMode: ZegoUIKitInternal.setAudioVideoResourceMode,
  setRoomProperty: ZegoUIKitInternal.setRoomProperty,
  updateRoomProperties: ZegoUIKitInternal.updateRoomProperties,
  getRoomProperties: ZegoUIKitInternal.getRoomProperties,
  onRoomPropertyUpdated: ZegoUIKitInternal.onRoomPropertyUpdated,
  onRoomPropertiesFullUpdated: ZegoUIKitInternal.onRoomPropertiesFullUpdated,
  forceSortMemberList: ZegoUIKitInternal.forceSortMemberList,
  forceSortAudioVideoList: ZegoUIKitInternal.forceSortAudioVideoList,
  forceRenderVideoView: ZegoUIKitInternal.forceRenderVideoView,
  startPlayingAllAudioVideo: ZegoUIKitInternal.startPlayingAllAudioVideo,
  stopPlayingAllAudioVideo: ZegoUIKitInternal.stopPlayingAllAudioVideo,
  removeUserFromRoom: ZegoUIKitInternal.removeUserFromRoom,
  sendInRoomCommand: ZegoUIKitInternal.sendInRoomCommand,
  onInRoomCommandReceived: ZegoUIKitInternal.onInRoomCommandReceived,
  onMeRemovedFromRoom: ZegoUIKitInternal.onMeRemovedFromRoom,
  onTurnOnYourCameraRequest: ZegoUIKitInternal.onTurnOnYourCameraRequest,
  onTurnOnYourMicrophoneRequest: ZegoUIKitInternal.onTurnOnYourMicrophoneRequest,
  installPlugins: ZegoUIKitCorePlugin.installPlugins,
  getPlugin: ZegoUIKitCorePlugin.getPlugin,
  logComponentsVersion: ZegoUIKitInternal.logComponentsVersion,
  onError: ZegoUIKitInternal.onError,
  onTokenProvide: ZegoUIKitInternal.onTokenProvide,
  renewToken: ZegoUIKitInternal.renewToken,
  isScreenSharing: ZegoUIKitInternal.isScreenSharing,
  onScreenSharingAvailable: ZegoUIKitInternal.onScreenSharingAvailable,
  onScreenSharingUnavailable: ZegoUIKitInternal.onScreenSharingUnavailable,
  getSignalingPlugin: () => ZegoUIKitSignalingPluginImpl,
  getVersion: ZegoUIKitInternal.getPackageVersion,
};

export {
  ZegoAudioVideoView,
  ZegoCameraStateIcon,
  ZegoMicrophoneStateIcon,
  ZegoSwitchCameraButton,
  ZegoToggleMicrophoneButton,
  ZegoToggleCameraButton,
  ZegoSwitchAudioOutputButton,
  ZegoAudioVideoContainer,
  ZegoLayoutMode,
  ZegoViewPosition,
  ZegoLeaveButton,
  ZegoInRoomMessageInput,
  ZegoInRoomMessageView,
  ZegoMemberList,
  ZegoSendInvitationButton,
  ZegoCancelInvitationButton,
  ZegoAcceptInvitationButton,
  ZegoRefuseInvitationButton,
  ZegoRoomPropertyUpdateType,
  ZegoUIKitPluginType,
  ZegoInvitationConnectionState,
  ZegoAudioVideoResourceMode,
  ZegoUIKitVideoConfig,
  ZegoUIKitLogger,
  ZegoUIKitReport,
  ZegoToast,
  ZegoToastType,
};
