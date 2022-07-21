import { useState } from "react";
import { Image, View } from "react-native";
import { getImageSource } from "../../../utils/image_path_processor";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoToggleAudioOutputButton(props) {
    // ZegoAudioRouteSpeaker=(0) ZegoAudioRouteHeadphone=(1) ZegoAudioRouteBluetooth=(2) ZegoAudioRouteReceiver=(3) ZegoAudioRouteExternalUSB=(4) ZegoAudioRouteAirPlay=(5)
    const { iconSpeaker, iconEarpiece, iconBluetooth } = props;
    const [currentDevice, setCurrentDevice] = useState(0);// Default on
    const [isOn, setIsOn] = useState(true);
    const getImageSourceByPath = () => {
        const path = "";
        if (currentDevice == 0) {
            path = iconSpeaker ? iconSpeaker : "TODO default path";
        } else if (currentDevice == 2) {
            path = iconBluetooth ? iconBluetooth : "TODO default path";
        } else {
            path = iconEarpiece ? iconEarpiece : "TODO default path";
        }
        return getImageSource(path);
    }
    const onPress = () => {
        ZegoUIKitInternal.enableSpeaker(!isOn);
        setIsOn(!isOn);
    }
    useEffect(() => {
        ZegoUIKitInternal.onAudioOutputDeviceTypeChange((type) => {
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