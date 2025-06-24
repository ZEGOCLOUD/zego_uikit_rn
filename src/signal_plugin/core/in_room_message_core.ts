import { 
  ZIMCommandMessage, 
  ZIMConversationType,
  ZIMError,
  ZIMEventOfReceiveConversationMessageResult,
  ZIMMessagePriority,
  ZIMMessageSentResult,
  ZIMMessageType, 
  ZIMTextMessage,
} from 'zego-zim-react-native';
import { zlogerror, zloginfo, zlogwarning } from '../utils/logger';
import ZegoUIKitCorePlugin from "../../components/internal/ZegoUIKitCorePlugin";

export default class ZegoPluginRoomMessageCore {
  static shared: ZegoPluginRoomMessageCore;

  constructor() {
    if (!ZegoPluginRoomMessageCore.shared) {
      ZegoPluginRoomMessageCore.shared = this;
    }
    return ZegoPluginRoomMessageCore.shared;
  }
  static getInstance() {
    if (!ZegoPluginRoomMessageCore.shared) {
      ZegoPluginRoomMessageCore.shared = new ZegoPluginRoomMessageCore();
    }
    return ZegoPluginRoomMessageCore.shared;
  }

  _onInRoomTextMessageReceivedCallbackMap: { [index: string]: (notifyData: { 
    message: string; 
    roomID: string;
    senderUserID: string;
    timestamp: number;
  }) => void } = {};

  _onInRoomCommandMessageReceivedCallbackMap: { [index: string]: (notifyData: { 
    message: string; 
    roomID: string;
    senderUserID: string;
    timestamp: number;
  }) => void } = {};

  _registerEngineCallback() {
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on('receiveRoomMessage', (zim: any, { messageList, fromConversationID }: ZIMEventOfReceiveConversationMessageResult) => {
      zloginfo(
        '[Core][receiveRoomMessage callback]',
        messageList,
        fromConversationID
      );
      for (const message of messageList) {
        if (message.type === ZIMMessageType.Command) {
          const command = message as ZIMCommandMessage;
          var commandMessage: Uint8Array | number[];
          
          if (command.message instanceof Uint8Array) {
            commandMessage = command.message;
          } else {
            commandMessage = Object.values(command.message);
          }

          var jsonText = decodeURIComponent(escape(String.fromCharCode(...Array.from(commandMessage))));

          const notifyData = {
            message: jsonText,
            roomID: fromConversationID,
            senderUserID: message.senderUserID,
            timestamp: message.timestamp
          }
          this._notifyInRoomCommandMessageReceived(notifyData);
        } else if (message.type === ZIMMessageType.Text) {
          const textMessage = message as ZIMTextMessage;
          const notifyData = {
            message: textMessage.message,
            roomID: fromConversationID,
            senderUserID: message.senderUserID,
            timestamp: message.timestamp
          }
          this._notifyInRoomTextMessageReceived(notifyData);
        }
      }
    });
    zloginfo('[ZegoPluginRoomMessageCore]Register callback for ZIM...');
  }

  _unregisterEngineCallback() {
    zloginfo('[ZegoPluginRoomMessageCore]Unregister callback from ZIM...');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('receiveRoomMessage');
  }

  _notifyInRoomTextMessageReceived(notifyData: { 
    message: string; 
    roomID: string;
    senderUserID: string;
    timestamp: number;
   }) {
    zloginfo(`[Core]NotifyInRoomTextMessageReceived, data: ${notifyData}`);
    Object.keys(this._onInRoomTextMessageReceivedCallbackMap).forEach(
      (callbackID) => {
        if (this._onInRoomTextMessageReceivedCallbackMap[callbackID]) {
          this._onInRoomTextMessageReceivedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }

  _notifyInRoomCommandMessageReceived(notifyData: {
    message: string;
    roomID: string;
    senderUserID: string;
    timestamp: number;
  }) {
    zloginfo(`[Core]NotifyInRoomCommandMessageReceived, data: ${notifyData}`);
    Object.keys(this._onInRoomCommandMessageReceivedCallbackMap).forEach(
      (callbackID) => {
        if (this._onInRoomCommandMessageReceivedCallbackMap[callbackID]) {
          this._onInRoomCommandMessageReceivedCallbackMap[callbackID](
            notifyData
          );
        }
      }
    );
  }

  sendInRoomTextMessage(roomID: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const textMessage = {
        type: ZIMMessageType.Text,
        message: message,
      } as ZIMTextMessage
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
      .sendMessage(textMessage, roomID, ZIMConversationType.Room, {priority: ZIMMessagePriority.Low}, null)
      .then(({ message: _zimMessage }: ZIMMessageSentResult) => {
        zloginfo(`[Core]sendInRoomTextMessage done, roomID: ${roomID}, message: ${message}`);
        resolve();
      })
      .catch((error: ZIMError) => {
        zlogwarning(`[Core]sendInRoomTextMessage error, roomID: ${roomID}, message: ${message}, error: ${JSON.stringify(error)}`);
        reject(error);
      })
    });
  }

  sendInRoomCommandMessage(roomID: string, message: string): Promise<void> {
    var command = new Uint8Array(Array.from(unescape(encodeURIComponent(message))).map((val) => val.charCodeAt(0)));
    return new Promise((resolve, reject) => {
      const commandMessage = {
        type: ZIMMessageType.Command,
        message: command,
      } as ZIMCommandMessage
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
      .sendMessage(commandMessage, roomID, ZIMConversationType.Room, {priority: ZIMMessagePriority.Low}, null)
      .then(({ message: _zimMessage }: ZIMMessageSentResult) => {
        zloginfo(`[Core]sendInRoomCommandMessage done, roomID: ${roomID}, message: ${message}`);
        resolve();
      })
      .catch((error: ZIMError) => {
        zlogwarning(`[Core]sendInRoomCommandMessage error, roomID: ${roomID}, message: ${message}, error: ${JSON.stringify(error)}`);
        reject(error);
      })
    });
  }

  onInRoomTextMessageReceived(callbackID: string, callback: (notifyData: { message: string; roomID: string; }) => void) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
    }
    if (typeof callback !== 'function') {
      if (callbackID in this._onInRoomTextMessageReceivedCallbackMap) {
        zloginfo(
          '[Core][onRoomPropertyUpdated] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onInRoomTextMessageReceivedCallbackMap[callbackID];
      }
    } else {
      this._onInRoomTextMessageReceivedCallbackMap[callbackID] = callback;
    }
  }
  onInRoomCommandMessageReceived(callbackID: string, callback: (notifyData: {
    message: string;
    roomID: string;
  }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onInRoomCommandMessageReceivedCallbackMap) {
        zloginfo(
          '[Core][onInRoomCommandMessageReceived] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onInRoomCommandMessageReceivedCallbackMap[callbackID];
      }
    } else {
      this._onInRoomCommandMessageReceivedCallbackMap[callbackID] = callback;
    }
  }

}