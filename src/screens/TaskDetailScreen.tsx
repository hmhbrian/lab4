import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { firebase } from '../config/firebaseConfig';
import CustomButton from '../component/Button';
import TaskFormModal from '../component/TaskModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStackParamList } from '../navigation/types';

type TaskDetailScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'TaskDetail'>;

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string, 
  endDate: string,
  userId: string;
}

interface TaskDetailScreenProps {
  navigation: TaskDetailScreenNavigationProp;
  route: { params: { task: Task } };
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
  const { task } = route.params;
  const [isModalVisible, setModalVisible] = useState(false);

  const handleUpdateTask = async (values: { title: string; description: string; startDate: string; endDate: string }) => {
    try {
      await firebase.firestore().collection('tasks').doc(task.id).update({
        title: values.title,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Cập nhật AsyncStorage
      const storedTasks = await AsyncStorage.getItem('tasks');
      let tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      tasks = tasks.map((t) =>
        t.id === task.id ? { ...t, title: values.title, description: values.description, startDate: values.startDate, endDate: values.endDate } : t
      );
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));

      Alert.alert('Thành công', 'Công việc đã được cập nhật.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Lỗi cập nhật công việc:', error);
      throw error; // Để TaskFormModal xử lý lỗi
    }
  };

  const handleDelete = async () => {
    try {
      await firebase.firestore().collection('tasks').doc(task.id).delete();

      // Cập nhật AsyncStorage
      const storedTasks = await AsyncStorage.getItem('tasks');
      let tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      tasks = tasks.filter((t) => t.id !== task.id);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));

      Alert.alert('Thành công', 'Công việc đã được xóa.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Lỗi xóa công việc:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xóa công việc.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết công việc</Text>
      <Text style={styles.detail}>Tiêu đề: {task.title}</Text>
      <Text style={styles.detail}>Mô tả: {task.description}</Text>
      <Text style={styles.detail}>Ngày bắt đầu: {task.startDate}</Text>
      <Text style={styles.detail}>Ngày kết thúc: {task.endDate}</Text>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Cập nhật"
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: '#007AFF', width: '48%' }}
        />
        <CustomButton
          title="Xóa"
          onPress={handleDelete}
          style={{ backgroundColor: '#FF3B30', width: '48%' }}
        />
      </View>

      <TaskFormModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        initialValues={{ title: task.title, description: task.description, startDate: task.startDate, endDate: task.endDate }}
        onSubmit={handleUpdateTask}
        title="Cập nhật công việc"
      />
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
});

export default TaskDetailScreen;