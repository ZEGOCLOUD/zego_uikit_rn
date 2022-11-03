import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import { zloginfo, zlogerror } from '../../../utils/logger';

export default function ZegoCancelInvitationButton(props) {
  const { icon, text, invitees = [], data, onPressed } = props;
  const getImageSourceByPath = () => {
    return require('../resources/button_call_cancel.png');
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
    ZegoUIKitInvitationService.cancelInvitation(invitees, data)
      .then(({ code, message, errorInvitees }) => {
        zloginfo(
          `[Components]Cancel invitation success, errorInvitees: ${errorInvitees}`
        );
        if (typeof onPressed === 'function') {
          onPressed();
        }
      })
      .catch(({ code, message }) => {
        zlogerror(
          `[Components]Cancel invitation error, code: ${code}, message: ${message}`
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
    width: 60,
    height: 60,
    backgroundColor: '#FF4A50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
