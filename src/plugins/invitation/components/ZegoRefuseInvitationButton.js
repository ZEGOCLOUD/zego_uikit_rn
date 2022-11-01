import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../invitation_service';
import { zloginfo, zlogerror } from '../../../utils/logger';

export default function ZegoRefuseInvitationButton(props) {
  const { icon, text, inviterID, data, onPressed } = props;
  const getImageSourceByPath = () => {
    return require('../resources/button_call_reject.png');
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
    ZegoUIKitInvitationService.refuseInvitation(inviterID, data)
      .then(() => {
        zloginfo(`[Components]Refuse invitation success`);
        if (typeof onPressed === 'function') {
          onPressed();
        }
      })
      .catch(({ code, message }) => {
        zlogerror(
          `[Components]Refuse invitation error, code: ${code}, message: ${message}`
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
    width: 37,
    height: 37,
    backgroundColor: '#FF4A50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
