import { Button } from "react-native";
import AudioVideoContainer from "../../components/layout/AudioVideoContainer";
import ZegoUIKitProvider from "../../ZegoUIKitProvider";
import PrebuiltCallContainer from "./PrebuiltCallContainer";

export default function PrebuiltCall(props) {
    const { appID, appSign, userID, userName, roomID, config } = props;
    return (
        <ZegoUIKitProvider appID={appID} appSign={appSign} userID={userID} userName={userName}>
            <PrebuiltCallContainer roomID={roomID}>
                <AudioVideoContainer>

                </AudioVideoContainer>
            </PrebuiltCallContainer>
        </ZegoUIKitProvider>);
}