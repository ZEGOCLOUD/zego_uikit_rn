import React, { useEffect, useState, useRef } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import ZegoUIKitInternal from '../internal/ZegoUIKitInternal';
import Delegate from 'react-delegate-component';

export default function ZegoInRoomMessageView(props: any) {
  const { itemBuilder } = props;
  const listRef = useRef(null);
  const [messageList, setMessageList] = useState([]);

  const refreshMessage = () => {
    // Update list like this will cause rerender
    setMessageList((arr) => [...ZegoUIKitInternal.getInRoomMessages()]);
  };
  const renderItem = ({ item }: any) => {
    return (
      !itemBuilder ? <View style={styles.messageContainer}>
        <Text style={styles.nameLabel}>
          {item.sender.userName}
          <Text style={styles.messageLabel}> {item.message}</Text>
        </Text>
      </View> : <Delegate to={itemBuilder} props={{ message: item }} />
    );
  }

  useEffect(() => {
    refreshMessage();
  }, []);
  useEffect(() => {
    const callbackID =
      'ZegoInRoomMessageView' + String(Math.floor(Math.random() * 10000));
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
  nameLabel: {
    color: '#8BE7FF',
    fontSize: 13,
    // marginLeft: 10
  },
  messageLabel: {
    color: 'white',
    fontSize: 13,
    marginLeft: 5,
  },
});
