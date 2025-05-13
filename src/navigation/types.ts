export type AppStackParamList = {
  Home: undefined;
  TaskDetail: { task: { id: string; title: string; description: string; startDate: string; endDate: string; userId: string } };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};