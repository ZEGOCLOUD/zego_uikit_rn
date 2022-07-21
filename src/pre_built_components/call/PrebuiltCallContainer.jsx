import { useEffect } from "react";
import { View } from "react-native";
import {useZegoStateContext} from "../hooks/useZegoStateContext"
import zegoUIKitSelectors from "../selectors";

export default function PrebuiltCallContainer(props) {
    const { roomID, children } = props;
    const context = useZegoStateContext();
    const roomService = zegoUIKitSelectors.getRoomService(context);
    useEffect(() => {
        roomService.joinRoom(roomID);
    });
    return (<View>
        {children}
    </View>)
}