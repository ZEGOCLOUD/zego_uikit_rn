import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Delegate from 'react-delegate-component';
import ZegoUIKitInternal from '../internal/ZegoUIKitInternal';

export default function ZegoInRoomMessageView(props: any) {
  const { itemBuilder, systemMessageList } = props;
  const listRef = useRef(null);
  const [messageList, setMessageList] = useState([]);
  const systemMessageListRef = useRef(systemMessageList);

  const refreshMessage = () => {
    const roomMessages = ZegoUIKitInternal.getInRoomMessages();
    if (systemMessageList && systemMessageList.length) {
      const latestSystemMessageList = systemMessageListRef.current;
      const allMessages = [...roomMessages, ...latestSystemMessageList];
      allMessages.sort((a, b) => a.sendTime - b.sendTime);
      setMessageList(allMessages);
    } else {
      setMessageList((arr) => [...ZegoUIKitInternal.getInRoomMessages()]);
    }
  };

  const renderItem = ({ item }: any) => {
    let type = item.type || 'user';
    return (
      !itemBuilder ? <View style={styles.messageContainer}>
        {type === 'system' ? (
            <Text style={[styles.systemMessageLabel]}>
              {item.message}
            </Text>
          ) : (
            <Text style={styles.senderNameLabel}>
              {item.sender?.userName || 'Unknown User'}
              <Text style={styles.messageLabel}> {item.message}</Text>
            </Text>
        )}
      </View> : <Delegate to={itemBuilder} props={{ message: item }} />
    );
  }

  useEffect(() => {
    refreshMessage();
  }, []);

  useEffect(() => {
    systemMessageListRef.current = systemMessageList;
    refreshMessage();
  }, [systemMessageList]);

  useEffect(() => {
    const callbackID = 'ZegoInRoomMessageView' + String(Math.floor(Math.random() * 10000));
    ZegoUIKitInternal.onInRoomMessageReceived(callbackID, () => {
      refreshMessage();
    });
    ZegoUIKitInternal.onInRoomMessageSent(callbackID, () => {
      refreshMessage();
    });

    return () => {
      ZegoUIKitInternal.onInRoomMessageReceived(callbackID);
      ZegoUIKitInternal.onInRoomMessageSent(callbackID);
    };
  }, []);

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      ref={listRef}
      data={messageList}
      // https://stackoverflow.com/questions/46304677/scrolltoend-after-update-data-for-flatlist
      onContentSizeChange={() => {
        if (messageList.length) {
          listRef.current.scrollToEnd();
        }
      }}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(1, 7, 18, 0.3000)',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10,
  },
  senderNameLabel: {
    color: '#8BE7FF',
    fontSize: 13,
  },
  messageLabel: {
    color: 'white',
    fontSize: 13,
    marginLeft: 5,
  },
  systemMessageLabel: {
    color: '#FFD700',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
