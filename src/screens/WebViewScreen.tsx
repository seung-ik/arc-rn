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
      try {
        const userData = await wepinLogin.getCurrentWepinUser();
        console.log('현재 WEPIN 사용자 정보:', userData);

        if (userData && userData.status === 'success') {
          const message = {
            type: 'WEPIN_USER_DATA',
            payload: userData,
          };
          console.log('웹으로 전달할 WEPIN 사용자 정보:', userData);
          webViewRef.current.postMessage(JSON.stringify(message));
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
        case 'WEPIN_ACCOUNTS_LOADED':
          console.log('WEPIN 계정 정보 로드 완료:', data.payload);
          // 백엔드 로그인 처리 후 토큰 받기
          break;
        case 'BACKEND_LOGIN_SUCCESS':
          console.log('백엔드 로그인 성공:', data.payload);
          // 토큰을 받아서 앱에서 사용
          break;
        case 'LOGOUT':
          // 로그인 화면으로 돌아가기
          navigation.replace('Login');
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
        source={{ uri: 'https://trivus.net/login-bridge' }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onLoadEnd={sendWepinUserToWeb}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
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
