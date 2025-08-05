# WEPIN Wallet App

React Native 기반 WEPIN 지갑 앱으로, WebView를 통해 Next.js 웹앱과 양방향 통신을 구현합니다.

## 🎯 프로젝트 배경

### **문제 상황**

- 기존: Next.js 웹앱 + WEPIN Web SDK + Google OAuth
- 문제: WebView 환경에서 Google OAuth 차단 및 WEPIN 세션 유지 실패
- 원인: WEPIN Web SDK가 내부적으로 Google OAuth를 실행하여 WebView 보안 정책에 차단됨

### **해결 방안**

- React Native 앱에 WEPIN SDK 직접 연동
- 앱에서 로그인 및 지갑 생성 처리
- WebView와 postMessage로 양방향 메시지 통신
- 지갑 정보 및 사용자 정보를 WebView로 전달

## 🏗️ 아키텍처 구조

```
React Native 앱
├── 로그인 전: React Native 로그인 화면 (WebView 숨김)
├── 로그인 후: WebView로 trivus.net 로드
└── 통신: postMessage로 양방향 메시지 교환
```

### **화면 흐름**

1. **앱 실행** → React Native 로그인 화면 표시
2. **로그인 버튼 클릭** → WEPIN SDK로 실제 로그인 처리
3. **로그인 완료** → WebView 표시 + 로그인 정보 메시지 전송
4. **WebView 내 페이지** → 메시지 받아서 토큰으로 변환
5. **이후 페이지들** → 로그인된 상태로 웹 페이지들 표시

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

## 🚀 주요 기능

- **WEPIN SDK 연동**: React Native에서 WEPIN 지갑 로그인 및 관리
- **WebView 통신**: postMessage를 통한 양방향 메시지 교환
- **트랜잭션 처리**: 웹앱에서 요청한 트랜잭션을 앱에서 처리
- **세션 관리**: 로그인 상태 및 사용자 정보 관리

## 🛠 설치 및 실행

### 필수 요구사항

- Node.js 18+
- React Native CLI
- Xcode (iOS)
- Android Studio (Android)

### 설치

```bash
# 프로젝트 클론
git clone https://github.com/seung-ik/arc-rn.git
cd arc-rn

# 의존성 설치
npm install --legacy-peer-deps

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
├── App.tsx                 # 메인 앱 컴포넌트 (로그인 화면 + WebView)
├── ios/                    # iOS 네이티브 코드
├── android/                # Android 네이티브 코드
├── web-example/            # 웹 페이지 예시 코드
│   ├── login-bridge.tsx    # WebView에서 사용할 페이지
│   └── types.d.ts          # TypeScript 타입 정의
├── test-page.html          # 테스트용 HTML 페이지
├── package.json            # 프로젝트 의존성
└── README.md              # 프로젝트 문서
```

## 🔧 주요 컴포넌트

### App.tsx

- **로그인 전**: React Native 로그인 화면 렌더링
- **로그인 후**: WebView 컴포넌트 관리
- **postMessage 통신**: 양방향 메시지 처리
- **로그인/로그아웃**: 상태 관리 및 메시지 전송

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

## 🚧 현재 구현 상태

### ✅ 완료된 작업

- [x] React Native 앱 기본 구조
- [x] 로그인 화면 UI (가짜 로그인)
- [x] WebView 통신 로직
- [x] postMessage 양방향 통신
- [x] GitHub 저장소 생성 및 푸시

### ❌ TODO (다음 단계)

- [ ] 실제 WEPIN SDK 연동
- [ ] trivus.net에 login-bridge 페이지 추가
- [ ] 트랜잭션 서명 구현
- [ ] 에러 처리 강화
- [ ] 보안 강화
- [ ] 테스트 코드 작성

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

현재 상황 정리:
✅ 이미 구현된 부분:
WEPIN SDK 위젯 방식 로그인 (기존 코드)
wepin.setUserInfo() 메서드 존재 확인
❌ 아직 안 되는 부분:
WepinLogin OAuth 로그인 (Google 클라이언트 ID 필요)
wepin.setUserInfo(userInfo) 연동
�� 완성되면 가능한 것:
WepinLogin으로 로그인 → userInfo 획득
WEPIN SDK에 주입 → wepin.setUserInfo(userInfo)
이제 위젯도 사용 가능 → wepin.openWidget(), wepin.getStatus() 등
결론: Google 클라이언트 ID만 발급받으면 WepinLogin 로그인 → WEPIN SDK 연동 → 위젯 사용까지 모두 가능해집니다!
현재는 Google 클라이언트 ID가 없어서 WepinLogin 부분만 안 되는 상태입니다.

## 📄 라이선스

MIT License
