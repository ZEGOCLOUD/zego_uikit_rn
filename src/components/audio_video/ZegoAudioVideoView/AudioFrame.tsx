import { View, StyleSheet, Text, ImageBackground, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import ZegoUIKitInternal from '../../internal/ZegoUIKitInternal';
import Delegate from 'react-delegate-component';
import { zloginfo } from '../../../utils/logger';

const defaultAvatarSizeRatio = 129 / 375;
const flexStyle = ['center', 'flex-start', 'flex-end'];

export default function AudioFrame(props: any) {
  const {
    userInfo,
    showSoundWave,
    audioViewBackgroudColor,
    audioViewBackgroudImage,
    avatarBackgroundColor = '#DBDDE3',
    avatarSize,
    avatarAlignment,
    avatarBuilder,
    soundWaveColor = '#6B6A71',
    avatar = '',
  } = props;

  const [soundLevel, setSoundLevel] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoadError, setIsLoadError] = useState(false);

  const getShortName = (name: string) => {
    if (!name) {
      return '';
    }
    const nl = name.split(' ');
    var shotName = '';
    nl.forEach((part) => {
      if (part !== '') {
        shotName += part.substring(0, 1);
      }
    });
    return shotName;
  };

  useEffect(() => {
    const callbackID = 'AudioFrame' + userInfo.userID + String(Math.floor(Math.random() * 10000));
    ZegoUIKitInternal.onSoundLevelUpdate(
      callbackID,
      (userID: string, soundLevel: number) => {
        if (userInfo.userID == userID) {
          setSoundLevel(soundLevel);
        }
      }
    );

    return () => {
      ZegoUIKitInternal.onSoundLevelUpdate(callbackID);
    };
  }, []);

  return (
    <View
      style={
        cstyle(audioViewBackgroudColor ? audioViewBackgroudColor : '#4A4B4D')
          .container
      }
      onLayout={(event) => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        });
      }}
    >
      <ImageBackground
        source={
          audioViewBackgroudImage ? { uri: audioViewBackgroudImage } : require('../../internal/resources/pure_4a4b4d.png')
        }
        resizeMode="cover"
        style={[
          styles.imgBackground,
          // @ts-ignore
          { justifyContent: flexStyle[avatarAlignment] },
        ]}
      >
        {showSoundWave && soundLevel > 5 ? (
          <View
            style={
              waveStyle(
                (avatarSize
                  ? avatarSize.width
                  : defaultAvatarSizeRatio * dimensions.width) +
                  0.04 * dimensions.width,
                soundWaveColor,
                1
              ).circleWave
            }
          >
            {soundLevel > 10 ? (
              <View
                style={
                  waveStyle(
                    (avatarSize
                      ? avatarSize.width
                      : defaultAvatarSizeRatio * dimensions.width) +
                      0.06 * dimensions.width,
                    soundWaveColor,
                    0.6
                  ).subCircleWave
                }
              />
            ) : null}
            {soundLevel > 15 ? (
              <View
                style={
                  waveStyle(
                    (avatarSize
                      ? avatarSize.width
                      : defaultAvatarSizeRatio * dimensions.width) +
                      +0.08 * dimensions.width,
                    soundWaveColor,
                    0.3
                  ).subCircleWave
                }
              />
            ) : null}
          </View>
        ) : (
          <View />
        )}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: avatarBackgroundColor,
              width: avatarSize
                ? avatarSize.width
                : defaultAvatarSizeRatio * dimensions.width,
            },
          ]}
        >
          {
            !avatarBuilder ?
              (!avatar || isLoadError) ?
                <Text style={styles.nameLabel}>{getShortName(userInfo.userName)}</Text> :
                <Image 
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  resizeMode="contain"
                  source={{ uri: avatar }}
                  onLoadStart={() =>  zloginfo('avatar onLoadStart')}
                  onLoadEnd={() =>  zloginfo('avatar onLoadEnd')}
                  onError={() =>  { zloginfo('avatar onError'); setIsLoadError(true);}}
                  onLoad={() =>  { zloginfo('avatar onLoad'); setIsLoadError(false);}}
                />
              : <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', }}>
                {
                  (!avatar || isLoadError) ? <Text style={styles.nameLabel}>{getShortName(userInfo.userName)}</Text> : null
                }
                <Delegate
                  to={avatarBuilder}
                  props={{ userInfo: userInfo }}
                />
              </View>
          }
        </View>
      </ImageBackground>
    </View>
  );
}

const cstyle = (bgColor: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'absolute',
      justifyContent: 'center',
      backgroundColor: bgColor,
    },
  });
const waveStyle = (w: number, color: string, opacity: number) =>
  StyleSheet.create({
    circleWave: {
      flex: 1,
      position: 'absolute',
      alignSelf: 'center',
      width: w, //((w / 375) * 100).toString() + '%',
      aspectRatio: 1,
      borderRadius: 1000,
      backgroundColor: color,
      opacity: opacity,
      zIndex: 0,
      justifyContent: 'center',
      alignContent: 'center',
    },
    subCircleWave: {
      flex: 1,
      position: 'absolute',
      alignSelf: 'center',
      width: w, //((w / 164) * 100).toString() + '%',
      aspectRatio: 1,
      borderRadius: 1000,
      backgroundColor: color,
      opacity: opacity,
      zIndex: 0,
    },
  });
const styles = StyleSheet.create({
  imgBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  avatar: {
    flex: 1,
    marginTop: 1.5,
    marginBottom: 1.5,
    width: ((129 / 375) * 100).toString() + '%',
    aspectRatio: 1,
    borderRadius: 1000,
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    overflow: 'hidden',
  },
  nameLabel: {
    flex: 1,
    position: 'absolute',
    color: '#222222',
    fontSize: 22,
  },
});
