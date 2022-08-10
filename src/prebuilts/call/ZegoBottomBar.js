import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import ZegoQuitButton from '../../components/audio_video/ZegoQuitButton';
import ZegoSwitchAudioOutputButton from '../../components/audio_video/ZegoSwitchAudioOutputButton';
import ZegoSwitchCameraFacingButton from '../../components/audio_video/ZegoSwitchCameraFacingButton';
import ZegoToggleCameraButton from '../../components/audio_video/ZegoToggleCameraButton';
import ZegoToggleMicrophoneButton from '../../components/audio_video/ZegoToggleMicrophoneButton';
import ZegoMoreButton from './ZegoMoreButton';

export default function ZegoBottomBar(props) {
    const {
        menuBarButtonsMaxCount = 5,
        menuBarButtons = [],
        menuBarExtendedButtons = [],
        onHangUp,
        onHangUpConfirming,
        turnOnCameraWhenJoining,
        turnOnMicrophoneWhenJoining,
        useSpeakerWhenJoining,
        onMoreButtonPress
    } = props;

    // enum ZegoMenuBarButtonName {
    //     hangUpButton,
    //     toggleCameraButton,
    //     toggleMicrophoneBUtton,
    //     swtichCameraFacingButton,
    //     swtichAudioOtputButton
    //     }
    const getButtonByButtonIndex = (buttonIndex) => {
        switch (buttonIndex) {
            case 0:
                return <ZegoQuitButton key={0} onLeaveConfirming={onHangUpConfirming} onPressed={onHangUp} />
            case 1:
                return <ZegoToggleCameraButton key={1} isOn={turnOnCameraWhenJoining} />;
            case 2:
                return <ZegoToggleMicrophoneButton key={2} isOn={turnOnMicrophoneWhenJoining} />;
            case 3:
                return <ZegoSwitchCameraFacingButton key={3} />
            case 4:
                return <ZegoSwitchAudioOutputButton key={4} useSpeakerWhenJoining={useSpeakerWhenJoining}/>
        }
    }
    const getDisplayButtons = () => {
        var maxCount = menuBarButtonsMaxCount < 1 ? 1 : menuBarButtonsMaxCount;
        maxCount = maxCount > 5 ? 5 : maxCount;
        const needMoreButton = (menuBarButtons.length + menuBarExtendedButtons.length) > maxCount;
        const firstLevelButtons = [];
        const secondLevelButtons = [];
        menuBarButtons.forEach(buttonIndex => {
            const limitCount = needMoreButton ? maxCount - 1 : maxCount;
            if (firstLevelButtons.length < limitCount) {
                firstLevelButtons.push(getButtonByButtonIndex(buttonIndex));
            } else {
                secondLevelButtons.push(getButtonByButtonIndex(buttonIndex));
            }
        });
        menuBarExtendedButtons.forEach(button => {
            const limitCount = needMoreButton ? maxCount - 1 : maxCount;
            if (firstLevelButtons.length < limitCount) {
                firstLevelButtons.push(button);
            } else {
                secondLevelButtons.push(button);
            }
        });
        if (needMoreButton) {
            firstLevelButtons.push(<ZegoMoreButton onPressed={onMoreButtonPress} />)
        }
        return {
            firstLevelButtons: firstLevelButtons,
            secondLevelButtons: secondLevelButtons
        }
    }
    const getButtonStyle = () => {
        const btnStyles = [styles.ctrlBtn1, styles.ctrlBtn2, styles.ctrlBtn3, styles.ctrlBtn4, styles.ctrlBtn5,]
        return btnStyles[firstLevelButtons.length - 1]
    }

    var allButtons = getDisplayButtons();
    var firstLevelButtons = allButtons['firstLevelButtons']
    var secondLevelButtons = allButtons['secondLevelButtons']

    return (
        <View style={styles.ctrlBar}>
            {firstLevelButtons.map((button, index) => (
                <View style={getButtonStyle()}>
                    {button}
                </View>
            ))}
        </View>
    );
}


const styles = StyleSheet.create({
    ctrlBar: {
        flex: 1,
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 50,
        width: '100%',
        bottom: 0,
        height: 50,
        zIndex: 2
    },
    ctrlBtn1: {
        marginLeft: 0,
        marginRight: 0,
    },
    ctrlBtn2: {
        marginLeft: 79 / 2,
        marginRight: 79 / 2,
    },
    ctrlBtn3: {
        marginLeft: 59.5 / 2,
        marginRight: 59.5 / 2,
    },
    ctrlBtn4: {
        marginLeft: 37 / 2,
        marginRight: 37 / 2,
    },
    ctrlBtn5: {
        marginLeft: 23 / 2,
        marginRight: 23 / 2,
    }
});