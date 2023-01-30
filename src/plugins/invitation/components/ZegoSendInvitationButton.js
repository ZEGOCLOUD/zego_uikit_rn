import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import ZegoInvitationType from './ZegoInvitationType';
import { zloginfo, zlogerror } from '../../../utils/logger';

export default function ZegoSendInvitationButton(props) {
  const {
    icon,
    text,
    invitees = [],
    type = ZegoInvitationType.videoCall,
    data,
    timeout = 60,
    onWillPressed,
    onPressed,
    resourceID,
    notificationTitle,
    notificationMessage
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
  const onButtonPress = async () => {
    let canSendInvitation = true;
    if (onWillPressed) {
      console.log('#########onWillPressed judge', typeof onWillPressed === 'object', typeof (onWillPressed.then) === 'function', typeof (onWillPressed.catch) === 'function');
      if (typeof onWillPressed === 'object' && typeof (onWillPressed.then) === 'function' && typeof (onWillPressed.catch) === 'function') {
        // Promise
        console.log('#########onWillPressed promise', onWillPressed);
        try {
          canSendInvitation = await onWillPressed;
        } catch (error) {
          canSendInvitation = false;
        }
      } else if (typeof onWillPressed === 'function') {
        console.log('#########onWillPressed function', onWillPressed);
        const temp = onWillPressed();
        if (typeof temp === 'object' && typeof (temp.then) === 'function' && typeof (temp.catch) === 'function') {
          console.log('#########onWillPressed promise', temp);
          try {
            canSendInvitation = await temp;
          } catch (error) {
            canSendInvitation = false;
          }
        } else {
          canSendInvitation = temp;
        }
      }
    }
    if (!canSendInvitation) return;
    ZegoUIKitInvitationService.sendInvitation(invitees, timeout, type, data, { resourceID, title: notificationTitle, message: notificationMessage })
      .then(({ code, message, callID, errorInvitees }) => {
        zloginfo(
          `[Components]Send invitation success, code: ${code}, message: ${message}, errorInvitees: ${errorInvitees}`
        );
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
              invitationID: callID,
              errorCode: code,
              errorMessage: message,
              errorInvitees,
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
