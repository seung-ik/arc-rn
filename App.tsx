/**
 * WEPIN Wallet App
 * React Native 기반 WEPIN 지갑 앱
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './src/screens/LoginScreen';
import WebViewScreen from './src/screens/WebViewScreen';
import { RootStackParamList } from './src/types';
import Wepin from '@wepin/react-native-sdk';
import WepinLogin from '@wepin/login-rn';
import { WepinProvider, useWepin } from './src/context/WepinContext';
import './shim';

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const [initialRoute, setInitialRoute] = useState<'Login' | 'WebView'>(
    'Login',
  );
  const { setWepinSdk, setWepinLogin, isInitialized, setIsInitialized } =
    useWepin();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // WEPIN SDK 초기화
        const wepinInstance = Wepin.getInstance();
        await wepinInstance.init(
          '3f2b52c0c69e1c63ad720046a6977c0b',
          'ak_live_nyLcIlDwtwbhw16y0Qvo9lKuuF2DkuFqnRQX1tj34MR',
        );
        setWepinSdk(wepinInstance);

        // WEPIN Login 초기화
        const loginInstance = new WepinLogin({
          appId: '3f2b52c0c69e1c63ad720046a6977c0b',
          appKey: 'ak_live_nyLcIlDwtwbhw16y0Qvo9lKuuF2DkuFqnRQX1tj34MR',
        });
        await loginInstance.init();
        setWepinLogin(loginInstance);

        // 로그인 상태 확인
        try {
          const currentUser = await loginInstance.getCurrentWepinUser();
          console.log('현재 로그인된 사용자:', currentUser);

          if (currentUser && currentUser.status === 'success') {
            // 로그인된 상태면 WebView로 이동
            setInitialRoute('WebView');
          } else {
            // 로그인되지 않은 상태면 Login으로 이동
            setInitialRoute('Login');
          }
        } catch (error) {
          console.log('로그인 상태 확인 실패, Login으로 이동:', error);
          setInitialRoute('Login');
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('앱 초기화 실패:', error);
        setInitialRoute('Login');
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [setWepinSdk, setWepinLogin, setIsInitialized]);

  if (!isInitialized) {
    // 초기화 중일 때 로딩 화면 표시
    return (
      <Wepin.WidgetView>
        <GestureHandlerRootView
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          {/* 로딩 화면 */}
        </GestureHandlerRootView>
      </Wepin.WidgetView>
    );
  }

  return (
    <Wepin.WidgetView>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
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

function App() {
  return (
    <WepinProvider>
      <AppContent />
    </WepinProvider>
  );
}

export default App;
