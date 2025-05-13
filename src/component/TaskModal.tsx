import React from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomButton from './Button';

interface TaskFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialValues: { title: string; description: string;startDate: string, endDate: string} ;
  onSubmit: (values: { title: string; description: string; startDate: string, endDate: string}) => Promise<void>;
  title: string;
}

const TaskSchema = Yup.object().shape({
  title: Yup.string().required('Bắt buộc'),
  description: Yup.string().required('Bắt buộc'),
  startDate: Yup.string().required('Bắt buộc'),
  endDate: Yup.string().required('Bắt buộc'),
});

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isVisible,
  onClose,
  initialValues,
  onSubmit,
  title,
}) => {
  const formik = useFormik({
    initialValues,
    validationSchema: TaskSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const sanitizedValues = {
          title: values.title.trim() || '',
          description: values.description.trim() || '',
          startDate: values.startDate.trim() || '',
          endDate: values.endDate.trim() || '',
        };
        await onSubmit(sanitizedValues);
        resetForm();
        onClose();
      } catch (error: any) {
        console.error('Lỗi xử lý form:', error);
        Alert.alert('Lỗi', error.message || 'Không thể lưu công việc.');
      }
    },
  });

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TextInput
          placeholder="Tiêu đề"
          value={formik.values.title}
          onChangeText={formik.handleChange('title')}
          style={styles.input}
        />
        {formik.errors.title && <Text style={styles.error}>{formik.errors.title}</Text>}
        <TextInput
          placeholder="Mô tả"
          value={formik.values.description}
          onChangeText={formik.handleChange('description')}
          style={styles.input}
          multiline
        />
        {formik.errors.description && <Text style={styles.error}>{formik.errors.description}</Text>}
        <TextInput
          placeholder="Ngày bắt đầu"
          value={formik.values.startDate}
          onChangeText={formik.handleChange('startDate')}
          style={styles.input}
        />
        {formik.errors.startDate && <Text style={styles.error}>{formik.errors.startDate}</Text>}
        <TextInput
          placeholder="Ngày kết thúc"
          value={formik.values.endDate}
          onChangeText={formik.handleChange('endDate')}
          style={styles.input}
        />
        {formik.errors.endDate && <Text style={styles.error}>{formik.errors.endDate}</Text>}
        <CustomButton
          title="Lưu"
          onPress={() => formik.handleSubmit()}
          style={{ backgroundColor: '#28a745' }}
        />
        <CustomButton
          title="Hủy"
          onPress={onClose}
          style={{ backgroundColor: '#FF9500' }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default TaskFormModal;