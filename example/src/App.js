import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { PrebuiltCall } from 'react-native-zego-uikit-rn';
import CounterView from './CounterView';
import NewView from './NewView';


export default function App() {
  return (
    <View style={styles.container}>
      {/* <PrebuiltCall appID={1719562607} appSign='9ff0246b333e6c1f8dffa8501007237176a1fed4ed86141b9a7d1463def4f54b'>

      </PrebuiltCall> */}
      <CounterView tt='First'></CounterView>
      <NewView tt="Second"></NewView>
      <Text>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
