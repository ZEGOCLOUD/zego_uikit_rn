import React, { Fragment }from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import ZegoUIKitInternal from '../../../components/internal/ZegoUIKitInternal';
import ZegoPluginResult from '../../../signal_plugin/core/defines';
import { zloginfo, zlogerror } from '../../../utils/logger';
import ZegoUIKitInvitationService from '../services';

export default function ZegoAcceptInvitationButton(props: any) {
  const {
    icon,
    text, 
    inviterID,
    data,
    onPressed,
    onFailure,
    onWillPressed,
    backgroundColor = '#30D059',
    fontSize = 16,
    color = '#FFFFFF',
    width, // The default size was not given in the first release, so I can't add it here
    height, // The default size was not given in the first release, so I can't add it here
    borderRadius = 1000,
    verticalLayout, // Default row layout, no layout parameters default to precedence icon
  } = props;
  const getImageSourceByPath = () => {
    return require('../resources/button_call_audio_accept.png');
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
    const canAcceptInvitation = typeof onWillPressed === 'function' ? onWillPressed() : true;
    if (!canAcceptInvitation) return;
    zloginfo(
      `[Components]Accept invitation start, inviterID: ${inviterID}, data: ${data}`
    );

    ZegoUIKitInvitationService.acceptInvitation(inviterID, data)
      .then((result: ZegoPluginResult) => {
        // @ts-ignore
        zloginfo(`[Components]Accept invitation success, callID: ${result.data.callID}`);
        if (typeof onPressed === 'function') {
          zloginfo('[ZegoAcceptInvitationButton][acceptInvitation] execute onPressed will')
          // @ts-ignore
          onPressed({inviterID, callID: result.data.callID});
          zloginfo('[ZegoAcceptInvitationButton][acceptInvitation] execute onPressed succeed')
        }
      })
      .catch(({ code, message }: any) => {
        ZegoUIKitInternal.notifyErrorUpdate('AcceptInvitation', code, message);
        if (typeof onFailure === 'function') {
          onFailure({ code: code, message: message });
        }
        zlogerror(
          `[Components]Accept invitation error, code: ${code}, message: ${message}`
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
