/**
 * WEPIN Wallet App
 * React Native 기반 WEPIN 지갑 앱
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './src/screens/LoginScreen';
import WebViewScreen from './src/screens/WebViewScreen';
import { RootStackParamList } from './src/types';
import './shim';
import { Linking } from 'react-native';
import Wepin from '@wepin/react-native-sdk';

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  useEffect(() => {
    // 앱 cold start일 경우 URL 가져오기
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('🔥 getInitialURL로 받은 딥링크:', url);
        // 여기서 token 파싱해서 처리 가능
      }
    });

    // 앱 실행 중일 때 들어온 URL 처리
    const handleUrl = ({ url }: { url: string }) => {
      console.log('🔥 딥링크 이벤트 수신:', url);
      // 예: const token = extractTokenFromURL(url);
      //     wepinLogin.loginWithIdToken({ token });
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Wepin.WidgetView>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false, // 헤더 숨기기
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="WebView" component={WebViewScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </Wepin.WidgetView>
  );
}

export default App;
