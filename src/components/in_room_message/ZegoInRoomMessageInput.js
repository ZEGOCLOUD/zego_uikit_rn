import React from 'react';
import { StyleSheet, View, TextInput, Image, TouchableOpacity, Platform } from 'react-native';
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
            enable: this.props.iconSend ? this.props.iconSend : require('../internal/resources/white_button_send_in_room_message_enable.png'),
            disable: this.props.iconSendDisable ? this.props.iconSendDisable : (this.props.iconSend ? this.props.iconSend : require('../internal/resources/white_button_send_in_room_message_disable.png'))
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
    _sumit() {
        if (this.state.currentText != '') {
            ZegoUIKitInternal.sendInRoomMessage(this.state.currentText);
            this.clear();
            this.blur();
            if (typeof this.props.onSumit == 'function') {
                this.props.onSumit();
            }
        }
    }

    render() {
        return (
            <View style={[styles.container, { height: this.state.textInputHeight, backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : 'rgba(0, 0, 0, 0.7500)' }]} >
                <View style={styles.textInputContainer}>
                    <TextInput
                        ref={this.textInput}
                        style={[styles.fillParent, styles.textInput]}
                        blurOnSubmit={true}
                        multiline={true}
                        autoFocus={true}
                        editable={this.props.enable ? this.props.enable : true}
                        selectionColor={'#A653FF'}
                        placeholder={this.props.placeholder ? this.props.placeholder : ''}
                        placeholderTextColor={'rgba(255, 255, 255, 0.2)'}
                        onContentSizeChange={({ nativeEvent: { contentSize: { width, height } } }) => {
                            var h = height;
                            // https://github.com/facebook/react-native/issues/29702
                            if (Platform.OS == 'ios') {
                                h = height + 25;
                            }
                            this.setState({ textInputHeight: h, contentWidth: width })
                            if (typeof this.props.onContentSizeChange == 'function') {
                                this.props.onContentSizeChange(width, h);
                            }
                        }}
                        onChangeText={(text) => { this.setState({ currentText: text }); }}
                        onSubmitEditing={() => this._sumit()}
                    />
                </View>
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                        this._sumit();
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
        width: '100%'
    }

});
