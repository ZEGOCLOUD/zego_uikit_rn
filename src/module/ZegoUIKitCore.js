import ZegoExpressEngine, {
    ZegoUser,
    ZegoRoomConfig,
    ZegoEngineProfile,
    ZegoView,
    ZegoViewMode,
    ZegoUpdateType,
    ZegoRemoteDeviceState,
    ZegoPublishStreamQuality,
    ZegoPlayStreamQuality,
    ZegoStream,
    ZegoRoomState,
} from 'zego-express-engine-reactnative';

import { ZegoAudioVideoService } from "./av_module/service";
import { ZegoRoomService } from "./room_module/service";
import { ZegoUserService } from "./user_module/service";
import { zloginfo, zlogwarning, zlogerror } from '../utils/logger';

export class ZegoUIKitCore {
    constructor() {
        this.zegoAudioVideoService = new ZegoAudioVideoService();
        this.zegoRoomService = new ZegoRoomService();
        this.zegoUserService = new ZegoUserService();

        // For dispatch event from engine
        this._services = [this.zegoAudioVideoService, this.zegoRoomService, this.zegoUserService];
    }

    _registerEngineCallback() {
        ZegoExpressEngine.instance().on(
            'roomUserUpdate',
            (roomID, updateType, userList) => {
                zloginfo('[roomUserUpdate callback]', roomID, updateType, userList);
                this._services.forEach(service => {
                    if (service && service.onRoomUserUpdate) {
                        service.onRoomUserUpdate(roomID, updateType, userList);
                    }
                })
            },
        );
        ZegoExpressEngine.instance().on(
            'roomStreamUpdate',
            (roomID, updateType, streamList) => {
                zloginfo('[roomStreamUpdate callback]', roomID, updateType, streamList);
                this._services.forEach(service => {
                    if (service && service.onRoomStreamUpdate) {
                        service.onRoomStreamUpdate(roomID, updateType, streamList);
                    }
                })
            },
        );
        ZegoExpressEngine.instance().on(
            'publisherQualityUpdate',
            (streamID, quality) => {
                zloginfo('[publisherQualityUpdate callback]', streamID, quality);
                this._services.forEach(service => {
                    if (service && service.onPublisherQualityUpdate) {
                        service.onPublisherQualityUpdate(streamID, quality);
                    }
                })
            },
        );
        ZegoExpressEngine.instance().on(
            'playerQualityUpdate',
            (streamID, quality) => {
                zloginfo('[playerQualityUpdate callback]', streamID, quality);
                this._services.forEach(service => {
                    if (service && service.onPlayerQualityUpdate) {
                        service.onPlayerQualityUpdate(streamID, quality);
                    }
                })
            },
        );
        ZegoExpressEngine.instance().on(
            'remoteCameraStateUpdate',
            (streamID, state) => {
                zloginfo('[remoteCameraStateUpdate callback]', streamID, state);
                this._services.forEach(service => {
                    if (service && service.onRemoteCameraStateUpdate) {
                        service.onRemoteCameraStateUpdate(streamID, state);
                    }
                })
            },
        );
        ZegoExpressEngine.instance().on(
            'remoteMicStateUpdate',
            (streamID, state) => {
                zloginfo('[remoteMicStateUpdate callback]', streamID, state);
                this._services.forEach(service => {
                    if (service && service.onRemoteMicStateUpdate) {
                        service.onRemoteMicStateUpdate(streamID, state);
                    }
                })
            },
        );
        ZegoExpressEngine.instance().on(
            'roomStateUpdate',
            (roomID, state, errorCode) => {
                zloginfo('[roomStateUpdate callback]', roomID, state, errorCode);
                this._services.forEach(service => {
                    if (service && service.onRoomStateUpdate) {
                        service.onRoomStateUpdate(roomID, state, errorCode);
                    }
                })
            },
        );
    }
    _unregisterEngineCallback() {
        ZegoExpressEngine.instance().off('roomUserUpdate');
        ZegoExpressEngine.instance().off('roomStreamUpdate');
        ZegoExpressEngine.instance().off('publisherQualityUpdate');
        ZegoExpressEngine.instance().off('playerQualityUpdate');
        ZegoExpressEngine.instance().off('remoteCameraStateUpdate');
        ZegoExpressEngine.instance().off('remoteMicStateUpdate');
        ZegoExpressEngine.instance().off('roomStateUpdate');
    }

    connect(appID, appSign) {
        new Promise((resolve, reject) => {
            const engineProfile = {
                appID: appID,
                appSign: appSign,
                scenario: ZegoScenario.General,
            }
            ZegoExpressEngine.createEngineWithProfile(engineProfile).then((engine) => {
                zloginfo('Create ZegoExpressEngine succeed!');
                this._unregisterEngineCallback();
                this._registerEngineCallback();
                resolve();
            }).catch((error) => {
                zlogerror('Create ZegoExpressEngine Failed: ', error);
                reject(error);
            });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (ZegoExpressEngine.instance()) {
                ZegoExpressEngine.destroyEngine().then(() => {
                    zloginfo('Destroy ZegoExpressEngine finished!')
                    resolve();
                }).catch((error) => {
                    zlogerror('Destroy ZegoExpressEngine failed!', error);
                    reject(error);
                })
            } else {
                resolve();
            }
        });

    }
}