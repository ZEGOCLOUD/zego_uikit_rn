export class ZegoUserService {
    constructor(sdk) {
        this._localUserInfo = {
            userID: '',
            userName: '',
            profileUrl: '',
            extendInfo: {}
        }
        this._sdk = sdk;
    }
    setLocalUserInfo(userInfo) {
        this._localUserInfo = userInfo;
    }
    getLocalUserInfo() {
        return this._localUserInfo;
    }

    onUserJoin(infoList) {

    }

    onUserLeave(infoList) {

    }
}