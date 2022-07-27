import React, { useEffect } from "react";
import { findNodeHandle, View, StyleSheet } from "react-native";
import { ZegoTextureView } from 'zego-express-engine-reactnative';
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";

export default function VideoContainer(props) {
    const { userID, roomID, fillMode } = props;
    const viewRef = React.createRef();

    ZegoUIKitInternal.onSDKConnected('VideoContainer', () => {
        const viewID = findNodeHandle(viewRef.current);
        ZegoUIKitInternal.updateRenderingProperty(userID, viewID, fillMode);
    });
    useEffect(() => {
        const viewID = findNodeHandle(viewRef.current);
        ZegoUIKitInternal.updateRenderingProperty(userID, viewID, fillMode);
    }, [])
    return (<View style={styles.container}>
        <ZegoTextureView
            style={styles.videoContainer}
            ref={viewRef}
        />
    </View>);
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    videoContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        zIndex: 1,
    },
});