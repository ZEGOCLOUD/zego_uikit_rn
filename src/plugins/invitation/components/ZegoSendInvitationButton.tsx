import React, { Fragment } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import ZegoInvitationType from './ZegoInvitationType';
import { zloginfo, zlogerror } from '../../../utils/logger';
import ZegoUIKitInternal from '../../../components/internal/ZegoUIKitInternal';

let requesting = false;

export default function ZegoSendInvitationButton(props: any) {
  const {
    icon,
    text,
    invitees = [],
    type = ZegoInvitationType.videoCall,
    data,
    onRequestData,
    timeout = 60,
    onPressed,
    onFailure,
    onWillPressed,
    backgroundColor = '#F3F4F7',
    fontSize = 16,
    color = '#2A2A2A',
    width = 42,
    height = 42,
    borderRadius = 1000,
    borderWidth,
    borderColor,
    borderStyle,
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
      var marigin = text ? 6 : 0;
      renderView = <Fragment>
        <Image resizeMode="contain" source={icon || getImageSourceByPath()} style={{marginRight: marigin}}/>
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
  const getCustomContainerStyle = () => StyleSheet.create({
    customContainer: {
      flexDirection: verticalLayout ? 'column' : 'row',
      width: width,
      height: height,
      backgroundColor: backgroundColor,
      borderRadius: borderRadius,
      borderWidth: borderWidth,
      borderColor: borderColor,
      borderStyle: borderStyle,
    },
  });

  const onButtonPress = async () => {
    if (requesting) {
      zloginfo('[Components]Send invitation requesting..... return.');
      callOnFailure({ code: -1, message: 'Press too frequently.' })
      return;
    }
    if (invitees.length == 0) {
      callOnFailure({ code: -1, message: 'Invitees is empty.' })
      return
    }
    requesting = true;
    
    let canSendInvitation = true;
    if (onWillPressed) {
      zloginfo('#########onWillPressed judge', typeof onWillPressed === 'object', typeof (onWillPressed.then) === 'function', typeof (onWillPressed.catch) === 'function');
      if (typeof onWillPressed === 'object' && typeof (onWillPressed.then) === 'function' && typeof (onWillPressed.catch) === 'function') {
        // Promise
        zloginfo('#########onWillPressed promise', onWillPressed);
        try {
          canSendInvitation = await onWillPressed;
        } catch (error) {
          canSendInvitation = false;
        }
      } else if (typeof onWillPressed === 'function') {
        zloginfo('#########onWillPressed function', onWillPressed);
        const temp = onWillPressed();
        if (typeof temp === 'object' && typeof (temp.then) === 'function' && typeof (temp.catch) === 'function') {
          zloginfo('#########onWillPressed promise', temp);
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
    if (!canSendInvitation) {
      requesting = false;
      return; 
    }

    let updatedData = null
    if (typeof onRequestData === 'function') {
      updatedData = onRequestData()
    } else if (data) {
      updatedData = data
    } else {
      requesting = false;
      return; 
    }

    zloginfo(
      `[Components]Send invitation start, invitees: ${invitees}, timeout: ${timeout}, type: ${type}, data: ${updatedData}`
    );
    ZegoUIKitInvitationService.sendInvitation(invitees, timeout, type, updatedData, { resourceID, title: notificationTitle, message: notificationMessage })
      .then(({ code, message, callID, errorInvitees }: any) => {
        zloginfo(
          `[Components]Send invitation success, code: ${code}, message: ${message}, errorInvitees: ${errorInvitees}`
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
              invitationID: callID,
              errorCode: code,
              errorMessage: message,
              errorInvitees,
              invitees: inviteesBackup,
            });
          }
        }
        setTimeout(() => {
          requesting = false;
        }, 1000);
      })
      .catch(({ code, message }: any) => {
        ZegoUIKitInternal.notifyErrorUpdate('SendInvitation', code, message);
        callOnFailure({code, message})
        setTimeout(() => {
          requesting = false;
        }, 1000);
        zlogerror(
          `[Components]Send invitation error, code: ${code}, message: ${message}`
        );
      });
  };

  const callOnFailure = ({code, message}: any) => {
    if (typeof onFailure === 'function') {
      onFailure({ code: code, message: message });
      zloginfo('[ZegoSendInvitationButton][onButtonPress] onFailure execute end')
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getCustomContainerStyle().customContainer
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
