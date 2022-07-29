import React, { useEffect } from "react";
import { findNodeHandle, View, StyleSheet } from "react-native";
import { ZegoTextureView } from 'zego-express-engine-reactnative';
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";

export default function VideoFrame(props) {
    const { userID, roomID, fillMode } = props;
    const viewRef = React.createRef();

    const updateRenderingProperty = () => {

        const viewID = findNodeHandle(viewRef.current);
        ZegoUIKitInternal.updateRenderingProperty(userID, viewID, fillMode);
    }
    ZegoUIKitInternal.onSDKConnected('VideoContainer' + userID, () => {
        updateRenderingProperty();
    });
    ZegoUIKitInternal.onUserJoin('VideoContainer' + userID, (userInfoList) => {
        userInfoList.forEach(user => {
            if (user.userID == userID) {
                updateRenderingProperty()
            }
        })
    });
    useEffect(() => {
        updateRenderingProperty();
    }, []);

    return (
        <View style={styles.container}>
            <ZegoTextureView
                style={styles.videoContainer}
                ref={viewRef}
            />
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
        flex: 1,
        width: '100%',
        height: '100%',
        zIndex: 1,
    },
});