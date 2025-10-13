import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import Swal from 'sweetalert2';
import { useAuth } from '../../Context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await login(data.email, data.password);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: isLogin ? 'Login Successful' : 'SignUp Successful',
          text: `Welcome ${data.email}`,
          confirmButtonColor: '#fbbf24',
        });
        navigate('/profile');
      } else {
        setErrorMessage(response.error || 'An error occurred');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected error occurred');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    navigate(isLogin ? '/user-register' : '/login');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="container mx-auto flex justify-center items-center h-screen px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <header className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid Email' } })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-amber-400 text-sm hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-500 text-center text-sm">{errorMessage}</div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              className="w-full bg-amber-400 text-white py-2 rounded-lg hover:bg-amber-500 transition-colors"
            >
              {isLogin ? 'Login' : 'SignUp'}
            </button>
            <button
              type="button"
              onClick={switchForm}
              className="w-full border border-amber-400 text-amber-400 py-2 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Switch to {isLogin ? 'SignUp' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
