import {
  ZegoVideoConfig,
} from 'zego-express-engine-reactnative';

const ZegoAudioVideoResourceMode = {
    Default: 0,
    CDNOnly: 1,
    L3Only: 2,
    RTCOnly: 3,
    CDNPlus: 4,
}
const ZegoChangedCountOrProperty = {
    userAdd: 1,
    userDelete: 2,
    microphoneStateUpdate: 3,
    cameraStateUpdate: 4,
    attributesUpdate: 5,
};
const ZegoUIKitPluginType = {
    signaling: 1, // zim, fcm
    beauty: 2, // effects or avatar or deepAR
    whiteboard: 3, // superboard
};
const ZegoRoomPropertyUpdateType = {
    set: 0,
    update: 1,
    remote: 2,
}

class ZegoUIKitVideoConfig {
  /// Frame rate, control the frame rate of the camera and the frame rate of the encoder.
  fps: number;

  /// Bit rate in kbps.
  bitrate: number;

  /// resolution width, control the image width of camera image acquisition or encoder when publishing stream.
  width: number;

  /// resolution height, control the image height of camera image acquisition or encoder when publishing stream.
  height: number;

  constructor(fps: number, bitrate: number, width: number, height: number) {
    this.fps = fps;
    this.bitrate = bitrate;
    this.width = width;
    this.height = height;
  }

  static preset180P() {
    return new ZegoUIKitVideoConfig(15, 300, 180, 320);
  }

  static preset270P() {
    return new ZegoUIKitVideoConfig(15, 400, 270, 480);
  }

  static preset360P() {
    return new ZegoUIKitVideoConfig(15, 600, 360, 640);;
  }

  static preset540P() {
    return new ZegoUIKitVideoConfig(15, 1200, 540, 960);
  }

  static preset720P() {
    return new ZegoUIKitVideoConfig(15, 1500, 720, 1280);
  }

  static preset1080P() {
    return new ZegoUIKitVideoConfig(15, 3000, 1080, 1920);
  }

  static preset2K() {
    return new ZegoUIKitVideoConfig(15, 6000, 1440, 2560);
  }

  static preset4K() {
    return new ZegoUIKitVideoConfig(15, 12000, 2160, 3840);
  }

  toSDK(orientation: number) {
    var config = new ZegoVideoConfig();

    config.bitrate = this.bitrate;
    config.fps = this.fps;

    const isPortraitUp = orientation === 0 || orientation === 2;
    const width = isPortraitUp ? this.width : this.height;
    const height = isPortraitUp ? this.height : this.width;

    config.encodeWidth = width;
    config.captureWidth = width;

    config.encodeHeight = height;
    config.captureHeight = height;
    
    return config;
  }
}

const ZegoToastType = {
  default: 0,
  info: 1,
  success: 2,
  warning: 3,
  error: 4,
};
  
export {
    ZegoAudioVideoResourceMode,
    ZegoChangedCountOrProperty,
    ZegoUIKitPluginType,
    ZegoRoomPropertyUpdateType,
    ZegoUIKitVideoConfig,
    ZegoToastType,
};