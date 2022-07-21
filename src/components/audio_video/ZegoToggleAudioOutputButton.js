import { useState } from "react";
import { Image, View } from "react-native";
import { userZegoStateContext } from '../../../../hooks/useZegoStateContext'
import { zegoUIKitSelectors } from '../../../../selectors'
import { getImageSource } from "../../../utils/image_path_processor";

export default function ZegoToggleAudioOutputButton(props) {
    // ZegoAudioRouteSpeaker=(0) ZegoAudioRouteHeadphone=(1) ZegoAudioRouteBluetooth=(2) ZegoAudioRouteReceiver=(3) ZegoAudioRouteExternalUSB=(4) ZegoAudioRouteAirPlay=(5)
    const { iconSpeaker, iconEarpiece, iconBluetooth } = props;
    const { currentDevice, setCurrentDevice } = useState(0);// Default on
    const { isOn, setIsOn } = useState(true);
    const context = userZegoStateContext();
    const avService = zegoUIKitSelectors.getAudioVideoService(context);
    const getImageSourceByPath = () => {
        const path = "";
        if (currentDevice == 0) {
            path = iconSpeaker == undefined ? "TODO default path" : iconSpeaker;
        } else if (currentDevice == 2) {
            path = iconBluetooth == undefined ? "TODO default path" : iconBluetooth;
        } else {
            path = iconEarpiece == undefined ? "TODO default path" : iconEarpiece;
        }
        return getImageSource(path);
    }
    const onPress = () => {
        avService.enableSpeaker(!isOn);
        setIsOn(!isOn);
    }
    useEffect(() => {
        avService.onAudioOutputDeviceTypeChange((type) => {
            setCurrentDevice(type);
        });
    }, []);

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            disabled={currentDevice == 0} // Only speaker can toggle enable
            style={styles.micCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}