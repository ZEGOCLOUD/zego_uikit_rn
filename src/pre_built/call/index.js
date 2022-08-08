import React, { useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';

import { StyleSheet, View, Text, Button } from 'react-native';
import ZegoQuitButton from '../../components/audio_video/ZegoQuitButton';
import ZegoToggleCameraButton from '../../components/audio_video/ZegoToggleCameraButton';
import ZegoToggleMicrophoneButton from '../../components/audio_video/ZegoToggleMicrophoneButton';
import ZegoAudioVideoContainer from '../../components/layout/ZegoAudioVideoContainer';
import ZegoUIKit from '../../core/internal/ZegoUIKitInternal';
import AudioVideoForegroundView from './AudioVideoForegroundView';


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

    grantPermissions = async (callback) => {
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
                layoutMode={0} // P-i-P
                layoutConfig={{
                    videoFillMode: 1,
                    soundWaveType: soundWaveType,
                    showSelfViewWithVideoOnly: showSelfViewWithVideoOnly,
                    audioViewBackgroundColor: audioViewBackgroundColor,
                    audioViewBackgroundImage: audioViewBackgroundImage,
                    smallViewDefaultPosition: smallViewDefaultPosition,
                    isSmallViewDraggable: isSmallViewDraggable,
                }}
                foregroundBuilder={foregroundBuilder ? foregroundBuilder : ({ userInfo }) =>
                    <AudioVideoForegroundView
                        userInfo={userInfo}
                        showMicrophoneStateOnView={showMicrophoneStateOnView}
                        showCameraStateOnView={showCameraStateOnView}
                        showUserNameOnView={showUserNameOnView}
                    />
                }
            />
            <View style={styles.ctrlBar}>
                <ZegoToggleCameraButton isOn={turnOnCameraWhenJoining} />
                <ZegoToggleMicrophoneButton style={styles.ctrlBtn} isOn={turnOnMicrophoneWhenJoining} />
                <ZegoQuitButton style={styles.ctrlBtn} onPreQuit={onPreQuit} onPostQuit={onPostQuit} />
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
        flex: 1,
        width: 48,
        height: 48,
        padding: 0,
        // position: 'absolute',
    }
});
