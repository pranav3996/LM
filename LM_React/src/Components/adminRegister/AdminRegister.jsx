// src/components/AdminRegister.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useUserRegister } from '../../Context/UserRegisterContext';

const AdminRegister = () => {
    const { userRegister } = useUserRegister();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const roleOptions = ['ADMIN', 'USER'];

    const onSubmit = async (data) => {
        const { success, error, data: responseData } = await userRegister(data);
        if (success) {
            Swal.fire({
                title: 'Success!',
                text: responseData?.message || 'Registration successful',
                icon: 'success',
                confirmButtonColor: '#f59e0b', // amber-500
            }).then(() => navigate('/users'));

            reset();
        } else {
            setErrorMessage(error || 'An error occurred');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const navigateToUsers = () => navigate('/users');

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
            <div className="relative w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
                <span
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
                    onClick={navigateToUsers}
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </span>

                <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input
                        type="text"
                        placeholder="First Name"
                        {...register('firstName', { required: 'First Name is required' })}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}

                    <input
                        type="text"
                        placeholder="Last Name"
                        {...register('lastName', { required: 'Last Name is required' })}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}

                    <input
                        type="email"
                        placeholder="Email"
                        {...register('email', { required: 'Email is required' })}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

                    <select
                        {...register('role', { required: 'Role is required' })}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        defaultValue=""
                    >
                        <option value="" disabled>Select a role</option>
                        {roleOptions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}

                    <input
                        type="text"
                        placeholder="City"
                        {...register('city', { required: 'City is required' })}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}

                    <input
                        type="password"
                        placeholder="Password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

                    {errorMessage && (
                        <div className="text-red-600 text-center mt-2">{errorMessage}</div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded-md transition"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;
