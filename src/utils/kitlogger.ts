import { getLocalDateFormat } from './timer';

import { NativeModules, Platform } from 'react-native';
const { ZegoUIKitRNModule } = NativeModules;

const ZegoUIKitLogger = {
    kitLogInfo: (module: string, ...msg: any[]) => {
        if (Platform.OS === 'android') {
            ZegoUIKitRNModule.logInfo(`I/${module}: ` + _formatLog(...msg));
        }
        console.info(`${getLocalDateFormat()} ${module}[INFO]`, ...msg);
    },
    
    kitLogWarning: (module: string, ...msg: any[]) => {
        if (Platform.OS === 'android') {
            ZegoUIKitRNModule.logWarning(`W/${module}: ` + _formatLog(...msg));
        }
        console.warn(`${getLocalDateFormat()} ${module}[WARNING]`, ...msg);
    },
    
    kitLogError: (module: string, ...msg: any[]) => {
        if (Platform.OS === 'android') {
            ZegoUIKitRNModule.logError(`E/${module}: ` + _formatLog(...msg));
        }
        console.error(`${getLocalDateFormat()} ${module}[ERROR]`, ...msg);
    },
}

export default ZegoUIKitLogger;

function _formatLog(...msg: any[]): string {
    let isPureString = true;
    for (let i = 0; i < msg.length; i++) {
        if (typeof msg[i] !== "string") {
            isPureString = false;
            break;
        }
    }

    if (isPureString == true) {
        return msg.join(" ");
    } else {
        let jsonList: string[] = []
        for (let i = 0; i < msg.length; i++) {
            if (typeof msg[i] === "string") {
                jsonList.push(msg[i]);
            } else {
                jsonList.push(JSON.stringify(msg[i]));
            }
        }
        
        return `unsupport_type: ${ jsonList.join(" ") }`;
    }
}