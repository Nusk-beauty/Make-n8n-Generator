import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatIAScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Chat con Agente IA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatIAScreen;
