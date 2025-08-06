import React, { useRef } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { RootStackParamList } from '../types';
import { useWepin } from '../context/WepinContext';

type WebViewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WebView'
>;
type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

interface WebViewScreenProps {
  navigation: WebViewScreenNavigationProp;
  route: WebViewScreenRouteProp;
}

function WebViewScreen({ navigation }: WebViewScreenProps) {
  const { wepinLogin, isInitialized } = useWepin();
  const webViewRef = useRef<WebView>(null);

  // WEPIN 상태 확인 및 로그인 화면으로 이동
  const checkWepinStatus = async () => {
    if (!isInitialized) {
      console.log('WEPIN SDK가 초기화되지 않음, 로그인 화면으로 이동');
      await cleanupWepin();
      navigation.replace('Login');
      return false;
    }

    if (!wepinLogin) {
      console.log('WEPIN Login 인스턴스가 없음, 로그인 화면으로 이동');
      await cleanupWepin();
      navigation.replace('Login');
      return false;
    }
    console.log('초기화 완료');
    return true;
  };

  // WEPIN 정리 함수
  const cleanupWepin = async () => {
    try {
      if (wepinLogin) {
        // WEPIN 로그아웃
        await wepinLogin.logoutWepin();
        console.log('WEPIN 로그아웃 완료');
      }
    } catch (error) {
      console.error('WEPIN 정리 중 오류:', error);
    }
  };

  // WebView로 WEPIN 사용자 정보 전송
  const sendWepinUserToWeb = async () => {
    // WEPIN 상태 확인
    if (!(await checkWepinStatus())) {
      return;
    }
    if (webViewRef.current && wepinLogin) {
      console.log(1);
      try {
        const userData = await wepinLogin.getCurrentWepinUser();
        console.log('userData', userData);
        if (userData && userData.status === 'success') {
          const message = {
            type: 'WEPIN_USER_DATA',
            payload: { wepinUser: userData, idToken: '' },
          };
          webViewRef.current.postMessage(JSON.stringify(message));
          console.log(3);
        } else {
          console.log(
            'WEPIN 사용자 정보가 없거나 로그인되지 않음, 로그인 화면으로 이동',
          );
          await cleanupWepin();
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        await cleanupWepin();
        navigation.replace('Login');
      }
    }
  };

  // WebView에서 받은 메시지 처리
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView에서 받은 메시지:', data);

      switch (data.type) {
        case 'DEBUG_LOG':
          console.log('🌐 웹뷰 디버그 로그:', data.message);
          break;
        default:
          console.log('알 수 없는 메시지 타입:', data.type);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <WebView
        ref={webViewRef}
        source={{ uri: 'https://trivus.net/auth/login-bridge' }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onLoadEnd={sendWepinUserToWeb}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
