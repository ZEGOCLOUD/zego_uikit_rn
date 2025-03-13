import { AppState, NativeModules, Platform } from 'react-native';

import { getLocalDateFormat } from './timer';

const { LogRNModule } = NativeModules;

let _userID = ''
let _listenerAlready = false

const ZegoUIKitLogger = {
    logSetUserID: (userID: string) => {
        _userID = userID

        if (!_listenerAlready) {
            AppState.addEventListener('change', async nextState => {
                if (nextState === 'active' || nextState === 'background') {
                    LogRNModule.flush();
                }
            });
            _listenerAlready = true
        }
    },

    logInfo: (module: string, ...msg: any[]) => {
        let dateFormat = getLocalDateFormat()
        if (Platform.OS === 'ios') {
            LogRNModule.logInfo(`${dateFormat} I/${module}: ` + _formatLog(...msg));
        } else {
            LogRNModule.logInfo(`I/${module}: ` + _formatLog(...msg));
        }

        if (__DEV__) {
            console.info(`${dateFormat} [${module}][${_userID}]`, ...msg);
        }
    },
    
    logWarning: (module: string, ...msg: any[]) => {
        let dateFormat = getLocalDateFormat()
        if (Platform.OS === 'ios') {
            LogRNModule.logWarning(`${dateFormat} W/${module}: ` + _formatLog(...msg));
        } else {
            LogRNModule.logWarning(`W/${module}: ` + _formatLog(...msg));
        }

        if (__DEV__) {
            console.warn(`${dateFormat} [${module}][${_userID}]`, ...msg);
        }
    },
    
    logError: (module: string, ...msg: any[]) => {
        let dateFormat = getLocalDateFormat()
        if (Platform.OS === 'ios') {
            LogRNModule.logError(`${dateFormat} E/${module}: ` + _formatLog(...msg));
        } else {
            LogRNModule.logError(`E/${module}: ` + _formatLog(...msg));
        }

        if (__DEV__) {
            console.error(`${dateFormat} [${module}][${_userID}]`, ...msg);
        }
    },

    logFlush: () => {
        LogRNModule.flush()
    }
}

export default ZegoUIKitLogger;
    
function _formatLog(...msg: any[]): string {
    let isPureString = true;
    for (let i = 0; i < msg.length; i++) {
        if (!_canLogToFile(msg[i])) {
            isPureString = false;
            break;
        }
    }

    if (isPureString == true) {
        return msg.join(" ");
    } else {
        let jsonList: string[] = []
        for (let i = 0; i < msg.length; i++) {
            if (_canLogToFile(msg[i])) {
                jsonList.push(msg[i]);
            } else {
                jsonList.push(JSON.stringify(msg[i]));
            }
        }
        
        return `unsupport_type: ${ jsonList.join(" ") }`;
    }
}

function _canLogToFile(msg: any) {
    return typeof msg === "string" || typeof msg === "number"
}