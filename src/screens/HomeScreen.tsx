import React, { useContext,useState,useEffect } from 'react';
import { Alert, View, Text, FlatList,StyleSheet } from 'react-native';
import { AuthenticatedUserContext } from '../context/AuthenticateUserContext';
import { firebase } from '../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs } from '@react-native-firebase/firestore';
import CustomButton from '../component/Button';

type AppStackParamList = {
    Home: undefined;
    Profile: undefined;
  };
  
type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Home'>;

interface UserData {
  id: string;
  name: string;
  age: number;
  gender: string;
}

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const { user } = useContext(AuthenticatedUserContext);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firebase.firestore(), 'users'));
        const userList: UserData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          age: doc.data().age,
          gender: doc.data().gender,
        }));
        setUsers(userList);
      } catch (error) {
        console.error('Lỗi lấy danh sách người dùng:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error:any) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const renderUserItem = ({ item }: { item: UserData }) => (
    <View style={styles.userItem}>
      <Text style={styles.userText}>Tên: {item.name}</Text>
      <Text style={styles.userText}>Tuổi: {item.age}</Text>
      <Text style={styles.userText}>Giới tính: {item.gender}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Xin chào, {user?.name || 'Người dùng'}</Text>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Xem hồ sơ"
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        />
        <CustomButton
          title="Đăng xuất"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </View>
      <Text style={styles.listTitle}>Danh sách người dùng</Text>
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : users.length === 0 ? (
        <Text style={styles.emptyText}>Không có người dùng nào</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: '#007AFF',
    width: '48%',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    width: '48%',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  flatList: {
    flex: 1,
  },
  userItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
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
});

export default HomeScreen;