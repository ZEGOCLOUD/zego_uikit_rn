import { View, StyleSheet, Text, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react';
import ZegoUIKitInternal from '../../internal/ZegoUIKitInternal';

export default function AudioFrame(props) {
  const {
    userInfo,
    showSoundWave,
    audioViewBackgroudColor,
    audioViewBackgroudImage,
    avatarSize,
    soundWaveColor = '#6B6A71',
  } = props;

  const [hasSound, setHasSound] = useState(false);

  const getShotName = (name) => {
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
    ZegoUIKitInternal.onSoundLevelUpdate(
      'AudioFrame' + userInfo.userID,
      (userID, soundLevel) => {
        if (userInfo.userID == userID) {
          setHasSound(soundLevel > 5);
        }
      }
    );
    return () => {
      ZegoUIKitInternal.onSoundLevelUpdate('AudioFrame' + userInfo.userID);
    };
  }, []);

  return (
    <View
      style={
        cstyle(audioViewBackgroudColor ? audioViewBackgroudColor : '#4A4B4D')
          .container
      }
    >
      <ImageBackground
        source={
          audioViewBackgroudImage ? { uri: audioViewBackgroudImage } : null
        }
        resizeMode="cover"
        style={styles.imgBackground}
      >
        {showSoundWave && hasSound ? (
          <View
            style={
              waveStyle(avatarSize.width + 8, soundWaveColor, 0.7).circleWave
            }
          >
            <View
              style={
                waveStyle(avatarSize.width + 6, soundWaveColor, 0.8)
                  .subCircleWave
              }
            />
            <View
              style={
                waveStyle(avatarSize.width + 4, soundWaveColor, 1).subCircleWave
              }
            />
          </View>
        ) : (
          <View />
        )}
        <View
          style={[
            styles.avatar,
            {
              width: avatarSize.width
                ? avatarSize.width
                : ((129 / 375) * 100).toString() + '%',
              height: avatarSize.height
                ? avatarSize.height
                : ((129 / 375) * 100).toString() + '%',
            },
          ]}
        >
          <Text style={styles.nameLabel}>{getShotName(userInfo.userName)}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const cstyle = (bgColor) =>
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
const waveStyle = (w, color, opacity) =>
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
    justifyContent: 'center',
  },
  avatar: {
    flex: 1,
    width: ((129 / 375) * 100).toString() + '%',
    aspectRatio: 1,
    borderRadius: 1000,
    backgroundColor: '#DBDDE3',
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nameLabel: {
    flex: 1,
    position: 'absolute',
    color: '#222222',
    fontSize: 22,
  },
});
