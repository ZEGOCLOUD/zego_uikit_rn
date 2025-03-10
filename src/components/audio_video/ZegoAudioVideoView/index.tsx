import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Delegate from 'react-delegate-component';
import AudioFrame from './AudioFrame';
import VideoFrame from './VideoFrame';
import ZegoUIKitInternal from '../../internal/ZegoUIKitInternal';
import { zloginfo } from '../../../utils/logger';

function MaskViewDefault(props: any) {
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

export default function ZegoVideoView(props: any) {
  const {
    userID,
    roomID,
    audioViewBackgroudColor,
    audioViewBackgroudImage,
    showSoundWave = true,
    useVideoViewAspectFill = false,
    foregroundBuilder,
    avatarSize,
    avatarAlignment = 0,
    avatarBuilder,
    avatarBackgroundColor,
    soundWaveColor,
    isPictureInPicture,
  } = props;

  const [userInfo, setUserInfo] = useState({});
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [propsData, setPropsData] = useState({ userInfo: {} });
  const userInfo_ = ZegoUIKitInternal.getUser(userID);
  const inRoomAttributes = userInfo_ ? userInfo_.inRoomAttributes : {};
  const [avatar, setAvatarUrl] = useState(inRoomAttributes ? (inRoomAttributes.avatar || '') : '');

  useEffect(() => {
    const user = ZegoUIKitInternal.getUser(userID);
    if (user) {
      setUserInfo(user);
      setPropsData({ userInfo: user });
      setIsCameraOn(user.isCameraDeviceOn);
    }
  }, []);

  useEffect(() => {
    const callbackID = 'ZegoVideoView' + String(userID) + String(Math.floor(Math.random() * 10000));

    ZegoUIKitInternal.onSDKConnected(callbackID, () => {
      const user = ZegoUIKitInternal.getUser(userID);
      if (user) {
        setUserInfo(user);
        setPropsData({ userInfo: user });
        setIsCameraOn(user.isCameraDeviceOn);
      }
    });
    ZegoUIKitInternal.onUserInfoUpdate(callbackID, (info: any) => {
      if (info.userID == userID) {
        setIsCameraOn(info.isCameraDeviceOn);
        setUserInfo(info);
        setPropsData({ userInfo: info });
      }
    });
    ZegoUIKitInternal.onRoomStateChanged(
      callbackID,
      () => {
        if (ZegoUIKitInternal.isRoomConnected()) {
          const user = ZegoUIKitInternal.getUser(userID);
          if (user) {
            setIsCameraOn(user.isCameraDeviceOn);
          }
        }
      }
    );
    ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID, (userList: any[]) => {
      zloginfo('=========[ZegoVideoView]onUserCountOrPropertyChanged=========', userID, userList);
      userList.forEach((user) => {
        const temp = user.inRoomAttributes ? user.inRoomAttributes.avatar : '';
        if (user.userID === userID && temp) {
          setAvatarUrl(temp);
        }
      });
    });
    return () => {
      ZegoUIKitInternal.onSDKConnected(callbackID);
      ZegoUIKitInternal.onUserInfoUpdate(callbackID);
      ZegoUIKitInternal.onRoomStateChanged(callbackID);
      ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID);
    };
  }, []);

  return (
    <View style={styles.container}>
      <VideoFrame
        style={styles.videoContainer}
        userID={userID}
        roomID={roomID}
        isPictureInPicture={isPictureInPicture}
        fillMode={useVideoViewAspectFill ? 1 : 0} // 1:AspectFill, 0:AspectFit
      >
        {!isCameraOn ? (
          <AudioFrame
            userInfo={userInfo}
            showSoundWave={showSoundWave}
            audioViewBackgroudColor={audioViewBackgroudColor}
            audioViewBackgroudImage={audioViewBackgroudImage}
            avatar={avatar}
            avatarSize={avatarSize}
            avatarAlignment={avatarAlignment}
            avatarBuilder={avatarBuilder}
            avatarBackgroundColor={avatarBackgroundColor}
            soundWaveColor={soundWaveColor}
          />
        ) : null}
      </VideoFrame>

      <Delegate
        style={styles.mask}
        to={foregroundBuilder}
        default={MaskViewDefault}
        props={propsData}
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
    zIndex: 2,
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
