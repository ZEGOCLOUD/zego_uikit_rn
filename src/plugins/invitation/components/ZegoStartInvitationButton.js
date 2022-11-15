import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
      .then(({ code, message, callID, errorInvitees }) => {
        zloginfo(
          `[Components]Send invitation success, code: ${code}, message: ${message}, errorInvitees: ${errorInvitees}`
        );
        if (errorInvitees.length === invitees.length) {
          Alert.alert(`offline: ${errorInvitees}`);
        }
        if (invitees.length > errorInvitees.length) {
          if (typeof onPressed === 'function') {
            const inviteesBackup = JSON.parse(JSON.stringify(invitees));
            errorInvitees.forEach((errorInviteeID) => {
              const index = inviteesBackup.findIndex(
                (inviteeID) => errorInviteeID === inviteeID
              );
              index !== -1 && inviteesBackup.splice(index, 1);
            });
            onPressed({
              callID,
              invitees: inviteesBackup,
            });
          }
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
    borderRadius: 1000,
  },
  text: {
    fontSize: 16,
    color: '#2A2A2A',
  },
});
