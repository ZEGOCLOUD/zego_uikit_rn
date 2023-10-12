
import ZegoPluginRoomMessageCore from '../core/in_room_message_core';

export default class ZegoPluginInRoomMessageService {
  static shared: ZegoPluginInRoomMessageService;
  constructor() {
    if (!ZegoPluginInRoomMessageService.shared) {
      ZegoPluginInRoomMessageService.shared = this;
    }
    return ZegoPluginInRoomMessageService.shared;
  }
  static getInstance() {
    if (!ZegoPluginInRoomMessageService.shared) {
      ZegoPluginInRoomMessageService.shared =
        new ZegoPluginInRoomMessageService();
    }
    return ZegoPluginInRoomMessageService.shared;
  }

  sendInRoomTextMessage(roomID: string, message: string) {
    return ZegoPluginRoomMessageCore.getInstance().sendInRoomTextMessage(roomID, message)
  }

  sendInRoomCommandMessage(roomID: string, message: string) {
    return ZegoPluginRoomMessageCore.getInstance().sendInRoomCommandMessage(roomID, message)
  }

  onInRoomTextMessageReceived(callbackID: string, callback: (notifyData: { 
    message: string; 
    roomID: string;
    senderUserID: string;
    timestamp: number;
  }) => void) {
    ZegoPluginRoomMessageCore.getInstance().onInRoomTextMessageReceived(
      callbackID,
      callback
    );
  }
  onInRoomCommandMessageReceived(callbackID: string, callback: (notifyData: {
    roomID: string;
    message: string;
    senderUserID: string;
    timestamp: number;
  }) => void) {
    ZegoPluginRoomMessageCore.getInstance().onInRoomCommandMessageReceived(
      callbackID,
      callback
    );
  }
}