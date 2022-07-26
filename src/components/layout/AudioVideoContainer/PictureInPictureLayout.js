import { useState } from "react";
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";
import ZegoVideoView from "../../audio_video/ZegoVideoView";

export default function PictureInPictureLayout(props) {
    const { config, maskViewBuilder } = props;
    const [localUser, setLocalUser] = useState({});
    const [remoteUser, setRemoteUser] = useState({});
    ZegoUIKitInternal.onRoomStateChanged('PictureInPictureLayout', (reason, errorCode, extendedData) => {
        if (reason == 1 || reason == 4) {
            setLocalUser(ZegoUIKitInternal.getLocalUserInfo());
        } else if (reason == 2 || reason == 5 || reason == 6 || reason == 7) {
            // ZegoRoomStateChangedReasonLoginFailed
            // ZegoRoomStateChangedReasonReconnectFailed
            // ZegoRoomStateChangedReasonKickOut
            // ZegoRoomStateChangedReasonLogout
            // ZegoRoomStateChangedReasonLogoutFailed
            setLocalUser({});
            setRemoteUser({});
        }
    })
    ZegoUIKitInternal.onUserJoin('PictureInPictureLayout', (userList) => {
        if (userList.length == 1) {
            setRemoteUser(userList[0]);
        } else {
            //TODO
        }
    });
    ZegoUIKitInternal.onUserLeave('PictureInPictureLayout', (userList) => {
        if (userList.length == 1) {
            setRemoteUser({});
        } else {
            //TODO
        }
    });
    return (<View>
        <ZegoVideoView style={styles.smallView}
            userID={Object.keys(localUser).length === 0 ? '' : localUser.userID}
            audioViewBackgroudColor={config.audioViewBackgroudColor}
            audioViewBackgroudImage={config.audioViewBackgroudImage}
            showSoundWave={config.showSoundWave}
            videoFillMode={config.videoFillMode}
            maskViewBuilder={maskViewBuilder}
        />
        <ZegoVideoView style={styles.bigView}
            userID={Object.keys(remoteUser).length === 0 ? '' : remoteUser.userID}
            audioViewBackgroudColor={config.audioViewBackgroudColor}
            audioViewBackgroudImage={config.audioViewBackgroudImage}
            showSoundWave={config.showSoundWave}
            videoFillMode={config.videoFillMode}
            maskViewBuilder={maskViewBuilder}
        />
    </View>)
}

const styles = StyleSheet.create({
    bigView: {
        width: '100%',
        height: '100%'
    },
    smallView: {
        height: '25%',
        width: '40%',
        position: 'absolute',
        top: 80,
        right: 20,
        zIndex: 2,
    },
})