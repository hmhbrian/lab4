import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { firebase } from '../config/firebaseConfig';
import { AuthenticatedUserContext } from '../context/AuthenticateUserContext';
import CustomButton from '../component/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from 'react-native-modal';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface User extends FirebaseAuthTypes.User {
  name?: string;
  age?: number;
  gender?: string;
}

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Bắt buộc'),
  age: Yup.number().required('Bắt buộc').positive().integer(),
  gender: Yup.string().required('Bắt buộc'),
});

const ProfileTab: React.FC = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isModalVisible, setModalVisible] = useState(false);

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
      try {
        await firebase.firestore().collection('users').doc(user.uid).update({
          name: values.name,
          age: parseInt(values.age),
          gender: values.gender,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        const updatedUser: User = {
          ...user,
          name: values.name,
          age: parseInt(values.age),
          gender: values.gender,
        };
        setUser(updatedUser);

        Alert.alert('Thành công', 'Thông tin đã được cập nhật.');
        setModalVisible(false);
      } catch (error: any) {
        console.error('Lỗi cập nhật thông tin:', error);
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin.');
      }
    },
  });

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng xuất.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin cá nhân</Text>
      <Text style={styles.detail}>Tên: {user?.name || 'Chưa cập nhật'}</Text>
      <Text style={styles.detail}>Tuổi: {user?.age || 'Chưa cập nhật'}</Text>
      <Text style={styles.detail}>Giới tính: {user?.gender || 'Chưa cập nhật'}</Text>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Cập nhật thông tin"
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: '#007AFF', width: '48%' }}
        />
        <CustomButton
          title="Đăng xuất"
          onPress={handleSignOut}
          style={{ backgroundColor: '#FF3B30', width: '48%' }}
        />
      </View>

      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cập nhật thông tin</Text>
          <TextInput
            placeholder="Họ tên"
            value={formik.values.name}
            onChangeText={formik.handleChange('name')}
            style={styles.input}
          />
          {formik.errors.name && <Text style={styles.error}>{formik.errors.name}</Text>}
          <TextInput
            placeholder="Tuổi"
            value={formik.values.age}
            onChangeText={formik.handleChange('age')}
            keyboardType="numeric"
            style={styles.input}
          />
          {formik.errors.age && <Text style={styles.error}>{formik.errors.age}</Text>}
          <TextInput
            placeholder="Giới tính"
            value={formik.values.gender}
            onChangeText={formik.handleChange('gender')}
            style={styles.input}
          />
          {formik.errors.gender && <Text style={styles.error}>{formik.errors.gender}</Text>}
          <CustomButton
            title="Lưu"
            onPress={() => formik.handleSubmit()}
            style={{ backgroundColor: '#28a745' }}
          />
          <CustomButton
            title="Hủy"
            onPress={() => setModalVisible(false)}
            style={{ backgroundColor: '#FF9500' }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default ProfileTab;