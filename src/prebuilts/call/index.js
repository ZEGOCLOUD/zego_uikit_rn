import React, { useEffect, useState, useRef } from 'react';
import { PermissionsAndroid } from 'react-native';

import { StyleSheet, View, TouchableOpacity } from 'react-native';
import ZegoAudioVideoContainer from '../../components/audio_video_container/ZegoAudioVideoContainer';
import ZegoUIKit from '../../components/internal/ZegoUIKitInternal';
import AudioVideoForegroundView from './AudioVideoForegroundView';
import ZegoBottomBar from './ZegoBottomBar';
import ZegoMoreButton from './ZegoMoreButton';


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

    const [isMenubarVisable, setIsMenubarVidable] = useState(true);
    var hideCountdown = 5;

    const onFullPageTouch = () => {
        hideCountdown = 5;
        if (isMenubarVisable) {
            if (hideMenuBardByClick) {
                setIsMenubarVidable(false);
            }
        } else {
            setIsMenubarVidable(true);
        }
    }
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
            // ZegoUIKit.disconnectSDK();
        }
    }, []);

    function useInterval(callback, delay) {
        const savedCallback = useRef();

        useEffect(() => {
            savedCallback.current = callback;
        });

        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }


    useInterval(() => {
        hideCountdown--;
        if (hideCountdown <= 0) {
            hideCountdown = 5;
            if (hideMenuBarAutomatically) {
                setIsMenubarVidable(false);
            }
        }
    }, 1000);

    return (
        <View style={styles.container} >
            <View style={styles.fillParent} pointerEvents='auto' onTouchStart={onFullPageTouch}>
                <ZegoAudioVideoContainer style={[styles.avView, styles.fillParent]}
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
            </View>
            {isMenubarVisable ?
                <ZegoBottomBar
                    menuBarButtonsMaxCount={menuBarButtonsMaxCount}
                    menuBarButtons={menuBarButtons}
                    menuBarExtendedButtons={menuBarExtendedButtons}
                    onHangUp={onHangUp}
                    onHangUpConfirming={onHangUpConfirming}
                    turnOnCameraWhenJoining={turnOnCameraWhenJoining}
                    turnOnMicrophoneWhenJoining={turnOnMicrophoneWhenJoining}
                    useSpeakerWhenJoining={useSpeakerWhenJoining}
                    onMorePress={() => { hideCountdown = 5; }}
                /> :
                <View />
            }
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
    fillParent: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    avView: {
        flex: 1,
        zIndex: 2,
        right: 0,
        top: 0,
    },
});
