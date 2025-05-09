import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthenticatedUserContext } from '../context/AuthenticateUserContext';
//import { firestore } from '../config/firebaseConfig';
import { doc, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { firebase } from '../config/firebaseConfig';
import CustomButton from '../component/Button';

type AppStackParamList = {
    Home: undefined;
    Profile: undefined;
  };

type ProfileScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Profile'>;

interface User extends FirebaseAuthTypes.User {
    name?: string;
    age?: number;
    gender?: string;
    createdAt?: FirebaseFirestoreTypes.Timestamp;
  }
  
  const ProfileSchema = Yup.object().shape({
    name: Yup.string().required('Bắt buộc'),
    age: Yup.number().required('Bắt buộc').positive().integer(),
    gender: Yup.string().required('Bắt buộc'),
  });

  const ProfileScreen = ({ navigation }: { navigation: ProfileScreenNavigationProp }) => {
    const { user, setUser } = useContext(AuthenticatedUserContext);
    const [loading, setLoading] = useState(false);
  
    const formik = useFormik({
      initialValues: {
        name: user?.name || '',
        age: user?.age?.toString() || '',
        gender: user?.gender || '',
      },
      validationSchema: ProfileSchema,
      onSubmit: async (values) => {
        if (!user) {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
          return;
        }
  
        setLoading(true);
        try {
          await updateDoc(doc(firebase.firestore(), 'users', user.uid), {
            name: values.name,
            age: parseInt(values.age),
            gender: values.gender,
            updatedAt: serverTimestamp(),
          });
  
          // Cập nhật trạng thái user
          const updatedUser: User = {
            ...user,
            name: values.name,
            age: parseInt(values.age),
            gender: values.gender,
          };
          setUser(updatedUser);
  
          Alert.alert('Thành công', 'Thông tin đã được cập nhật.');
        } catch (error:any) {
          Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi không xác định');
        }
        setLoading(false);
      },
    });

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
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
          title={loading ? 'Đang xử lý...' : 'Cập nhật'}
          onPress={() => formik.handleSubmit()}
          disabled={loading}
          loading={loading}
          style={{ backgroundColor: '#007AFF' }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileScreen;

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