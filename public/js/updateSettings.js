/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3008/api/v1/users/updateMe',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type} updated successfully!`);
      window.setTimeout(() => location.reload(), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateUserPassword = async (
  password,
  updatePassword,
  confirmUpdatePassword,
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3008/api/v1/users/updatePassword',
      data: {
        password,
        updatePassword,
        confirmUpdatePassword,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'your details have been updated!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
