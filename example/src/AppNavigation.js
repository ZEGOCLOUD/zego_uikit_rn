import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from "./HomePage";
import VideoCallPage from "./VideoCallPage";
import VoiceCallPage from "./VoiceCallPage";

const Stack = createNativeStackNavigator();

export default function AppNavigation(props) {
    return (
        <Stack.Navigator initialRouteName="HomePage">
            <Stack.Screen name="HomePage" component={HomePage} />
            <Stack.Screen name="VideoCallPage" component={VideoCallPage} />
            <Stack.Screen name="VoiceCallPage" component={VoiceCallPage} />
        </Stack.Navigator>
    );
}