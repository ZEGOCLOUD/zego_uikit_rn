import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Delegate from "react-delegate-component";
import AudioContainer from "./AudioContainer";
import VideoContainer from "./VideoContainer";
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";


function MaskViewDefault(props) {
    return (<View></View>);
}

export default function ZegoVideoView(props) {
    const { userID, roomID, audioViewBackgroudColor, audioViewBackgroudImage, showSoundWave, videoFillMode, maskViewBuilder }
        = props;

    const [userInfo, setUserInfo] = useState({});
    const [currentUserID, setCurrentUserID] = useState(userID);
    ZegoUIKitInternal.onUserInfoUpdate('ZegoVideoView', (userInfo) => {
        if (userInfo.userID == currentUserID) {
            setUserInfo(userInfo);
        }
    });
    ZegoUIKitInternal.onRoomStateChanged('ZegoVideoView', (reason, errorCode, extendedData) => {
        if (ZegoUIKitInternal.isRoomConnected()) {
            if (!currentUserID || currentUserID === '') {
                setCurrentUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
            }
        }
    });
    return (<View style={styles.container}>
        {/* <AudioContainer
            style={styles.audioContainer}
            userInfo={userInfo}
            showSoundWave={showSoundWave}
            audioViewBackgroudColor={audioViewBackgroudColor}
            audioViewBackgroudImage={audioViewBackgroudImage}
        /> */}
        <VideoContainer
            style={styles.videoContainer}
            userID={currentUserID}
            roomID={roomID}
            videoFillMode={videoFillMode}
        />
        {/* <Delegate
            style={styles.mask}
            to={maskViewBuilder}
            default={MaskViewDefault}
            props={{ userInfo }}
        /> */}
    </View>)
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    audioContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    videoContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        zIndex: 1,
    },
    mask: {
        flex: 1,
        width: '100%',
        height: '100%',
        zIndex: 2,
    }
});