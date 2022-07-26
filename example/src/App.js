import React, { useEffect } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import ZegoUIKit, {
  ZegoAudioVideoContainer,
  ZegoToggleCameraButton,
  ZegoToggleMicButton,
  ZegoMicStatusIcon,
  ZegoCameraStatusIcon
} from 'react-native-zego-uikit-rn';

export default function App() {
  useEffect(() => {
    ZegoUIKit.connectSDK(
      1484647939,
      '16e1c2b4d4c6345c8644546e8fe636d8b7e47d010e9b4a8825439ecd64ccee6f',
      { userID: 'oliver', userName: 'Oliver' }).then(() => {
        console.log('Try to join room...');
        ZegoUIKit.joinRoom('123456')
      });

    return () => {
      ZegoUIKit.disconnectSDK();
    }
  }, []);
  return (
    <View style={styles.container}>
      <ZegoAudioVideoContainer style={styles.avView} />
      <View style={styles.ctrlBar}>
        <ZegoToggleCameraButton />
        <ZegoToggleMicButton />
        <ZegoMicStatusIcon />
        <ZegoCameraStatusIcon />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avView: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  ctrlBar: {
    flex: 1,
    width: '100%',
    height: 50
  },
  ctrlBtn: {
    flex: 1,
    zIndex: 1,
  }
});
