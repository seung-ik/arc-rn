import React, { useEffect } from 'react';
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { RootStackParamList } from '../types';
import { useWepin } from '../context/WepinContext';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

function LoginScreen({ navigation }: LoginScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const { wepinSdk, wepinLogin, isInitialized } = useWepin();

  // 구글 로그인 초기화
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        // 구글 로그인 초기화
        GoogleSignin.configure({
          webClientId:
            '1012292393537-fofiieobpcsbvl48vqkbemf913d3f7gf.apps.googleusercontent.com', // Google OAuth 클라이언트 ID
          offlineAccess: true,
        });
        console.log('✅ 구글 로그인 초기화 완료');
      } catch (error) {
        console.error('구글 로그인 초기화 오류:', error);
      }
    };

    initializeGoogleSignIn();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      console.log('=== 로그아웃 시작 ===');

      // WEPIN Login 로그아웃
      try {
        if (wepinLogin) {
          await wepinLogin.logoutWepin();
          console.log('✅ WEPIN Login 로그아웃 성공');
        }
      } catch (wepinLoginError) {
        console.error('❌ WEPIN Login 로그아웃 실패:', wepinLoginError);
      }

      console.log('✅ 모든 로그아웃 완료');
      Alert.alert('로그아웃 완료', '구글과 WEPIN에서 모두 로그아웃되었습니다.');
    } catch (error: any) {
      console.error('❌ 로그아웃 중 오류:', error.message || error);
      Alert.alert('로그아웃 실패', '로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 구글 라이브러리로 직접 ID 토큰 가져오기 테스트
  const handleGoogleSignInTest = async () => {
    if (!wepinLogin || !isInitialized || !wepinSdk) {
      throw new Error('WEPIN SDK가 초기화되지 않았습니다.');
    }

    try {
      // 구글 서비스 사용 가능 여부 확인
      await GoogleSignin.hasPlayServices();

      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type === 'success') {
        const userInfo = signInResult.data;
        const idToken = userInfo.idToken || '';

        const loginResult = await wepinLogin.loginWithIdToken({
          token: idToken,
        });

        const wepinFirebaseToken = loginResult.token;

        const wepinUser = await wepinLogin.loginWepin({
          provider: 'google',
          token: {
            idToken: wepinFirebaseToken.idToken,
            refreshToken: wepinFirebaseToken.refreshToken,
          },
        });

        console.log('WEPIN 로그인 결과:', wepinUser);

        if (wepinUser && wepinUser.status === 'success') {
          console.log('WEPIN 로그인 성공!');

          // WebView로 이동
          navigation.replace('WebView');
        } else {
          console.error('WEPIN 로그인 실패:', wepinUser);
          Alert.alert(
            '로그인 실패',
            'WEPIN 로그인에 실패했습니다. 다시 시도해주세요.',
          );
        }
      }
    } catch (error: any) {
      Alert.alert(
        '구글 로그인 실패',
        `오류: ${error.message || '알 수 없는 오류'}`,
      );
    }
  };

  return (
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
          style={[styles.loginButton, !isInitialized && styles.disabledButton]}
          onPress={handleGoogleSignInTest}
          disabled={!isInitialized}
        >
          <Text style={styles.loginButtonText}>
            {isInitialized ? 'Google로 로그인' : '초기화 중...'}
          </Text>
        </TouchableOpacity>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={[styles.logoutButton, !isInitialized && styles.disabledButton]}
          onPress={handleLogout}
          disabled={!isInitialized}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        {/* 구글 로그인 테스트 버튼 */}
        <TouchableOpacity
          style={[styles.testButton, !isInitialized && styles.disabledButton]}
          onPress={handleGoogleSignInTest}
          disabled={!isInitialized}
        >
          <Text style={styles.testButtonText}>구글 로그인 테스트</Text>
        </TouchableOpacity>

        {/* 임시 테스트 버튼 - 로그인 성공 후 수동 이동용 */}
        {/* <TouchableOpacity
            style={[
              styles.loginButton,
              { marginTop: 10, backgroundColor: '#28a745' },
            ]}
            onPress={async () => {
              try {
                if (!wepinLogin) {
                  throw new Error('WEPIN SDK가 초기화되지 않았습니다.');
                }

                // 1. OAuth 로그인 (Google)
                const oauthResult = await wepinLogin.loginWithOauthProvider({
                  provider: 'google',
                  clientId:
                    '1012292393537-fofiieobpcsbvl48vqkbemf913d3f7gf.apps.googleusercontent.com', // Google OAuth 클라이언트 ID
                });

                // 2. Firebase Token으로 WEPIN 로그인
                const wepinUser = await wepinLogin.loginWepin({
                  provider: oauthResult.provider,
                  token: {
                    idToken: oauthResult.token,
                    refreshToken: oauthResult.token,
                  },
                });

                // 3. 사용자 정보 구성
                const userInfo: UserInfo = {
                  uid: wepinUser.userInfo?.userId || 'user_' + Date.now(),
                  walletAddress:
                    wepinUser.walletId ||
                    '0x' + Math.random().toString(16).substr(2, 40),
                  email: wepinUser.userInfo?.email || 'user@example.com',
                  token:
                    wepinUser.token?.accessToken || 'wepin_token_' + Date.now(),
                };

                navigation.replace('WebView', { userInfo });
              } catch (error: any) {
                console.error('테스트 로그인 오류:', error.message || error);

                // 오류 발생 시 테스트 데이터 사용
                const testUserInfo: UserInfo = {
                  uid: 'error_user_' + Date.now(),
                  walletAddress:
                    '0x' + Math.random().toString(16).substr(2, 40),
                  email: 'error@example.com',
                  token: 'error_token_' + Date.now(),
                };
                navigation.replace('WebView', { userInfo: testUserInfo });
              }
            }}
          >
            <Text style={styles.loginButtonText}>
              테스트: 실제 WEPIN 정보로 이동
            </Text>
          </TouchableOpacity> */}

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
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#4CAF50', // 초록색 테스트 버튼
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  testButtonText: {
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
