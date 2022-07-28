import React, { useEffect, useState } from "react";
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import { StyleSheet, View } from 'react-native'

export default function PictureInPictureLayout(props) {
    const { config = {}, foregroundBuilder } = props;
    const {
        audioViewBackgroudColor = '',
        audioViewBackgroudImage = '',
        showSoundWave = true,
        videoFillMode = 1,
        showSelfViewWithVideoOnly = false,
        smallViewDefaultPosition = 0,
        isSmallViewDraggable = false,
    } = config;
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
        console.log('>>>>>>>>>>> join', userList)
        if (userList.length == 1) {
            setRemoteUser(userList[0]);
        } else {
            //TODO
        }
    });
    ZegoUIKitInternal.onUserLeave('PictureInPictureLayout', (userList) => {
        console.log('<<<<<<<<<<<<<< leave', userList)
        if (userList.length == 1) {
            setRemoteUser({});
        } else {
            //TODO
        }
    });
    /*
    enum {
        topLeft = 0,
        topRight = 1,
        bottomLeft = 2,
        bottomRight = 3
    }
    */
    const getSmallViewPostStyle = () => {
        const styleList = [styles.smallViewPostTopLeft, styles.smallViewPostTopRight, styles.smallViewPostBottomLeft, styles.smallViewPostBottomRgith];
        if (smallViewDefaultPosition >= 0 && smallViewDefaultPosition <= 3) {
            return styleList[smallViewDefaultPosition];
        } else {
            return styles.smallViewPostTopLeft;
        }
    }
    return (<View style={styles.container}>
        <View style={[styles.smallView, getSmallViewPostStyle()]}>
            <ZegoAudioVideoView
                userID={Object.keys(localUser).length === 0 ? '' : localUser.userID}
                audioViewBackgroudColor={audioViewBackgroudColor}
                audioViewBackgroudImage={audioViewBackgroudImage}
                showSoundWave={showSoundWave}
                videoFillMode={videoFillMode}
                foregroundBuilder={foregroundBuilder}
            />
        </View>
        <View style={styles.bigView}>
            <ZegoAudioVideoView
                userID={Object.keys(remoteUser).length === 0 ? undefined : localUser.userID}
                audioViewBackgroudColor={audioViewBackgroudColor}
                audioViewBackgroudImage={audioViewBackgroudImage}
                showSoundWave={showSoundWave}
                videoFillMode={videoFillMode}
                foregroundBuilder={foregroundBuilder}
            />
        </View>
    </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    bigView: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 1,
    },
    smallView: {
        flex: 1,
        height: 169,
        width: 95,
        position: 'absolute',
        top: 70,
        right: 12,
        zIndex: 2,
        borderRadius: 10,
        overflow: 'hidden'
    },
    smallViewPostTopLeft: {
        top: 70,
        left: 12,
    },
    smallViewPostTopRight: {
        top: 70,
        right: 12,
    },
    smallViewPostBottomLeft: {
        bottom: 70,
        left: 12,
    },
    smallViewPostBottomRgith: {
        bottom: 70,
        right: 12,
    },
})