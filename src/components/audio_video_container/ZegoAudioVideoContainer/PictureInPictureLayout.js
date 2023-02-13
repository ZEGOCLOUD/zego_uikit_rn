import React, { useEffect, useState, useRef } from "react";
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import { StyleSheet, View, PanResponder, TouchableWithoutFeedback } from 'react-native'
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
        smallViewSize = { width: 85, height: 151 },
        spacingBetweenSmallViews = 8,
        removeViewWhenAudioVideoUnavailable = false,
    } = config;
    const {
        useVideoViewAspectFill = false,
        showSoundWavesInAudioMode = true,
    } = audioVideoConfig;
    const realTimeData = useRef();
    const [globalAudioVideoUserList, setGlobalAudioVideoUserList] = useState([]);
    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
            console.log('Switch the big screen');
        }
    })).current;

    useEffect(() => {
        realTimeData.current = [];
        const callbackID = 'PictureInPictureLayout' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onAudioVideoAvailable(callbackID, (userList) => {
            userList.forEach((user) => {
                const result = realTimeData.current.find((item) => user.userID === item.userID);
                if (!result) {
                    realTimeData.current.push(user);
                    setGlobalAudioVideoUserList((arr) => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
                }
            });
        });
        ZegoUIKitInternal.onAudioVideoUnavailable(callbackID, (userList) => {
            if (removeViewWhenAudioVideoUnavailable) {
                userList.forEach((user) => {
                    const result = realTimeData.current.findIndex((item) => user.userID === item.userID);
                    if (result !== -1) {
                        realTimeData.current.splice(result, 1);
                        setGlobalAudioVideoUserList((arr) => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
                    }
                });
            }
        });
        ZegoUIKitInternal.onAudioVideoListForceSort(callbackID, () => {
            setGlobalAudioVideoUserList((arr) => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
        });
        ZegoUIKitInternal.onUserLeave(callbackID, (userList) => {
            if (!removeViewWhenAudioVideoUnavailable) {
                userList.forEach((user) => {
                    const result = realTimeData.current.findIndex((item) => user.userID === item.userID);
                    if (result !== -1) {
                        realTimeData.current.splice(result, 1);
                        setGlobalAudioVideoUserList((arr) => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
                    }
                });
            }
        });
        return () => {
            ZegoUIKitInternal.onAudioVideoListForceSort(callbackID);
            ZegoUIKitInternal.onAudioVideoAvailable(callbackID);
            ZegoUIKitInternal.onAudioVideoUnavailable(callbackID);
            ZegoUIKitInternal.onUserLeave(callbackID);
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
        if (switchLargeOrSmallViewByClick) {
            globalAudioVideoUserList[0] = globalAudioVideoUserList.splice(index + 1, 1, globalAudioVideoUserList[0])[0];
            setGlobalAudioVideoUserList((arr) => [...globalAudioVideoUserList]);
            realTimeData.current = globalAudioVideoUserList;
        }
    }
    const layoutHandle = (event) => {
        const { nativeEvent } = event;
        const { layout } = nativeEvent;
        const { width, height, x, y } = layout;
        console.log('######layoutHandle', layout);
    }

    return (<View style={styles.container}>
        <View style={[styles.smallViewContainer, getSmallViewPostStyle()]} onLayout={layoutHandle}>
            {
                globalAudioVideoUserList.slice(1, 4).map((user, index) => <TouchableWithoutFeedback {...panResponder.panHandlers} onPress={switchLargeOrSmallView.bind(this, index, user)}><View
                    key={user.userID}
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
                </View></TouchableWithoutFeedback>)
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
        // height: '76%',
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
        bottom: 100,
        left: 12,
        justifyContent: 'flex-end'
    },
    smallViewPostBottomRight: {
        bottom: 100,
        right: 12,
        justifyContent: 'flex-end'
    }
})