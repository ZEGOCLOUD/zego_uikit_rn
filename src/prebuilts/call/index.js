import React, { useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';

import { StyleSheet, View, Text, Button } from 'react-native';
import ZegoAudioVideoContainer from '../../components/audio_video_container/ZegoAudioVideoContainer';
import ZegoUIKit from '../../components/internal/ZegoUIKitInternal';
import AudioVideoForegroundView from './AudioVideoForegroundView';
import ZegoBottomBar from './ZegoBottomBar';


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
        showCameraStateOnView = false,
        showUserNameOnView = true,
        showSoundWaveOnAudioView = true,
        useVideoViewAspectFill = true,
        turnOnCameraWhenJoining = true,
        turnOnMicrophoneWhenJoining = true,
        useSpeakerWhenJoining = false,
        layout = {},
        menuBarButtonsMaxCount = 5,
        menuBarButtons = [0, 1, 2, 3], // enum { ZegoQuitButton, ZegoToggleCameraButton, ZegoToggleMicrophoneButton}
        menuBarExtendedButtons = [],
        hideMenuBarAutomatically = true,
        hideMenuBardByClick = true,
        showHangUpConfirmDialog = false,
        hangUpConfirmDialogInfo = {}, // {title: '', cancelButtonName: '', confirmButtonName: ''}
        onHangUp,
        onHangUpConfirming,
        foregroundBuilder,
    } = config;

    const grantPermissions = async (callback) => {
        // Android: Dynamically obtaining device permissions
        if (Platform.OS === 'android') {
            // Check if permission granted
            let grantedAudio = PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            );
            let grantedCamera = PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.CAMERA,
            );
            const ungrantedPermissions = [];
            try {
                const isAudioGranted = await grantedAudio;
                const isVideoGranted = await grantedCamera;
                if (!isAudioGranted) {
                    ungrantedPermissions.push(
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    );
                }
                if (!isVideoGranted) {
                    ungrantedPermissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
                }
            } catch (error) {
                ungrantedPermissions.push(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                );
            }
            // If not, request it
            return PermissionsAndroid.requestMultiple(ungrantedPermissions).then(
                data => {
                    console.warn('requestMultiple', data);
                    if (callback) {
                        callback();
                    }
                },
            );
        } else if (callback) {
            callback();
        }
    }

    useEffect(() => {
        ZegoUIKit.connectSDK(
            appID,
            appSign,
            { userID: userID, userName: userName }).then(() => {
                grantPermissions(() => {
                    ZegoUIKit.joinRoom(roomID);
                });
            });

        return () => {
            ZegoUIKit.disconnectSDK();
        }
    }, []);

    return (
        <View style={styles.container}>
            <ZegoAudioVideoContainer style={styles.avView}
                audioVideoConfig={{
                    showSoundWaveOnAudioView: showSoundWaveOnAudioView,
                    useVideoViewAspectFill: useVideoViewAspectFill,
                }}
                layout={layout}
                foregroundBuilder={foregroundBuilder ? foregroundBuilder : ({ userInfo }) =>
                    <AudioVideoForegroundView
                        userInfo={userInfo}
                        showMicrophoneStateOnView={showMicrophoneStateOnView}
                        showCameraStateOnView={showCameraStateOnView}
                        showUserNameOnView={showUserNameOnView}
                    />
                }
            />
            <ZegoBottomBar 
                menuBarButtonsMaxCount={menuBarButtonsMaxCount}
                menuBarButtons={menuBarButtons}
                menuBarExtendedButtons={menuBarExtendedButtons}
                onHangUp={onHangUp}
                onHangUpConfirming={onHangUpConfirming}
                turnOnCameraWhenJoining={turnOnCameraWhenJoining}
                turnOnMicrophoneWhenJoining={turnOnMicrophoneWhenJoining}
                useSpeakerWhenJoining={useSpeakerWhenJoining}
            />
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
    },
    ctrlBar: {
        flex: 1,
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 50,
        width: '100%',
        bottom: 0,
        height: 50,
        zIndex: 2
    },
    ctrlBtn: {
        marginLeft: 5,
        marginRight: 5,
    }
});
