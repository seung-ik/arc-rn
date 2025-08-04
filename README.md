# WEPIN Wallet App

React Native 기반 WEPIN 지갑 앱으로, WebView를 통해 Next.js 웹앱과 양방향 통신을 구현합니다.

## 🚀 주요 기능

- **WEPIN SDK 연동**: React Native에서 WEPIN 지갑 로그인 및 관리
- **WebView 통신**: postMessage를 통한 양방향 메시지 교환
- **트랜잭션 처리**: 웹앱에서 요청한 트랜잭션을 앱에서 처리
- **세션 관리**: 로그인 상태 및 사용자 정보 관리

## 📱 메시지 통신 구조

### RN → Web (앱에서 웹으로)

```javascript
{
  type: "LOGIN_SUCCESS",
  payload: {
    uid: "user_123",
    walletAddress: "0x123...",
    email: "user@example.com"
  }
}
```

### Web → RN (웹에서 앱으로)

```javascript
{
  type: "REQUEST_TRANSACTION",
  payload: {
    to: "0xabc...",
    value: "0.01"
  }
}
```

## 🛠 설치 및 실행

### 필수 요구사항

- Node.js 18+
- React Native CLI
- Xcode (iOS)
- Android Studio (Android)

### 설치

```bash
# 의존성 설치
npm install

# iOS 설정
cd ios
bundle install
bundle exec pod install
cd ..
```

### 실행

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## 📁 프로젝트 구조

```
WepinWalletApp/
├── App.tsx                 # 메인 앱 컴포넌트
├── ios/                    # iOS 네이티브 코드
├── android/                # Android 네이티브 코드
├── package.json            # 프로젝트 의존성
└── README.md              # 프로젝트 문서
```

## 🔧 주요 컴포넌트

### App.tsx

- WebView 컴포넌트 관리
- postMessage 통신 처리
- 로그인/로그아웃 상태 관리
- 트랜잭션 요청 처리

### 메시지 타입

- `LOGIN_SUCCESS`: 로그인 성공 시 웹으로 전송
- `LOGOUT`: 로그아웃 시 웹으로 전송
- `REQUEST_TRANSACTION`: 웹에서 트랜잭션 요청
- `TRANSACTION_RESULT`: 트랜잭션 결과를 웹으로 전송
- `WALLET_INFO`: 지갑 정보 요청/응답

## 🔐 보안 고려사항

- 민감한 지갑 정보는 안전한 방식으로 전달
- 트랜잭션 승인은 사용자 확인 후 처리
- WebView 통신은 JSON 형태로 검증된 메시지만 처리

## 🚧 TODO

- [ ] 실제 WEPIN SDK 연동
- [ ] 트랜잭션 서명 구현
- [ ] 에러 처리 강화
- [ ] 보안 강화
- [ ] 테스트 코드 작성

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

## �� 라이선스

MIT License
# arc-rn
