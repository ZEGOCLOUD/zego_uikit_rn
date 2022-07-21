import  React, { useState } from 'react';
import { Button, View, Text } from "react-native";
import Counter from './SingletonCounter'

export default function CounterView(props) {
    const { tt } = props;

    // const { count, setCount } = useState(0);
    const [count, setCount] = useState(0);
    const onPress = () => {
        Counter.increateCounter();
        setCount(Counter.getCount());
        console.log(count, 'first view');
    }
    return (<View>
        <Button onPress={onPress} title={tt + ':' + count.toString()}></Button>
    </View>)
} 