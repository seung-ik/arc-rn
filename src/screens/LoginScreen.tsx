import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Wepin from '@wepin/react-native-sdk';
import { UserInfo, RootStackParamList } from '../types';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

function LoginScreen({ navigation }: LoginScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [isInitialized, setIsInitialized] = useState(false);

  // WEPIN SDK 초기화
  useEffect(() => {
    const initializeWepin = async () => {
      try {
        console.log('WEPIN SDK 초기화 시작...');

        // WEPIN 인스턴스 생성
        const wepin = Wepin.getInstance();
        console.log('WEPIN 인스턴스 생성 완료');

        // 간단한 초기화 설정
        const initConfig = {
          type: 'show', // 다시 'show'로 변경하여 정상 초기화 확인
          defaultLanguage: 'ko',
          defaultCurrency: 'KRW',
          loginProviders: ['google'],
        };

        console.log('WEPIN 초기화 설정:', initConfig);

        // SDK 초기화
        await wepin.init(
          '3f2b52c0c69e1c63ad720046a6977c0b',
          'ak_live_ResNPBBNFcY0rzkq7v35Gj5QrM3TKCIPjlOIRM7zEHU',
          initConfig,
        );

        console.log('WEPIN init() 호출 완료');

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

            console.log('사용자 정보 설정 완료:', userInfo);
            Alert.alert('로그인 성공', 'WEPIN 지갑에 로그인되었습니다.');

            // 네비게이션으로 WebView 화면으로 이동
            navigation.replace('WebView', { userInfo });
          }
        });

        // 초기화 완료로 설정
        console.log('WEPIN SDK 초기화 완료');
        setIsInitialized(true);
      } catch (error) {
        console.error('WEPIN SDK 초기화 오류:', error);
        console.error('오류 상세:', JSON.stringify(error, null, 2));

        // 오류가 발생해도 계속 진행 (개발 중에는 허용)
        setIsInitialized(true);
        console.log('WEPIN SDK 초기화 오류 발생했지만 계속 진행');
      }
    };

    initializeWepin();
  }, [navigation]);

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
      Alert.alert(
        '오류',
        'WEPIN 위젯을 열 수 없습니다. SDK 초기화 상태를 확인해주세요.',
      );
    }
  };

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

          {/* 임시 테스트 버튼 - 로그인 성공 후 수동 이동용 */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              { marginTop: 10, backgroundColor: '#28a745' },
            ]}
            onPress={() => {
              const testUserInfo: UserInfo = {
                uid: 'test_user_' + Date.now(),
                walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
                email: 'test@example.com',
                token: 'test_token_' + Date.now(),
              };
              navigation.replace('WebView', { userInfo: testUserInfo });
            }}
          >
            <Text style={styles.loginButtonText}>테스트: Trivus로 이동</Text>
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
});

export default LoginScreen;
