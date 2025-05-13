import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { firebase } from '../config/firebaseConfig';
import { AuthenticatedUserContext } from '../context/AuthenticateUserContext';
import TaskFormModal from '../component/TaskModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';

type TaskNavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  userId: string;
}

const TasksTab: React.FC = () => {
  const { user } = useContext(AuthenticatedUserContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<TaskNavigationProp>();

  useEffect(() => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        // Kiểm tra AsyncStorage trước
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          const localTasks: Task[] = JSON.parse(storedTasks).filter((task: Task) => task.userId === user.uid);
          setTasks(localTasks);
        }

        // Lấy từ Firestore
        const querySnapshot = await firebase.firestore()
          .collection('tasks')
          .where('userId', '==', user.uid)
          .get();
        const taskList: Task[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return{
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            startDate:data.startDate || '',
            endDate: data.endDate || '',
            userId: data.userId || '',
          }});
        setTasks(taskList);

        // Cập nhật AsyncStorage
        await AsyncStorage.setItem('tasks', JSON.stringify(taskList));
      } catch (error: any) {
        console.error('Lỗi lấy danh sách công việc:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách công việc.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const handleAddTask = async (values: { title: string; description: string; startDate: string, endDate: string} ) => {
    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng.');
    }
    const taskRef = await firebase.firestore().collection('tasks').add({
      userId: user.uid,
      title: values.title,
      description: values.description,
      startDate: values.startDate,
      endDate: values.endDate,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const newTask: Task = {
      id: taskRef.id,
      title: values.title,
      description: values.description,
      startDate: values.startDate, 
      endDate: values.endDate,
      userId: user.uid,
    };

    // Cập nhật AsyncStorage
    const storedTasks = await AsyncStorage.getItem('tasks');
    const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
    tasks.push(newTask);
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));

    setTasks((prev) => [...prev, newTask]);
    Alert.alert('Thành công', 'Công việc đã được thêm.');
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', { task: item })}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.listTitle}>Danh sách công việc</Text>
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>Không có công việc nào</Text>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <TaskFormModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        initialValues={{ title: '', description: '',startDate:'',endDate:'' }}
        onSubmit={handleAddTask}
        title="Thêm công việc mới"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  flatList: {
    flex: 1,
  },
  taskItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TasksTab;