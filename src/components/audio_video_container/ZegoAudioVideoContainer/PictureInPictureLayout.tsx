import React, { useEffect, useState, useRef } from "react";
import { Dimensions, PanResponder, SafeAreaView, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import { ZegoViewPosition } from './defines'
import { zloginfo } from "../../../utils/logger";

export default function PictureInPictureLayout(props: any) {
    const { 
      config = {}, 
      foregroundBuilder, 
      audioVideoConfig = {}, 
      sortAudioVideo,
      avatarBuilder
    } = props;
    const {
        isSmallViewDraggable = false, // TODO
        smallViewBackgroundColor = '',
        largeViewBackgroundColor = '',
        smallViewBackgroundImage = '',
        largeViewBackgroundImage = '',
        smallViewPostion = ZegoViewPosition.bottomRight,
        switchLargeOrSmallViewByClick = true,
        smallViewSize = { width: 85, height: 151 },
        spacingBetweenSmallViews = 8,
        removeViewWhenAudioVideoUnavailable = false,
        smallViewBorderRadius = 10,
    } = config;
    const {
        useVideoViewAspectFill = false,
        showSoundWavesInAudioMode = true,
        cacheAudioVideoUserList,
    } = audioVideoConfig;

    const { height: screenHeight } = Dimensions.get('window');

    const realTimeData: any = useRef(cacheAudioVideoUserList || []);
    const [globalAudioVideoUserList, setGlobalAudioVideoUserList] = useState(cacheAudioVideoUserList || []);

    const panResponder = useRef(PanResponder.create({
        // @ts-ignore
        onStartShouldSetPanResponderCapture: () => {
            zloginfo('Switch the big screen');
        }
    })).current;

    useEffect(() => {
        zloginfo(`[PictureInPictureLayout] useEffect`)

        zloginfo('########cacheAudioVideoUserList########', cacheAudioVideoUserList);
        const callbackID = 'PictureInPictureLayout' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onAudioVideoAvailable(callbackID, (userList: any[]) => {
            userList.forEach((user) => {
                const result = realTimeData.current.find((item: any) => user.userID === item.userID);
                if (!result) {
                    realTimeData.current.push(user);
                    setGlobalAudioVideoUserList(() => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
                }
            });
        });
        ZegoUIKitInternal.onAudioVideoUnavailable(callbackID, (userList: any[]) => {
            if (removeViewWhenAudioVideoUnavailable) {
                userList.forEach((user) => {
                    const result = realTimeData.current.findIndex((item: any) => user.userID === item.userID);
                    if (result !== -1) {
                        realTimeData.current.splice(result, 1);
                        setGlobalAudioVideoUserList(() => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
                    }
                });
            }
        });
        ZegoUIKitInternal.onAudioVideoListForceSort(callbackID, () => {
            setGlobalAudioVideoUserList(() => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
        });
        ZegoUIKitInternal.onVideoViewForceRender(callbackID, () => {
          setGlobalAudioVideoUserList([...realTimeData.current]);
        });
        ZegoUIKitInternal.onUserLeave(callbackID, (userList: any[]) => {
            if (!removeViewWhenAudioVideoUnavailable) {
                userList.forEach((user) => {
                    const result = realTimeData.current.findIndex((item: any) => user.userID === item.userID);
                    if (result !== -1) {
                        realTimeData.current.splice(result, 1);
                        setGlobalAudioVideoUserList(() => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
                    }
                });
            }
        });
        return () => {
            zloginfo(`[PictureInPictureLayout] useEffect return`)

            ZegoUIKitInternal.onAudioVideoListForceSort(callbackID);
            ZegoUIKitInternal.onVideoViewForceRender(callbackID);
            ZegoUIKitInternal.onAudioVideoAvailable(callbackID);
            ZegoUIKitInternal.onAudioVideoUnavailable(callbackID);
            ZegoUIKitInternal.onUserLeave(callbackID);
        }
    }, [])

    useEffect(() => {
        let userIDInGlobalAudioVideoUserList = globalAudioVideoUserList.map((userInfo: any) => userInfo.userID)
        zloginfo(`[PictureInPictureLayout] globalAudioVideoUserList updated: ${userIDInGlobalAudioVideoUserList}`)
    }, [globalAudioVideoUserList])

    const getSmallViewPostStyle = () => {
        const styleList = [styles.smallViewPostTopLeft, styles.smallViewPostTopRight, styles.smallViewPostBottomLeft, styles.smallViewPostBottomRight];
        if (smallViewPostion >= ZegoViewPosition.topLeft && smallViewPostion <= ZegoViewPosition.bottomRight) {
            return styleList[smallViewPostion];
        } else {
            return styles.smallViewPostTopLeft;
        }
    }
    const switchLargeOrSmallView = (index: number) => {
        if (switchLargeOrSmallViewByClick) {
            globalAudioVideoUserList[0] = globalAudioVideoUserList.splice(index + 1, 1, globalAudioVideoUserList[0])[0];
            setGlobalAudioVideoUserList(() => [...globalAudioVideoUserList]);
            realTimeData.current = globalAudioVideoUserList;
        }
    }
    const layoutHandle = (event: any) => {
        const { nativeEvent } = event;
        const { layout } = nativeEvent;
        const { width, height, x, y } = layout;
        // zloginfo('######layoutHandle', layout);
    }

    return (<View style={styles.container}>
        <ScrollView 
            style={[styles.smallViewContainer, getSmallViewPostStyle(), {maxHeight: screenHeight-80-100}]} 
            contentContainerStyle={ smallViewPostion >= ZegoViewPosition.bottomLeft ? {justifyContent: 'flex-end', alignItems: 'flex-end'} : null }
            onLayout={layoutHandle}>
            {
                globalAudioVideoUserList.slice(1).map((user: any, index: number) => <TouchableWithoutFeedback key={user.userID} {...panResponder.panHandlers} onPress={switchLargeOrSmallView.bind(this, index, user)}>
                  <SafeAreaView >
                    <View
                      key={user.userID}
                      style={[
                        styles.smallView,
                        styles.smallViewBorder,
                        getSmallViewSize(user, smallViewSize.width, smallViewSize.height).smallViewSize,
                        getSmallViewSpacing(spacingBetweenSmallViews).smallViewSpacing,
                        getSmallViewBorderRadius(smallViewBorderRadius).smallViewBorderRadius,
                      ]}>
                        <ZegoAudioVideoView
                            userID={user.userID}
                            audioViewBackgroudColor={smallViewBackgroundColor}
                            audioViewBackgroudImage={smallViewBackgroundImage}
                            showSoundWave={showSoundWavesInAudioMode}
                            useVideoViewAspectFill={useVideoViewAspectFill}
                            foregroundBuilder={foregroundBuilder}
                            avatarBuilder={avatarBuilder}
                            isPictureInPicture={true}
                        />
                    </View>
                  </SafeAreaView>
                </TouchableWithoutFeedback>)
            }
        </ScrollView>
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
                    avatarBuilder={avatarBuilder}
                    isPictureInPicture={true}
                /> :
                <View />
            }
        </View>
    </View>)
}

const getSmallViewSize = (user: any, width: number, height: number) => {
  return StyleSheet.create({
    smallViewSize: {
      width: user.isLandscape ? height : width,
      height: user.isLandscape ? width : height,
    },
  });
}
const getSmallViewSpacing = (margin: number) => StyleSheet.create({
    smallViewSpacing: {
        marginBottom: margin,
    },
});

const getSmallViewBorderRadius = (radius: number) => StyleSheet.create({
    smallViewBorderRadius: {
        borderRadius: radius,
    }
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
        // borderRadius: 10,
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
    },
    smallViewPostBottomRight: {
        bottom: 100,
        right: 12,
    }
})