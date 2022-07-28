import React, { useEffect } from 'react';
import { useId } from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import ZegoUIKit, {
    ZegoAudioVideoContainer,
    ZegoToggleCameraButton,
    ZegoToggleMicrophoneButton,
    ZegoQuitButton,

} from 'react-native-zego-uikit-rn';

export default function CallPage(props) {
    const { route } = props;
    const { params } = route;
    const { userID, userName } = params;

    useEffect(() => {
        ZegoUIKit.connectSDK(
            1484647939,
            '16e1c2b4d4c6345c8644546e8fe636d8b7e47d010e9b4a8825439ecd64ccee6f',
            { userID: userID, userName: userName }).then(() => {
                ZegoUIKit.joinRoom('123456')
            });

        return () => {
            ZegoUIKit.disconnectSDK();
        }
    }, []);

    return (
        <View style={styles.container}>
            <ZegoAudioVideoContainer style={styles.avView} config={{ fillMode: 1 }} />
            <View style={styles.ctrlBar}>
                <ZegoToggleCameraButton style={styles.ctrlBtn} />
                <ZegoToggleMicrophoneButton style={styles.ctrlBtn} />
                <ZegoQuitButton onPostQuit={() => {props.navigation.navigate('HomePage')}} />
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
