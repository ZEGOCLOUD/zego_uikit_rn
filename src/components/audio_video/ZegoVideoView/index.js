import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Delegate from "react-delegate-component";
import AudioContainer from "./AudioContainer";
import VideoContainer from "./VideoContainer";
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";


function MaskViewDefault(props) {
    const { userInfo } = props;
    const { userName = '' } = userInfo;
    return (<View style={styles.defaultMaskContainer}>
        <View style={styles.defaultMaskNameLabelContainer}>
            <Text style={styles.defaultMaskNameLabel}>{userName}</Text>
        </View>
    </View>);
}

export default function ZegoVideoView(props) {
    const { userID, roomID, audioViewBackgroudColor, audioViewBackgroudImage, showSoundWave, videoFillMode, maskViewBuilder }
        = props;

    const [userInfo, setUserInfo] = useState({});
    const [currentUserID, setCurrentUserID] = useState(userID);
    const [isCameraOn, setIsCameraOn] = useState(true);
    ZegoUIKitInternal.onUserInfoUpdate('ZegoVideoView', (info) => {
        if (info.userID == currentUserID) {
            setIsCameraOn(info.isCameraDeviceOn);
            setUserInfo(info);

        }
    });
    ZegoUIKitInternal.onRoomStateChanged('ZegoVideoView', (reason, errorCode, extendedData) => {
        if (ZegoUIKitInternal.isRoomConnected()) {
            if (!currentUserID || currentUserID === '') {
                const localUser = ZegoUIKitInternal.getLocalUserInfo();
                setCurrentUserID(localUser.userID);
                setIsCameraOn(localUser.isCameraDeviceOn);
            }
        }
    });
    return (<View style={styles.container}>
        {isCameraOn ?
            <VideoContainer
                style={styles.videoContainer}
                userID={currentUserID}
                roomID={roomID}
                fillMode={videoFillMode}
            /> :
            <AudioContainer
                style={styles.audioContainer}
                userInfo={userInfo}
                showSoundWave={showSoundWave}
                audioViewBackgroudColor={audioViewBackgroudColor}
                audioViewBackgroudImage={audioViewBackgroudImage}
            />
        }
        <Delegate
            style={styles.mask}
            to={maskViewBuilder}
            default={MaskViewDefault}
            props={{ userInfo }}
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
        position: 'absolute',
        zIndex: 2,
    },
    defaultMaskContainer: {
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    defaultMaskNameLabelContainer: {
        flex: 1,
        backgroundColor: '#2A2A2A',
        opacity: 0.5,
        position: 'absolute',
        alignSelf: 'center',
        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 3,
        paddingTop: 3,
        borderRadius: 6,
        bottom: 5,
        right: 5
    },
    defaultMaskNameLabel: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 12
    }
});