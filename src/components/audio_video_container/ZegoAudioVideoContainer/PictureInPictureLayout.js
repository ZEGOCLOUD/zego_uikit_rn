import React, { useEffect, useState } from "react";
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'

// enum ZegoViewPostion {
//     topLeft = 0,
//     topRight = 1,
//     bottomLeft = 2,
//     bottomRight = 3
//     }
export default function PictureInPictureLayout(props) {
    const { config = {}, foregroundBuilder, audioVideoConfig = {} } = props;
    const {
        isSmallViewDraggable = false, // TODO
        showMyViewWithVideoOnly = false,
        smallViewBackgroundColor = '',
        largeViewBackgroundColor = '',
        smallViewBackgroundImage = '',
        largeViewBackgroundImage = '',
        smallViewPostion = 1,
        switchLargeOrSmallViewByClick = true,
    } = config;
    const {
        useVideoViewAspectFill = false,
        showSoundWavesInAudioMode = true,
    } = audioVideoConfig;

    const [localUserID, setLocalUserID] = useState('');
    const [remoteUserID, setRemoteUserID] = useState('');
    const [showMeOnSmallView, setShowMeOnSmallView] = useState(true);

    useEffect(() => {
        const callbackID = 'PictureInPictureLayout' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
        });
        ZegoUIKitInternal.onRoomStateChanged(callbackID, (reason, errorCode, extendedData) => {
            if (reason == 1 || reason == 4) {
                setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
            } else if (reason == 2 || reason == 5 || reason == 6 || reason == 7) {
                // ZegoRoomStateChangedReasonLoginFailed
                // ZegoRoomStateChangedReasonReconnectFailed
                // ZegoRoomStateChangedReasonKickOut
                // ZegoRoomStateChangedReasonLogout
                // ZegoRoomStateChangedReasonLogoutFailed
                setLocalUserID('');
                setRemoteUserID('');
            }
        })
        ZegoUIKitInternal.onUserJoin(callbackID, (userList) => {
            console.log('>>>>>>>>>>> join', userList)
            if (userList.length == 1) {
                setRemoteUserID(userList[0].userID);
            } else {
                //TODO
            }
        });
        ZegoUIKitInternal.onUserLeave(callbackID, (userList) => {
            console.log('<<<<<<<<<<<<<< leave', userList)
            if (userList.length == 1) {
                setRemoteUserID('');
            } else {
                //TODO
            }
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onRoomStateChanged(callbackID);
            ZegoUIKitInternal.onUserJoin(callbackID);
            ZegoUIKitInternal.onUserLeave(callbackID);
        }
    }, [])
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
        if (smallViewPostion >= 0 && smallViewPostion <= 3) {
            return styleList[smallViewPostion];
        } else {
            return styles.smallViewPostTopLeft;
        }
    }
    const getSmallViewBorderStyle = () => {
        if (showMeOnSmallView) {
            return localUserID ? styles.smallViewBorder : ''
        } else {
            return remoteUserID ? styles.smallViewBorder : ''
        }
    }
    const switchLargeOrSmallView = () => {
        if (switchLargeOrSmallViewByClick) {
            setShowMeOnSmallView(!showMeOnSmallView);
        }
    }

    return (<View style={styles.container}>

        <View  pointerEvents='auto' onTouchStart={switchLargeOrSmallView} style={[styles.smallView, getSmallViewPostStyle(), getSmallViewBorderStyle()]}>
            {showMeOnSmallView ?
                (localUserID ?
                    <ZegoAudioVideoView
                        key={localUserID}
                        userID={localUserID}
                        audioViewBackgroudColor={smallViewBackgroundColor}
                        audioViewBackgroudImage={smallViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                    /> :
                    <View />) :
                (remoteUserID ?
                    <ZegoAudioVideoView
                        key={remoteUserID}
                        userID={remoteUserID}
                        audioViewBackgroudColor={smallViewBackgroundColor}
                        audioViewBackgroudImage={smallViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                    /> :
                    <View />)
            }
        </View>
        <View style={styles.bigView}>
            {showMeOnSmallView ?
                (remoteUserID ?
                    <ZegoAudioVideoView
                        key={remoteUserID}
                        userID={remoteUserID}
                        audioViewBackgroudColor={largeViewBackgroundColor}
                        audioViewBackgroudImage={largeViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                    /> :
                    <View />) :
                (localUserID ?
                    <ZegoAudioVideoView
                        key={localUserID}
                        userID={localUserID}
                        audioViewBackgroudColor={largeViewBackgroundColor}
                        audioViewBackgroudImage={largeViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                    /> :
                    <View />)
            }
        </View>
    </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    emptyView: {
        backgroundColor: '#4A4B4D'
    },
    bigView: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#4A4B4D',
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
        overflow: 'hidden',
        backgroundColor: '#4A4B4D',
    },
    smallViewBorder: {
        borderWidth: 0.5,
        borderColor: '#A4A4A4',
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
    }
})