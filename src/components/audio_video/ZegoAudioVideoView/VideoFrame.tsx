import React, { useEffect, useRef } from "react";
import { findNodeHandle, View, StyleSheet } from "react-native";
import { ZegoTextureView } from 'zego-express-engine-reactnative';
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";

export default function VideoFrame(props: any) {
    const { userID, roomID, fillMode } = props;
    const viewRef = useRef(null);
    console.log('VideoFrame', userID);

    const updateRenderingProperty = () => {
        console.log('VideoFrame updateRenderingProperty');
        const viewID = findNodeHandle(viewRef.current);
        ZegoUIKitInternal.updateRenderingProperty(userID, viewID, fillMode);
    }
    useEffect(() => {
        updateRenderingProperty();

        const callbackID = 'VideoFrame' + userID + String(Math.floor(Math.random() * 10000));
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
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onUserJoin(callbackID);
            ZegoUIKitInternal.onVideoViewForceRender(callbackID);
            ZegoUIKitInternal.updateRenderingProperty(userID, -1, fillMode);
        }
    }, []);

    return (
        <View style={styles.container}>
            <ZegoTextureView
                // @ts-ignore
                style={styles.videoContainer}
                ref={viewRef}
                collapsable={false}
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