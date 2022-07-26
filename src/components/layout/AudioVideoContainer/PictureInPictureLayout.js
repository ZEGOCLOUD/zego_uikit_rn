import React, { useState } from "react";
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";
import ZegoVideoView from "../../audio_video/ZegoVideoView";
import { StyleSheet, View } from 'react-native'

export default function PictureInPictureLayout(props) {
    const { config = {}, maskViewBuilder } = props;
    const { audioViewBackgroudColor = '', audioViewBackgroudImage = '', showSoundWave = true, videoFillMode = 1 } = config;
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
    return (<View style={styles.container}>
        <View style={styles.smallView}
            userID={Object.keys(localUser).length === 0 ? '' : localUser.userID}
            audioViewBackgroudColor={audioViewBackgroudColor}
            audioViewBackgroudImage={audioViewBackgroudImage}
            showSoundWave={showSoundWave}
            videoFillMode={videoFillMode}
            maskViewBuilder={maskViewBuilder}
        />
        <ZegoVideoView style={styles.bigView}
            userID={Object.keys(remoteUser).length === 0 ? '' : remoteUser.userID}
            audioViewBackgroudColor={audioViewBackgroudColor}
            audioViewBackgroudImage={audioViewBackgroudImage}
            showSoundWave={showSoundWave}
            videoFillMode={videoFillMode}
            maskViewBuilder={maskViewBuilder}
        />
    </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
  
      },
    bigView: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 0,
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