import React, { Fragment } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import { zloginfo, zlogerror } from '../../../utils/logger';

export default function ZegoCancelInvitationButton(props: any) {
  const {
    icon,
    text,
    invitees = [],
    data,
    onPressed,
    onFailure,
    onWillPressed,
    backgroundColor = '#FF4A50',
    fontSize = 16,
    color = '#FFFFFF',
    width = 60,
    height = 60,
    borderRadius = 1000,
    verticalLayout, // Default row layout, no layout parameters default to precedence icon
  } = props;
  const getImageSourceByPath = () => {
    return require('../resources/button_call_cancel.png');
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
  const getCustomTextStyle = (fontSize: number, color: string) => StyleSheet.create({
    text: {
      fontSize,
      color,
    },
  });
  const getCustomContainerStyle = (width: number, height: number, borderRadius: number, backgroundColor: string, verticalLayout: boolean) => StyleSheet.create({
    customContainer: {
      flexDirection: verticalLayout ? 'column' : 'row',
      width,
      height,
      backgroundColor,
      borderRadius,
    },
  });

  const onButtonPress = () => {
    const canCancelInvitation = typeof onWillPressed === 'function' ? onWillPressed() : true;
    if (!canCancelInvitation) return;
    zloginfo(
      `[Components]Cancel invitation start, invitees: ${invitees}, data: ${data}`
    );
    ZegoUIKitInvitationService.cancelInvitation(invitees, data)
      .then(({ code, message, errorInvitees }: any) => {
        zloginfo(
          `[Components]Cancel invitation success, errorInvitees: ${errorInvitees}`
        );
        if (invitees.length > errorInvitees.length) {
          if (typeof onPressed === 'function') {
            const inviteesBackup = JSON.parse(JSON.stringify(invitees));
            errorInvitees.forEach((errorInviteeID: string) => {
              const index = inviteesBackup.findIndex(
                (inviteeID: string) => errorInviteeID === inviteeID
              );
              index !== -1 && inviteesBackup.splice(index, 1);
            });
            onPressed({
              invitees: inviteesBackup,
            });
          }
        }
      })
      .catch(({ code, message }: any) => {
        if (typeof onFailure === 'function') {
          onFailure({ code: code, message: message });
        }
        zlogerror(
          `[Components]Cancel invitation error, code: ${code}, message: ${message}`
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
