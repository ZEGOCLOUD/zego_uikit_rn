import React, { useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';

import { StyleSheet, View, Text, Button } from 'react-native';
import ZegoQuitButton from '../../components/audio_video/ZegoQuitButton';
import ZegoSwitchAudioOutputButton from '../../components/audio_video/ZegoSwitchAudioOutputButton';
import ZegoSwitchCameraFacingButton from '../../components/audio_video/ZegoSwitchCameraFacingButton';
import ZegoToggleCameraButton from '../../components/audio_video/ZegoToggleCameraButton';
import ZegoToggleMicrophoneButton from '../../components/audio_video/ZegoToggleMicrophoneButton';
import ZegoAudioVideoContainer from '../../components/audio_video_container/ZegoAudioVideoContainer';
import ZegoUIKit from '../../components/internal/ZegoUIKitInternal';
import AudioVideoForegroundView from './AudioVideoForegroundView';
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
        menuBarButtons = [0, 1, 2], // enum { ZegoQuitButton, ZegoToggleCameraButton, ZegoToggleMicrophoneButton}
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
    // enum ZegoMenuBarButtonName {
    //     hangUpButton,
    //     toggleCameraButton,
    //     toggleMicrophoneBUtton,
    //     swtichCameraFacingButton,
    //     swtichAudioOtputButton
    //     }
    const getButtonByButtonIndex = (buttonIndex) => {
        switch(buttonIndex)
        {
            case 0:
                return <ZegoQuitButton key={0} onLeaveConfirming={onHangUpConfirming} onPressed={onHangUp} />
            case 1:
                return <ZegoToggleCameraButton key={1} isOn={turnOnCameraWhenJoining} />;
            case 2:
                return <ZegoToggleMicrophoneButton key={2} isOn={turnOnMicrophoneWhenJoining} />;
            case 3:
                return <ZegoSwitchCameraFacingButton key={3}/>
            case 4:
                return <ZegoSwitchAudioOutputButton key={4}/>
        }
    }
    const getDisplayButtons = () => {
        var maxCount = menuBarButtonsMaxCount < 1 ? 1 : menuBarButtonsMaxCount;
        maxCount = maxCount > 5 ? 5 : maxCount;
        const needMoreButton = (menuBarButtons.length + menuBarExtendedButtons.length) > maxCount;
        const firstLevelButtons = [];
        const secondLevelButtons = [];
        menuBarButtons.forEach(buttonIndex => {
            const limitCount = needMoreButton ? maxCount - 1 : maxCount;
            if (firstLevelButtons.length < limitCount) {
                firstLevelButtons.push(getButtonByButtonIndex(buttonIndex));
            } else {
                secondLevelButtons.push(getButtonByButtonIndex(buttonIndex));
            }
        });
        menuBarExtendedButtons.forEach(button => {
            const limitCount = needMoreButton ? maxCount - 1 : maxCount;
            if (firstLevelButtons.length < limitCount) {
                firstLevelButtons.push(button);
            } else {
                secondLevelButtons.push(button);
            }
        });
        if (needMoreButton) {
            firstLevelButtons.push(<ZegoMoreButton onPressed={onMoreButtonPress}/>)
        }
        return {
            firstLevelButtons: firstLevelButtons,
            secondLevelButtons: secondLevelButtons
        }
    }
    const onMoreButtonPress = () => {
        // TODO
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
            <View style={styles.ctrlBar}>
                {getDisplayButtons()['firstLevelButtons']}
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
        justifyContent: 'space-around',
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
