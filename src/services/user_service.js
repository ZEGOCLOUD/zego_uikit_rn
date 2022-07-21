import { zlogwarning } from "../utils/logger";

export class ZegoUserService {
    constructor(sdk) {
        this._localUserInfo = {
            userID: '',
            userName: '',
            profileUrl: '',
            extendInfo: {}
        }
        this._userInfoList = [];
        this._sdk = sdk;
        this._onUserJoinCallbacks = [];
        this._onUserLeaveCallbacks = [];
    }
    setLocalUserInfo(userInfo) {
        this._localUserInfo = userInfo;
    }
    getLocalUserInfo() {
        return this._localUserInfo;
    }
    getUserInfoByID(id) {
        this._userInfoList.forEach(info => {
            if (info.userID == id) {
                return info;
            }
        })
        return undefined;
    }

    onUserJoin(callback) {
        if (typeof callback !== 'function') {
            this._onUserJoinCallbacks = [];
            zlogwarning('Set an invalid callback to [onUserJoin], all callbacks were clear.');
        } else {
            this._onUserJoinCallbacks.push(callback);
        }
    }

    onUserLeave(callback) {
        if (typeof callback !== 'function') {
            this._onUserLeaveCallbacks = [];
            zlogwarning('Set an invalid callback to [onUserLeave], all callbacks were clear.');
        } else {
            this._onUserLeaveCallbacks.push(callback);
        }
    }

    // Event from engine >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    _onRoomUserUpdate(roomID, updateType, userList) {
        // No need for roomID, does not support multi-room right now.
        const userInfoList = [];
        if (updateType == 0) {
            userList.forEach(user => {
                const userInfo = {
                    userID: user.userID,
                    userName: user.userName,
                    profileUrl: '', // TODO read from zim sdk
                    extendInfo: {} // TODO read from zim sdk
                }
                userInfoList.push(userInfo);
                this._userInfoList[user.userID] = userInfo;
            });
            this._onUserJoinCallbacks.forEach(callback => {
                callback(userInfoList);
            })
        } else {
            userList.forEach(user => {
                const userInfo = this.getUserInfoByID(userID);
                userInfoList.push(userInfo);
                const index = this._userInfoList.indexOf(userInfo);
                if (index !== -1) {
                    this._userInfoList.splice(index, 1);
                }
            });
            this._onUserLeaveCallbacks.forEach(callback => {
                callback(userInfoList);
            });
        }
    }
}