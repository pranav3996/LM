import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { usePassword } from '../../Context/PasswordContext';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { changePassword, loading, error, resetState } = usePassword();

    const [formData, setFormData] = useState({
        email: '',
        oldPassword: '',
        newPassword: '',
    });

    const [errorMessage, setErrorMessage] = useState('');

    // Load email from sessionStorage (same as Angular)
    useEffect(() => {
        const email = sessionStorage.getItem('email') || '';
        setFormData((prev) => ({ ...prev, email }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formData.email || !formData.oldPassword || !formData.newPassword) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setErrorMessage('New password must be at least 6 characters.');
            return;
        }

        const { email, oldPassword, newPassword } = formData;
        const result = await changePassword(email, oldPassword, newPassword);

        if (result.success) {
            Swal.fire({
                title: 'Password Changed!',
                text: result.data?.message || 'Your password has been updated successfully.',
                icon: 'success',
                confirmButtonColor: '#fbbf24',
                confirmButtonText: 'OK',
            }).then(() => {
                navigate('/profile');
                setFormData({ email, oldPassword: '', newPassword: '' });
                resetState();
            });
        } else {
            setErrorMessage(result.error?.message || 'Failed to change password.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="relative bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                {/* Close Button */}
                <button
                    onClick={() => navigate('/profile')}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <i className="fa fa-times text-xl"></i>
                </button>

                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    Change Password
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
                            placeholder="Email"
                        />
                    </div>

                    {/* Old Password */}
                    <div>
                        <input
                            type="password"
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            placeholder="Old Password"
                            required
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            placeholder="New Password"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="text-red-600 text-sm font-medium mt-2 text-center">
                            {errorMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
