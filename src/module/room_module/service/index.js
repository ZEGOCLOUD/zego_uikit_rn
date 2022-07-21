import { zlogerror, zlogwarning } from "../../../utils/logger";

export class ZegoRoomService {
    constructor(sdk) {
        this._sdk = sdk;
        this._onRoomStateChangedCallbacks = [];
        this._currentRoomID = '';
    }
    joinRoom(roomID) {
        return new Promise((resolve, reject) => {
            const currentUserInfo = this._sdk.zegoUserService.getLocalUserInfo();
            const user = { userID: currentUserInfo.userID, userName: currentUserInfo.userName };
            const config = { isUserStatusNotify: true }
            ZegoExpressEngine.instance().loginRoom(roomID, user, config).then(() => {
                this._currentRoomID = roomID;
                resolve();
            }).catch((error) => {
                zlogerror('Join room falied: ', error);
                reject(error);
            });
        });
    }
    leaveRoom() {
        return new Promise((resolve, reject) => {
            if (this._currentRoomID == '') {
                zlogwarning('You are not join in any room, no need to leave room.');
                resolve();
            } else {
                ZegoExpressEngine.instance().logoutRoom(roomID).then(() => {
                    this._currentRoomID = '';
                    resolve();
                }).catch((error) => {
                    zlogerror('Leave room falied: ', error);
                    reject(error);
                });
            }
        });
    }
    onRoomStateChanged(callback) {
        if (typeof callback !== 'function') {
            this._onRoomStateChangedCallbacks = [];
            zlogwarning('Set an invalid callback to [onRoomStateChanged], all callbacks were clear.');
        } else {
            this._onRoomStateChangedCallbacks.push(callback);
        }
    }

    // Event from engine >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    _onRoomStateChanged(roomID, reason, errorCode, extendedData) {
        this._onRoomStateChangedCallbacks.forEach(callback => {
            callback(reason, errorCode, extendedData);
        })
    }
}