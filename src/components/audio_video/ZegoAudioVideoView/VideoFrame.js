import React, { useEffect, useRef } from "react";
import { findNodeHandle, View, StyleSheet } from "react-native";
import { ZegoTextureView } from 'zego-express-engine-reactnative';
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";

export default function VideoFrame(props) {
    const { userID, roomID, fillMode, isPlayingAudioStreamOnly = false } = props;
    const viewRef = useRef(null);

    const updateRenderingProperty = () => {
        const viewID = findNodeHandle(viewRef.current);
        ZegoUIKitInternal.updateRenderingProperty(userID, viewID, fillMode, isPlayingAudioStreamOnly);
    }
    useEffect(() => {
        updateRenderingProperty();

        ZegoUIKitInternal.onSDKConnected('VideoFrame' + userID, () => {
            updateRenderingProperty();
        });
        ZegoUIKitInternal.onUserJoin('VideoFrame' + userID, (userInfoList) => {
            userInfoList.forEach(user => {
                if (user.userID == userID) {
                    updateRenderingProperty()
                }
            })
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected('VideoFrame' + userID);
            ZegoUIKitInternal.onUserJoin('VideoFrame' + userID);
            ZegoUIKitInternal.updateRenderingProperty(userID, -1, fillMode, isPlayingAudioStreamOnly);
        }
    }, []);

    return (
        <View style={styles.container}>
            <ZegoTextureView
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