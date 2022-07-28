import React, { useEffect } from 'react';
import { useId } from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';


export default function ZegoUIKitPrebuiltCall(props) {
    const {
        appID,
        appSign,
        userID,
        userName,
        roomID,
        config,
    } = props;
    const {
        showMicrophoneStateOnView = true,
        showCameraStateOnView = true,
        showUserNameOnView = true,
        soundWaveType = 1, // enum {none, aroundAvatar}
        showSelfViewWithVideoOnly = true,
        audioViewBackgroundColor = '#4A4B4D',
        audioViewBackgroundImage,
        smallViewDefaultPosition = 1, // enum { topLeft, topRight, bottomLeft, bottomRight }
        isSmallViewDraggable = false,
        turnOnCameraWhenJoining = true,
        turnOnMicrophoneWhenJoining = true,
        useSpeakerWhenJoining = false,
        menuBarButtonsLimitedCount = 5,
        menuBarButtons = [0, 1, 2], // enum { ZegoQuitButton, ZegoToggleCameraButton, ZegoToggleMicrophoneButton}
        menuBarExtendedButtons = [],
        isMenuBarHideAutomatically = true,
        isMenuBarHideByClick = true,
        onPreQuit, // Call before do quit operation
        onPostQuit, // Call after quitted
        quitConfirmDialogInfo = {}, // {title: '', cancelButtonName: '', confirmButtonName: ''}
        foregroundBuilder,
    } = config;

    return (
        <View style={styles.container}>
            <ZegoAudioVideoContainer style={styles.avView}
                config={{ fillMode: 1 }}
            />
            <View style={styles.ctrlBar}>
                <ZegoToggleCameraButton />
                <ZegoToggleMicButton />
                <ZegoQuitButton onPreQuit={onPreQuit} onPostQuit={onPostQuit} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
    },
    avView: {
        flex: 1,
        width: '100%',
        height: '100%',
        zIndex: 1,
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'red'
    },
    ctrlBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 50,
        width: '100%',
        height: 50,
        zIndex: 2
    },
    ctrlBtn: {
        flex: 1,
        width: 48,
        height: 48,
        marginLeft: 37 / 2,
        position: 'absolute'
    }
});
