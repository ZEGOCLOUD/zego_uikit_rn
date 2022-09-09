import React, { useEffect, useState, useRef } from 'react';
import { PermissionsAndroid, Alert } from 'react-native';

import { StyleSheet, View } from 'react-native';
import ZegoUIKit, { ZegoAudioVideoContainer, ZegoAudioVideoView } from '@zegocloud/zego-uikit-rn'
import AudioVideoForegroundView from './AudioVideoForegroundView';
import ZegoBottomBar from './ZegoBottomBar';


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

        menuBarButtons = [0, 1, 2, 3, 4],
        menuBarButtonsMaxCount = 5,
        menuBarExtendedButtons = [],

        foregroundBuilder,

        onLeaveLiveStreaming,
        onLeaveLiveStreamingConfirming
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
        const callbackID = 'ZegoUIKitPrebuiltLiveStreaming' + String(Math.floor(Math.random() * 10000));
        ZegoUIKit.onOnlySelfInRoom(callbackID, () => {
            if (typeof onOnlySelfInRoom == 'function') {
                onOnlySelfInRoom();
            }
        });
        return () => {
            ZegoUIKit.onOnlySelfInRoom(callbackID);
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
                <ZegoAudioVideoView
                    userID={userID}
                    foregroundBuilder={foregroundBuilder}
                    useVideoViewAspectFill={true}
                />
            </View>
            <ZegoBottomBar
                menuBarButtonsMaxCount={menuBarButtonsMaxCount}
                menuBarButtons={menuBarButtons}
                menuBarExtendedButtons={menuBarExtendedButtons}
                onLeaveLiveStreaming={onLeaveLiveStreaming}
                onLeaveLiveStreamingConfirming={onLeaveLiveStreamingConfirming}
                turnOnCameraWhenJoining={turnOnCameraWhenJoining}
                turnOnMicrophoneWhenJoining={turnOnMicrophoneWhenJoining}
                useSpeakerWhenJoining={useSpeakerWhenJoining}
                showInRoomMessageButton={showInRoomMessageButton}
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
