import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Delegate from 'react-delegate-component';
import AudioFrame from './AudioFrame';
import VideoFrame from './VideoFrame';
import ZegoUIKitInternal from '../../internal/ZegoUIKitInternal';

function MaskViewDefault(props) {
  const { userInfo } = props;
  const { userName = '' } = userInfo;
  return (
    <View style={styles.defaultMaskContainer}>
      <View style={styles.defaultMaskNameLabelContainer}>
        <Text style={styles.defaultMaskNameLabel}>{userName}</Text>
      </View>
    </View>
  );
}

export default function ZegoVideoView(props) {
  const {
    userID,
    roomID,
    audioViewBackgroudColor,
    audioViewBackgroudImage,
    showSoundWave = true,
    useVideoViewAspectFill = false,
    foregroundBuilder,
    avatarSize,
  } = props;

  const [userInfo, setUserInfo] = useState({});
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    const user = ZegoUIKitInternal.getUser(userID);
    if (user) {
      setUserInfo(user);
      setIsCameraOn(user.isCameraDeviceOn);
    }
    console.log('===audio video view ', user, userInfo);
  }, []);

  useEffect(() => {
    const callbackID = 'ZegoVideoView' + String(userID);

    ZegoUIKitInternal.onSDKConnected(callbackID, () => {
      const user = ZegoUIKitInternal.getUser(userID);
      if (user) {
        setUserInfo(user);
        setIsCameraOn(user.isCameraDeviceOn);
      }
    });
    ZegoUIKitInternal.onUserInfoUpdate(callbackID, (info) => {
      if (info.userID == userID) {
        setIsCameraOn(info.isCameraDeviceOn);
        setUserInfo(info);
      }
    });
    ZegoUIKitInternal.onRoomStateChanged(
      callbackID,
      (reason, errorCode, extendedData) => {
        if (ZegoUIKitInternal.isRoomConnected()) {
          const user = ZegoUIKitInternal.getUser(userID);
          if (user) {
            setIsCameraOn(user.isCameraDeviceOn);
          }
        }
      }
    );
    return () => {
      ZegoUIKitInternal.onSDKConnected(callbackID);
      ZegoUIKitInternal.onUserInfoUpdate(callbackID);
      ZegoUIKitInternal.onRoomStateChanged(callbackID);
    };
  }, []);
  return (
    <View style={styles.container}>
      <VideoFrame
        style={styles.videoContainer}
        userID={userID}
        roomID={roomID}
        fillMode={useVideoViewAspectFill ? 1 : 0} // 1:AspectFill, 0:AspectFit
      >
        {!isCameraOn ? (
          <AudioFrame
            userInfo={userInfo}
            showSoundWave={showSoundWave}
            audioViewBackgroudColor={audioViewBackgroudColor}
            audioViewBackgroudImage={audioViewBackgroudImage}
            avatarSize={avatarSize}
          />
        ) : null}
      </VideoFrame>

      <Delegate
        style={styles.mask}
        to={foregroundBuilder}
        default={MaskViewDefault}
        props={{ userInfo }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  mask: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 2,
  },
  defaultMaskContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  defaultMaskNameLabelContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    opacity: 0.5,
    position: 'absolute',
    alignSelf: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 3,
    paddingTop: 3,
    borderRadius: 6,
    bottom: 5,
    right: 5,
  },
  defaultMaskNameLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
});
