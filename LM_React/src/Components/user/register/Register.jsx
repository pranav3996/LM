import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useUserRegister } from '../../../Context/UserRegisterContext';

const UserRegister = () => {
  const navigate = useNavigate();
  const { userRegister, loading, error, clearError, success } = useUserRegister();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    password: '',
  });

  const [isLogin, setIsLogin] = useState(false);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Show success and navigate after registration
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: 'Success!',
        text: 'Registration completed. Please check your email.',
        icon: 'success',
        confirmButtonColor: '#ffb74d',
        confirmButtonText: 'OK',
      }).then(() => navigate('/login'));
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.city || !formData.password) {
      Swal.fire('Error', 'All fields are required', 'error');
      return;
    }

    if (formData.password.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters', 'error');
      return;
    }

    const userData = { ...formData, role: 'USER' };
    await userRegister(userData);
  };

  const switchToSignUp = () => {
    setIsLogin(!isLogin);
    navigate(isLogin ? '/login' : '/register');
  };

  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <header className="text-2xl font-bold mb-6">{isLogin ? 'Login' : 'Register'}</header>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
          <input
            type="text"
            placeholder="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            minLength={6}
            required
          />

          <div className="flex flex-col space-y-2 mt-4">
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={loading}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={switchToSignUp}
            >
              Switch to {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;
