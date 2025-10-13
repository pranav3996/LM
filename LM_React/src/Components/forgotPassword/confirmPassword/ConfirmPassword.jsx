import  { useState } from 'react';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';
import { usePassword } from '../../../Context/PasswordContext';

const ConfirmPassword = ({ email, otp }) => {
  const navigate = useNavigate();
  const { resetPasswordOtp } = usePassword();
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    const result = await resetPasswordOtp(email, otp, newPassword);
    if (result.success) {
      Swal.fire({
        title: 'Password Reset Successful!',
        text: result.data?.message || 'Your password has been reset.',
        icon: 'success',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/login');
      });
    } else {
      setErrorMessage(result.error?.message || 'Failed to reset password');
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <form onSubmit={handleReset} className="mt-6 space-y-4">
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
        required
        minLength={6}
      />
      {errorMessage && (
        <div className="text-red-600 text-sm font-medium mt-2">{errorMessage}</div>
      )}

      <button
        type="submit"
        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg transition"
      >
        Reset Password
      </button>
    </form>
  );
};

export default ConfirmPassword;
