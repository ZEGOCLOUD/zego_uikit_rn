import React, { useEffect, useState, useRef } from 'react';
import { PermissionsAndroid, Image } from 'react-native';

import { StyleSheet, View } from 'react-native';
import ZegoUIKit, { ZegoLeaveButton, ZegoAudioVideoView } from '@zegocloud/zego-uikit-rn'
import AudioVideoForegroundView from './AudioVideoForegroundView';
import ZegoBottomBar from './ZegoBottomBar';

// https://github.com/react-native-community/hooks#usekeyboard
export default function ZegoUIKitPrebuiltLiveStreaming(props) {
    const {
        appID,
        appSign,
        userID,
        userName,
        liveID,
        config,
    } = props;
    const {
        showSoundWavesInAudioMode = true,

        turnOnCameraWhenJoining = true,
        turnOnMicrophoneWhenJoining = true,
        useSpeakerWhenJoining = true,

        showInRoomMessageButton = true,

        menuBarButtons = [0, 1, 2, 3],
        menuBarButtonsMaxCount = 5,
        menuBarExtendedButtons = [],

        foregroundBuilder,

        onLeaveLiveStreaming,
        onLeaveLiveStreamingConfirming
    } = config;

    const [hostID, setHostID] = useState((turnOnCameraWhenJoining || turnOnMicrophoneWhenJoining) ? userID : "");

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
        const callbackID = 'ZegoUIKitPrebuiltLiveStreaming' + String(Math.floor(Math.random() * 10000));
        ZegoUIKit.onAudioVideoAvailable(callbackID, (users) => {
            if (users.length > 0) {
                setHostID(users[0].userID);
            }
        });
        ZegoUIKit.onUserLeave(callbackID, (users) => {
            users.forEach(user => {
                if (user.userID == hostID) {
                    setHostID("");
                }
            })
        });
        return () => {
            ZegoUIKit.onAudioVideoAvailable(callbackID);
            ZegoUIKit.onUserLeave(callbackID);
        }
    }, [])
    useEffect(() => {
        ZegoUIKit.init(
            appID,
            appSign,
            { userID: userID, userName: userName }).then(() => {

                ZegoUIKit.turnCameraOn('', turnOnCameraWhenJoining);
                ZegoUIKit.turnMicrophoneOn('', turnOnMicrophoneWhenJoining);
                ZegoUIKit.setAudioOutputToSpeaker(useSpeakerWhenJoining);

                grantPermissions(() => {
                    ZegoUIKit.joinRoom(liveID);
                });

            });

        return () => {
            ZegoUIKit.leaveRoom();
        }
    }, []);

    return (
        <View style={styles.container} >
            <View style={styles.fillParent}>
                {hostID != "" ?
                    <ZegoAudioVideoView
                        userID={hostID}
                        foregroundBuilder={foregroundBuilder ? foregroundBuilder : ({ userInfo }) => <View />}
                        useVideoViewAspectFill={true}
                        showSoundWave={showSoundWavesInAudioMode}
                    /> :
                    <View style={styles.fillParent}>
                        <Image source={require('./resources/background.png')} style={styles.fillParent} />
                    </View>}
            </View>
            <ZegoBottomBar
                menuBarButtonsMaxCount={menuBarButtonsMaxCount}
                menuBarButtons={menuBarButtons}
                menuBarExtendedButtons={menuBarExtendedButtons}
                turnOnCameraWhenJoining={turnOnCameraWhenJoining}
                turnOnMicrophoneWhenJoining={turnOnMicrophoneWhenJoining}
                useSpeakerWhenJoining={useSpeakerWhenJoining}
                showInRoomMessageButton={showInRoomMessageButton}
                onLeaveLiveStreaming={onLeaveLiveStreaming}
                onLeaveLiveStreamingConfirming={onLeaveLiveStreamingConfirming}
            />

            <View style={styles.leaveButton} >
                <ZegoLeaveButton
                    style={styles.fillParent}
                    onLeaveConfirmation={onLeaveLiveStreamingConfirming}
                    onPressed={onLeaveLiveStreaming}
                    iconLeave={require('./resources/white_top_button_close.png')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        width: "100%",
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
    },
    fillParent: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    leaveButton: {
        position: 'absolute',
        top: 32,
        right: 10
    }
});
