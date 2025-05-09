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

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
  password: Yup.string().min(6, 'Mật khẩu quá ngắn').required('Bắt buộc'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Mật khẩu không khớp')
    .required('Bắt buộc'),
  name: Yup.string().required('Bắt buộc'),
  age: Yup.number().required('Bắt buộc').positive().integer(),
  gender: Yup.string().required('Bắt buộc'),
});

const SignupScreen = ({ navigation }: { navigation: SignUpScreenNavigationProp }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '', confirmPassword: '', name: '', age: '', gender: '' },
    validationSchema: SignupSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(values.email, values.password);
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
          name: values.name,
          age: parseInt(values.age),
          gender: values.gender,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await firebase.auth().signOut();
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
        <Text style={styles.title}>Đăng ký</Text>
        <TextInput
          placeholder="Email"
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
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
        <TextInput
          placeholder="Xác nhận mật khẩu"
          value={formik.values.confirmPassword}
          onChangeText={formik.handleChange('confirmPassword')}
          secureTextEntry
          style={styles.input}
        />
        {formik.errors.confirmPassword && <Text style={{ color: 'red' }}>{formik.errors.confirmPassword}</Text>}
        <TextInput
          placeholder="Họ tên"
          value={formik.values.name}
          onChangeText={formik.handleChange('name')}
          style={styles.input}
        />
        {formik.errors.name && <Text style={{ color: 'red' }}>{formik.errors.name}</Text>}
        <TextInput
          placeholder="Tuổi"
          value={formik.values.age}
          onChangeText={formik.handleChange('age')}
          keyboardType="numeric"
          style={styles.input}
        />
        {formik.errors.age && <Text style={{ color: 'red' }}>{formik.errors.age}</Text>}
        <TextInput
          placeholder="Giới tính"
          value={formik.values.gender}
          onChangeText={formik.handleChange('gender')}
          style={styles.input}
        />
        {formik.errors.gender && <Text style={{ color: 'red' }}>{formik.errors.gender}</Text>}
        <CustomButton
          title={loading ? 'Đang xử lý...' : 'Đăng ký'}
          onPress={() => formik.handleSubmit()}
          disabled={loading}
          loading={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
        <CustomButton
          title="Đã có tài khoản? Đăng nhập"
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          loading={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default SignupScreen;

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
    fontSize: 16
  },
})