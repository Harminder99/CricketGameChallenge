/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {NativeModules} from 'react-native';
const {MatchCalculations} = NativeModules;

MatchCalculations.createMatchLogs(txt => {
  console.log(txt);
});

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const createPromiseNativeTest = async () => {
    try {
      var result = await MatchCalculations.createMatchLogsWithPromise();
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.sectionContainer]}>
      <Text style={{color: 'black'}}>App</Text>
      <Button title={'Press here'} onPress={createPromiseNativeTest} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
