import React, { useEffect } from 'react';
import { useId } from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import ZegoUIKit, {
    ZegoUIKitPrebuiltCall

} from 'zego-uikit-rn';
import KeyCenter from './KeyCenter';
// import ZegoUIKit, {ZegoToggleCameraButton} from @zego-uikit/components-rn
// import {ZegoUIKitPrebuiltCall} from @zego-uikit/prebuilt-call-rn

export default function VoiceCallPage(props) {
    const { route } = props;
    const { params } = route;
    const { userID, userName, callID } = params;

    return (
        <View style={styles.container}>
            <ZegoUIKitPrebuiltCall
                appID={KeyCenter.appID}
                appSign={KeyCenter.appSign}
                userID={userID}
                userName={userName}
                callID={callID}

                config={{
                    onHangUp: () => { props.navigation.navigate('HomePage') },
                    menuBarButtons: [2, 0, 4],
                    turnOnCameraWhenJoining: false,
                }}
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
