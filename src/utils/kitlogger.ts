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
}

export default ZegoUIKitLogger;

function _formatLog(...msgList: any[]): string {
    let isPureString = true;
    for (let i = 0; i < msgList.length; i++) {
        if (!_canLogToFile(msgList[i])) {
            isPureString = false;
            break;
        }
    }

    if (isPureString == true) {
        return msgList.join(" ");
    } else {
        let jsonList: string[] = []
        for (let i = 0; i < msgList.length; i++) {
            if (_canLogToFile(msgList[i])) {
                jsonList.push(msgList[i]);
            } else {
                jsonList.push(JSON.stringify(msgList[i]));
            }
        }
        
        return `(LogTruncated?) ${ jsonList.join(" ") }`;
    }
}

const canLogTypeList: string[] = ['string', 'number', 'boolean']

function _canLogToFile(msg: any) {
    return canLogTypeList.includes(typeof msg)
}