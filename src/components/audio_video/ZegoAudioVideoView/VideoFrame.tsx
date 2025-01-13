import React, { useCallback, useEffect, useRef } from "react";
import { findNodeHandle, LayoutChangeEvent, View, StyleSheet } from "react-native";
import ZegoExpressEngine, { ZegoTextureView } from 'zego-express-engine-reactnative';
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import { zloginfo } from "../../../utils/logger";

export default function VideoFrame(props: any) {
    const { userID, roomID, fillMode, isPictureInPicture, isScreenShare } = props;
    const textureViewRef = useRef(null);
    let textureViewID = -1;

    const updateRenderingProperty = () => {
        zloginfo(`[VideoFrame][updateRenderingProperty] isPictureInPicture: ${isPictureInPicture}`);
        const appOrientation = ZegoUIKitInternal.appOrientation();
        const user = ZegoUIKitInternal.getUser(userID);
        var newFillMode = fillMode;
        if (isPictureInPicture && user) {
          newFillMode = appOrientation === 0 ? Number(!user.isLandscape) : Number(user.isLandscape);
        }
        ZegoUIKitInternal.updateRenderingProperty(userID, textureViewID, undefined, newFillMode, isScreenShare);
    }

    const onTextureLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        zloginfo(`[VideoFrame][onTextureLayout] userID: ${userID}, textureViewID: ${textureViewID}, width: ${width}, height: ${height}`)

        if (width > 0 || height > 0) {
            try {
                ZegoExpressEngine.instance
                updateRenderingProperty();
            } catch (error) {
            }
        } else {
            // for FloatingMinimizedView
            ZegoUIKitInternal.updateRenderingProperty(userID, -1, textureViewID, fillMode, isScreenShare);
        }
    }, []);

    useEffect(() => {
        const callbackID = 'VideoFrame' + userID + String(Math.floor(Math.random() * 10000));
        textureViewID = findNodeHandle(textureViewRef.current)
        zloginfo(`[VideoFrame] useEffect, userID: ${userID}, viewID: ${textureViewID}, callbackID: ${callbackID}`)

        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            updateRenderingProperty();
        });
        ZegoUIKitInternal.onUserJoin(callbackID, (userInfoList: any[]) => {
            userInfoList.forEach(user => {
                if (user.userID == userID) {
                    updateRenderingProperty()
                }
            })
        });
        ZegoUIKitInternal.onVideoViewForceRender(callbackID, () => {
            updateRenderingProperty();
        });
        return () => {
            zloginfo(`[VideoFrame] useEffect return, viewID: ${textureViewID}`)

            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onUserJoin(callbackID);
            ZegoUIKitInternal.onVideoViewForceRender(callbackID);
            // for normal view
            ZegoUIKitInternal.updateRenderingProperty(userID, -1, textureViewID, fillMode, isScreenShare);
        }
    }, []);

    return (
        <View style={styles.container}>
            <ZegoTextureView
                // @ts-ignore
                style={styles.videoContainer}
                ref={textureViewRef}
                collapsable={false}
                onLayout={onTextureLayout}
            />
            <View style={styles.audioContainer}>
                {props.children}
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    videoContainer: {
        // flex: 1,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        position: 'absolute',
        zIndex: 1,
    },
    audioContainer: {
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        position: 'absolute',
        zIndex: 2,
    }
});