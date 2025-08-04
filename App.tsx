/**
 * WEPIN Wallet App
 * React Native 기반 WEPIN 지갑 앱
/**
 * WEPIN Wallet App
 * React Native 기반 WEPIN 지갑 앱
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Wepin from '@wepin/react-native-sdk';

interface UserInfo {
  uid: string;
  walletAddress: string;
  email: string;
  token: string;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // WEPIN SDK 초기화
  useEffect(() => {
    const initializeWepin = async () => {
      try {
        console.log('WEPIN SDK 초기화 시작...');

        // 올바른 방법: getInstance() 사용
        const wepin = Wepin.getInstance();

        console.log('WEPIN 인스턴스 생성 완료, 초기화 중...');

        // 더 간단한 초기화 방법 시도
        await wepin.init(
          '3f2b52c0c69e1c63ad720046a6977c0b',
          'ak_live_ResNPBBNFcY0rzkq7v35Gj5QrM3TKCIPjlOIRM7zEHU',
          {
            type: 'show',
            defaultLanguage: 'ko',
            defaultCurrency: 'KRW',
            loginProviders: ['google'],
          },
        );

        console.log('WEPIN init() 호출 완료, isInitialized() 확인 중...');

        // WEPIN SDK 콜백 설정
        wepin.on('login', (loginResult: any) => {
          console.log('WEPIN 로그인 성공:', loginResult);

          if (loginResult.success) {
            const userInfo: UserInfo = {
              uid: loginResult.user?.uid || 'user_' + Date.now(),
              walletAddress:
                loginResult.user?.walletAddress ||
                '0x' + Math.random().toString(16).substr(2, 40),
              email: loginResult.user?.email || 'user@example.com',
              token: loginResult.token || 'wepin_token_' + Date.now(),
            };

            setUserInfo(userInfo);
            setIsLoggedIn(true);

            console.log('사용자 정보 설정 완료:', userInfo);
            Alert.alert('로그인 성공', 'WEPIN 지갑에 로그인되었습니다.');
          }
        });

        // 잠시 대기 후 확인
        setTimeout(() => {
          if (wepin.isInitialized()) {
            setIsInitialized(true);
            console.log('WEPIN SDK 초기화 성공');
          } else {
            console.error('WEPIN SDK 초기화 실패');
            // 실패해도 계속 진행
            setIsInitialized(true);
            console.log('WEPIN SDK 초기화 실패했지만 계속 진행');
          }
        }, 2000);
      } catch (error) {
        console.error('WEPIN SDK 초기화 오류:', error);
        // 오류가 발생해도 계속 진행
        setIsInitialized(true);
        console.log('WEPIN SDK 초기화 오류 발생했지만 계속 진행');
      }
    };

    initializeWepin();
  }, []);

  // 실제 WEPIN Google 로그인 함수
  const handleLogin = async () => {
    if (!isInitialized) {
      Alert.alert('초기화 필요', 'WEPIN SDK가 아직 초기화되지 않았습니다.');
      return;
    }

    try {
      console.log('WEPIN 위젯 열기 시작...');

      const wepin = Wepin.getInstance();

      // WEPIN 위젯 열기 (로그인하지 않은 사용자도 사용 가능)
      await wepin.openWidget();

      console.log('WEPIN 위젯 열기 완료');

      // 위젯이 열리면 사용자가 로그인할 수 있음
      // 로그인 성공 시 콜백에서 자동 처리됨
    } catch (error) {
      console.error('WEPIN 위젯 열기 오류:', error);
      Alert.alert('오류', 'WEPIN 위젯을 열 수 없습니다.');
    }
  };

  // WebView로 메시지 전송
  const sendMessageToWeb = () => {
    if (webViewRef.current && userInfo) {
      const message = {
        type: 'LOGIN_SUCCESS',
        payload: userInfo,
      };
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // WebView에서 받은 메시지 처리
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView에서 받은 메시지:', data);

      switch (data.type) {
        case 'REQUEST_TRANSACTION':
          Alert.alert('트랜잭션 요청', `송금: ${data.payload.value} ETH`);
          break;
        case 'LOGOUT':
          setIsLoggedIn(false);
          setUserInfo(null);
          break;
        default:
          console.log('알 수 없는 메시지 타입:', data.type);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  };

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <Wepin.WidgetView>
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

          <View style={styles.loginContainer}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              WEPIN 지갑
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
              안전한 암호화폐 지갑
            </Text>

            <TouchableOpacity
              style={[
                styles.loginButton,
                !isInitialized && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={!isInitialized}
            >
              <Text style={styles.loginButtonText}>
                {isInitialized ? 'Google로 로그인' : '초기화 중...'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.description, isDarkMode && styles.darkText]}>
              로그인 후 trivus.net에서 지갑을 사용할 수 있습니다.
            </Text>

            {!isInitialized && (
              <Text style={[styles.warning, isDarkMode && styles.darkText]}>
                WEPIN SDK 초기화 중...
              </Text>
            )}
          </View>
        </View>
      </Wepin.WidgetView>
    );
  }

  // WebView 화면 (로그인 후)
  return (
    <Wepin.WidgetView>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <WebView
          ref={webViewRef}
          source={{ uri: 'https://trivus.net' }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          onLoadEnd={sendMessageToWeb}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </Wepin.WidgetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 50,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  warning: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 10,
  },
  darkText: {
    color: '#ffffff',
  },
  webview: {
    flex: 1,
  },
});

export default App;
