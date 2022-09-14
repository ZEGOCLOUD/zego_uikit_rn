import React from 'react';
import { StyleSheet, View, TextInput, Image, TouchableOpacity } from 'react-native';
import ZegoUIKitInternal from '../internal/ZegoUIKitInternal';

// https://github.com/react-native-community/hooks#usekeyboard
class ZegoInRoomMessageInput extends React.Component {
    constructor(props) {
        super(props);
        this.textInput = React.createRef();
        this.state = {
            textInputHeight: 45,
            contentWidth: 0,
            currentText: ""
        };
        this.iconPath = {
            enable: require('../internal/resources/white_button_send_in_room_message_enable.png'),
            disable: require('../internal/resources/white_button_send_in_room_message_disable.png')
        }
    }

    focus() {
        this.textInput.current.focus();
    }
    blur() {
        this.textInput.current.blur();
    }
    clear() {
        this.textInput.current.clear();
        this.setState({ textInputHeight: 45, contentWidth: 0, currentText: "" })
        if (typeof this.props.onContentSizeChange == 'function') {
            this.props.onContentSizeChange(0, 45);
        }
    }

    render() {
        return (
            <View style={[styles.container, { height: this.state.textInputHeight }]} >
                <View style={styles.textInputContainer}>
                    <TextInput
                        ref={this.textInput}
                        style={[styles.fillParent, styles.textInput]}
                        blurOnSubmit={true}
                        multiline={true}
                        selectionColor={'#A653FF'}
                        onContentSizeChange={({ nativeEvent: { contentSize: { width, height } } }) => {
                            const h = height + 25;
                            this.setState({ textInputHeight: h, contentWidth: width })
                            if (typeof this.props.onContentSizeChange == 'function') {
                                this.props.onContentSizeChange(width, h);
                            }
                        }}
                        onChangeText={(text) => { this.setState({ currentText: text }); }}
                        placeholder="Say something..."
                    />
                </View>
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                        ZegoUIKitInternal.sendInRoomMessage(this.state.currentText).then(({ errorCode, messageID }) => {
                            if (errorCode == 0) {
                                this.clear();
                            }
                        })
                    }}
                >
                    <Image resizeMode='contain' style={styles.icon} source={(this.state.currentText && this.state.currentText != "") ? this.iconPath.enable : this.iconPath.disable} />
                </TouchableOpacity>
            </View>
        );
    }
}
export default ZegoInRoomMessageInput;

const styles = StyleSheet.create({
    sendButton: {
        position: 'absolute',
        right: 10,
        bottom: 8,
        width: 29,
        height: 29,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    textInput: {
        color: 'white',
        paddingTop: 12.5,
        paddingBottom: 12.5,
    },
    textInputContainer: {
        marginLeft: 15,
        paddingRight: 59,
        height: '100%',
        width: '100%',
    },
    container: {
        position: 'absolute',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7500)',
        width: '100%',
    }

});
