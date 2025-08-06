import React, { useRef } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { RootStackParamList } from '../types';

type WebViewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WebView'
>;
type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

interface WebViewScreenProps {
  navigation: WebViewScreenNavigationProp;
  route: WebViewScreenRouteProp;
}

function WebViewScreen({ navigation, route }: WebViewScreenProps) {
  const { userInfo } = route.params;
  const webViewRef = useRef<WebView>(null);

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
