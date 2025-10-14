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
        confirmButtonColor: '#3b82f6',
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? 'Login' : 'Register'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded text-white font-semibold transition-colors ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
            disabled={loading}
          >
            {loading ? 'Registering...' : isLogin ? 'Login' : 'Sign Up'}
          </button>

          <button
            type="button"
            className="w-full py-3 rounded bg-gray-200 hover:bg-gray-300 font-semibold transition-colors"
            onClick={switchToSignUp}
          >
            Switch to {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;
