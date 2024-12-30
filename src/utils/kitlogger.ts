import { NativeModules, Platform } from 'react-native';

import { getLocalDateFormat } from './timer';

const { LogRNModule } = NativeModules;

let _userID = ''

const ZegoUIKitLogger = {
    logSetUserID: (userID: string) => {
        _userID = userID
    },

    logInfo: (module: string, ...msg: any[]) => {
        LogRNModule.logInfo(`I/${module}: ` + _formatLog(...msg));

        if (__DEV__) {
            console.info(`${getLocalDateFormat()} [${module}][${_userID}]`, ...msg);
        }
    },
    
    logWarning: (module: string, ...msg: any[]) => {
        LogRNModule.logWarning(`W/${module}: ` + _formatLog(...msg));

        if (__DEV__) {
            console.warn(`${getLocalDateFormat()} [${module}][${_userID}]`, ...msg);
        }
    },
    
    logError: (module: string, ...msg: any[]) => {
        LogRNModule.logError(`E/${module}: ` + _formatLog(...msg));

        if (__DEV__) {
            console.error(`${getLocalDateFormat()} [${module}][${_userID}]`, ...msg);
        }
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