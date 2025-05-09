import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { firebase } from '../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../component/Button';

type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
  };
  
  type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
});

const ForgotPasswordScreen = ({ navigation }: { navigation: ForgotPasswordScreenNavigationProp }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await firebase.auth().sendPasswordResetEmail(values.email);
        Alert.alert('Thành công', 'Email đặt lại mật khẩu đã được gửi.');
        navigation.navigate('Login');
      } catch (error:any) {
        Alert.alert('Lỗi', error.message);
      }
      setLoading(false);
    },
  });

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <TextInput
          placeholder="Email"
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
          style={styles.input}
          keyboardType="email-address"
        />
        {formik.errors.email && <Text style={{ color: 'red' }}>{formik.errors.email}</Text>}
        <CustomButton
          title={loading ? 'Đang xử lý...' : 'Gửi email'}
          onPress={() => formik.handleSubmit()}
          disabled={loading}
          loading={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
        <CustomButton
          title="Quay lại đăng nhập"
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          loading={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
})