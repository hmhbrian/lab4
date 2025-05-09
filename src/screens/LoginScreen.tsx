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

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
  password: Yup.string().required('Bắt buộc'),
});

const LoginScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await firebase.auth().signInWithEmailAndPassword(values.email, values.password);
      } catch (error:any) {
        Alert.alert('Lỗi', error.message);
      }
      setLoading(false);
    },
  });

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Đăng nhập</Text>
        <TextInput
          placeholder="Email"
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
          keyboardType="email-address"
          style={styles.input}
        />
        {formik.errors.email && <Text style={{ color: 'red' }}>{formik.errors.email}</Text>}
        <TextInput
          placeholder="Mật khẩu"
          value={formik.values.password}
          onChangeText={formik.handleChange('password')}
          secureTextEntry
          style={styles.input}
        />
        {formik.errors.password && <Text style={{ color: 'red' }}>{formik.errors.password}</Text>}
        <CustomButton
          title={loading ? 'Đang xử lý...' : 'Đăng nhập'}
          onPress={() => formik.handleSubmit()}
          disabled={loading}
          loading={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
        <CustomButton
          title="Quên mật khẩu?"
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
        <CustomButton
          title="Chưa có tài khoản? Đăng ký"
          onPress={() => navigation.navigate('Signup')}
          disabled={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
})