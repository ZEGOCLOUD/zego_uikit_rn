import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import ZegoInvitationType from './ZegoInvitationType';
import { zloginfo, zlogerror } from '../../../utils/logger';

export default function ZegoStartInvitationButton(props) {
  const {
    icon,
    text,
    invitees = [],
    type = ZegoInvitationType.videoCall,
    data,
    timeout = 60,
    onPressed,
  } = props;
  const getImageSourceByPath = () => {
    if (type === ZegoInvitationType.videoCall) {
      return require('../resources/blue_button_video_call.png');
    } else {
      return require('../resources/blue_button_audio_call.png');
    }
  };
  const getRenderView = () => {
    let renderView;
    if (icon) {
      renderView = <Image resizeMode="contain" source={icon} />;
    } else {
      if (!text) {
        renderView = (
          <Image resizeMode="contain" source={getImageSourceByPath()} />
        );
      } else {
        renderView = <View style={styles.text}>text</View>;
      }
    }
    return renderView;
  };
  const onButtonPress = () => {
    ZegoUIKitInvitationService.sendInvitation(invitees, timeout, type, data)
      .then(({ code, message, errorInvitees }) => {
        zloginfo(
          `[Components]Send invitation success, errorInvitees: ${errorInvitees}`
        );
        if (typeof onPressed === 'function') {
          onPressed();
        }
      })
      .catch(({ code, message }) => {
        zlogerror(
          `[Components]Send invitation error, code: ${code}, message: ${message}`
        );
      });
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onButtonPress}>
      {getRenderView()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 42,
    height: 42,
    backgroundColor: '#F3F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#2A2A2A',
  },
});
