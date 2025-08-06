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
import WepinLogin from '@wepin/login-rn';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { RootStackParamList } from '../types';

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
  const [wepinLogin, setWepinLogin] = useState<WepinLogin | null>(null);
  const [wepinSdk, setWepinSdk] = useState<Wepin | null>(null);

  // WEPIN SDK 초기화
  useEffect(() => {
    const initializeWepin = async () => {
      try {
        // 구글 로그인 초기화
        GoogleSignin.configure({
          webClientId:
            '1012292393537-fofiieobpcsbvl48vqkbemf913d3f7gf.apps.googleusercontent.com', // Google OAuth 클라이언트 ID
          offlineAccess: true,
        });
        console.log('✅ 구글 로그인 초기화 완료');

        const wepinInstance = Wepin.getInstance();
        await wepinInstance.init(
          '3f2b52c0c69e1c63ad720046a6977c0b',
          'ak_live_nyLcIlDwtwbhw16y0Qvo9lKuuF2DkuFqnRQX1tj34MR',
        );

        const loginInstance = new WepinLogin({
          appId: '3f2b52c0c69e1c63ad720046a6977c0b',
          appKey: 'ak_live_nyLcIlDwtwbhw16y0Qvo9lKuuF2DkuFqnRQX1tj34MR',
        });

        await loginInstance.init();
        if (loginInstance.isInitialized()) {
          // Success to initialize WepinLogin
          console.log('WEPIN SDK 초기화 성공');
          setWepinSdk(wepinInstance);
          setWepinLogin(loginInstance);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('WEPIN SDK 초기화 오류:', error);
      }
    };

    initializeWepin();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      console.log('=== 로그아웃 시작 ===');

      // 구글 로그아웃
      try {
        await GoogleSignin.signOut();
        console.log('✅ 구글 로그아웃 성공');
      } catch (googleError) {
        console.error('❌ 구글 로그아웃 실패:', googleError);
      }

      // WEPIN 로그아웃
      try {
        if (wepinSdk) {
          await wepinSdk.logout();
          console.log('✅ WEPIN 로그아웃 성공');
        }
      } catch (wepinError) {
        console.error('❌ WEPIN 로그아웃 실패:', wepinError);
      }

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

  // 실제 WEPIN Google 로그인 함수
  const handleLogin = async () => {
    if (!isInitialized || !wepinLogin) {
      console.log(2);
      Alert.alert('초기화 필요', 'WEPIN SDK가 아직 초기화되지 않았습니다.');
      return;
    }
    console.log(3);
    try {
      if (!wepinLogin._isInitialized) {
        throw new Error('WEPIN SDK가 초기화되지 않았습니다.');
      }

      const oauthResult = await wepinLogin.loginWithOauthProvider({
        provider: 'google',
        clientId:
          '1012292393537-fofiieobpcsbvl48vqkbemf913d3f7gf.apps.googleusercontent.com', // Google OAuth 클라이언트 ID
      });

      const wepinUser = await wepinLogin.loginWithIdToken({
        token: oauthResult.token,
      });

      console.log(oauthResult, wepinUser);
      console.log('OAuth 로그인 성공!');

      Alert.alert('로그인 성공', 'WEPIN 지갑에 로그인되었습니다.');
      navigation.replace('WebView', {
        userInfo: {
          uid: 'string',
          walletAddress: 'string',
          email: 'string',
          token: 'string',
        },
      });
    } catch (error: any) {
      console.error('WEPIN 로그인 오류 발생!');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);
      Alert.alert(
        '로그인 실패',
        `WEPIN 로그인 중 오류가 발생했습니다: ${
          error.message || '알 수 없는 오류'
        }`,
      );
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

        console.log(wepinUser, 'wepinUser');
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
          onPress={handleLogin}
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
