export interface UserInfo {
  uid: string;
  walletAddress: string;
  email: string;
  token: string;
}

export type RootStackParamList = {
  Login: undefined;
  WebView: { userInfo: UserInfo };
};
