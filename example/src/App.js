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
      <ZegoToggleCameraButton userID='oliver' />
      <ZegoToggleMicButton userID='oliver' />
      <ZegoMicStatusIcon userID='oliver' />
      <ZegoCameraStatusIcon userID='oliver' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
