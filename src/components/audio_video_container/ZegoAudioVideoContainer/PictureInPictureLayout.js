import React, { useEffect, useState } from "react";
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import { StyleSheet, View } from 'react-native'
import { ZegoViewPostion } from './defines'

export default function PictureInPictureLayout(props) {
    const { config = {}, foregroundBuilder, audioVideoConfig = {}, sortAudioVideo } = props;
    const {
        isSmallViewDraggable = false, // TODO
        smallViewBackgroundColor = '',
        largeViewBackgroundColor = '',
        smallViewBackgroundImage = '',
        largeViewBackgroundImage = '',
        smallViewPostion = ZegoViewPostion.bottomRight,
        switchLargeOrSmallViewByClick = true,
        smallViewSize = { width: 105, height: '28%' },
        spacingBetweenSmallViews = 8,
    } = config;
    const {
        useVideoViewAspectFill = false,
        showSoundWavesInAudioMode = true,
    } = audioVideoConfig;

    const [globalAudioVideoUserList, setGlobalAudioVideoUserList] = useState([]);

    useEffect(() => {
        const callbackID = 'PictureInPictureLayout' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onAudioVideoAvailable(callbackID, (userList) => {
            console.log('<<<<<<<<<<<<<< onAudioVideoAvailable', userList)
            userList.forEach((user) => {
                const result = globalAudioVideoUserList.find((item) => user.userID === item.userID);
                if (!result) {
                    globalAudioVideoUserList.push(user);
                    setGlobalAudioVideoUserList((arr) => [...(sortAudioVideo ? sortAudioVideo(globalAudioVideoUserList) : globalAudioVideoUserList)]);
                }
            });
            console.log('<<<<<<<<<<<<<< globalAudioVideoUserList', globalAudioVideoUserList);
        });
        ZegoUIKitInternal.onAudioVideoUnavailable(callbackID, (userList) => {
            console.log('<<<<<<<<<<<<<< onAudioVideoUnavailable', userList)
            userList.forEach((user) => {
                const result = globalAudioVideoUserList.findIndex((item) => user.userID === item.userID);
                if (result !== -1) {
                    globalAudioVideoUserList.splice(result, 1);
                    setGlobalAudioVideoUserList((arr) => [...(sortAudioVideo ? sortAudioVideo(globalAudioVideoUserList) : globalAudioVideoUserList)]);
                }
            });
            console.log('<<<<<<<<<<<<<< globalAudioVideoUserList', globalAudioVideoUserList);
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onRoomStateChanged(callbackID);
            ZegoUIKitInternal.onUserJoin(callbackID);
            ZegoUIKitInternal.onUserLeave(callbackID);
            ZegoUIKitInternal.onAudioVideoAvailable(callbackID);
            ZegoUIKitInternal.onAudioVideoUnavailable(callbackID);
        }
    }, [])
    const getSmallViewPostStyle = () => {
        const styleList = [styles.smallViewPostTopLeft, styles.smallViewPostTopRight, styles.smallViewPostBottomLeft, styles.smallViewPostBottomRight];
        if (smallViewPostion >= ZegoViewPostion.topLeft && smallViewPostion <= ZegoViewPostion.bottomRight) {
            return styleList[smallViewPostion];
        } else {
            return styles.smallViewPostTopLeft;
        }
    }
    const switchLargeOrSmallView = (index, user) => {
        console.log('###########switchLargeOrSmallView', index, user, globalAudioVideoUserList, switchLargeOrSmallViewByClick);
        if (switchLargeOrSmallViewByClick) {
            globalAudioVideoUserList.splice(index + 1, 1);
            globalAudioVideoUserList.unshift(user);
            setGlobalAudioVideoUserList((arr) => [...globalAudioVideoUserList]);
        }
    }

    return (<View style={styles.container}>
        <View style={[styles.smallViewContainer, getSmallViewPostStyle()]}>
            {
                globalAudioVideoUserList.slice(1, 4).map((user, index) => <View
                    key={user.userID}
                    pointerEvents='auto'
                    onTouchStart={switchLargeOrSmallView.bind(this, index, user)}
                    style={[
                        styles.smallView,
                        styles.smallViewBorder,
                        getSmallViewSize(smallViewSize.width, smallViewSize.height).smallViewSize,
                        getSmallViewSpacing(spacingBetweenSmallViews).smallViewSpacing,
                    ]}>
                        <ZegoAudioVideoView
                            key={user.userID}
                            userID={user.userID}
                            audioViewBackgroudColor={smallViewBackgroundColor}
                            audioViewBackgroudImage={smallViewBackgroundImage}
                            showSoundWave={showSoundWavesInAudioMode}
                            useVideoViewAspectFill={useVideoViewAspectFill}
                            foregroundBuilder={foregroundBuilder}
                        />
                </View>)
            }
        </View>
        <View style={styles.bigView}>
            {globalAudioVideoUserList[0] ?
                <ZegoAudioVideoView
                    key={globalAudioVideoUserList[0].userID}
                    userID={globalAudioVideoUserList[0].userID}
                    audioViewBackgroudColor={largeViewBackgroundColor}
                    audioViewBackgroudImage={largeViewBackgroundImage}
                    showSoundWave={showSoundWavesInAudioMode}
                    useVideoViewAspectFill={useVideoViewAspectFill}
                    foregroundBuilder={foregroundBuilder}
                /> :
                <View />
            }
        </View>
    </View>)
}

const getSmallViewSize = (width, height) => StyleSheet.create({
    smallViewSize: {
        width,
        height,
    },
});
const getSmallViewSpacing = (margin) => StyleSheet.create({
    smallViewSpacing: {
        marginBottom: margin,
    },
});
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
        backgroundColor: '#4A4B4D',
        zIndex: 1,
    },
    smallViewContainer: {
        flex: 1,
        position: 'absolute',
        zIndex: 12,
        height: '80%',
    },
    smallView: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#4A4B4D',
    },
    smallViewBorder: {
        borderWidth: 0.5,
        borderColor: '#A4A4A4',
    },
    smallViewPostTopLeft: {
        top: 80,
        left: 12,
    },
    smallViewPostTopRight: {
        top: 80,
        right: 12,
    },
    smallViewPostBottomLeft: {
        bottom: 70,
        left: 12,
        justifyContent: 'flex-end'
    },
    smallViewPostBottomRight: {
        bottom: 70,
        right: 12,
        justifyContent: 'flex-end'
    }
})