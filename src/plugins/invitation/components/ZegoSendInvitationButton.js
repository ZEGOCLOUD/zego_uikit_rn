import React, { Fragment } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
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
    onPressed,
    onWillPressed,
    backgroundColor = '#F3F4F7',
    fontSize = 16,
    color = '#2A2A2A',
    width = 42,
    height = 42,
    borderRadius = 1000,
    verticalLayout, // Default row layout, no layout parameters default to precedence icon
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
    if (verticalLayout === undefined) {
      // Choose between icon and text
      if (icon) {
        renderView = <Image resizeMode="contain" source={icon} />;
      } else {
        if (!text) {
          renderView = (
            <Image resizeMode="contain" source={getImageSourceByPath()} />
          );
        } else {
          renderView = <Text style={getCustomTextStyle(fontSize, color).text}>{text}</Text>;
        }
      }
    } else {
      // Both icon and text exist
      renderView = <Fragment>
        <Image resizeMode="contain" source={icon || getImageSourceByPath()} style={{marginRight: 6}}/>
        <Text style={getCustomTextStyle(fontSize, color).text}>{text}</Text>
      </Fragment>
    }
    return renderView;
  };
  const getCustomTextStyle = (fontSize, color) => StyleSheet.create({
    text: {
      fontSize,
      color,
    },
  });
  const getCustomContainerStyle = (width, height, borderRadius, backgroundColor, verticalLayout) => StyleSheet.create({
    customContainer: {
      flexDirection: verticalLayout ? 'column' : 'row',
      width,
      height,
      backgroundColor,
      borderRadius,
    },
  });

  const onButtonPress = () => {
    const canSendInvitation = typeof onWillPressed === 'function' ? onWillPressed() : true;
    if (!canSendInvitation) return;
    zloginfo(
      `[Components]Send invitation start, invitees: ${invitees}, timeout: ${timeout}, type: ${type}, data: ${data}`
    );
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
    <TouchableOpacity
      style={[
        styles.container,
        getCustomContainerStyle(width, height, borderRadius, backgroundColor, verticalLayout).customContainer
      ]}
      onPress={onButtonPress}
    >
      {getRenderView()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
