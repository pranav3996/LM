import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAdmin } from '../../../Context/AdminContext';

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserById, updateUser, error, clearError } = useAdmin();

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    role: 'USER',
    enabled: false,
  });
  const [originalEnabled, setOriginalEnabled] = useState(false);
  const roles = ['ADMIN', 'USER'];

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserById(id);
      if (res.success && res.data) {
        const { firstName, lastName, email, city, role, enabled } = res.data.users || {};
        setUserData({ firstName, lastName, email, city, role, enabled });
        setOriginalEnabled(enabled);
      } else {
        Swal.fire('Error', res.error?.message || 'Failed to fetch user', 'error');
      }
    };
    fetchUser();
  }, [id, getUserById]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'radio' ? value === 'true' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm('Are you sure you want to update this user?');
    if (!confirmUpdate) return;

    const res = await updateUser(id, userData);
    if (res.success) {
      Swal.fire('Success', 'User updated successfully', 'success').then(() => navigate('/users'));
    } else {
      Swal.fire('Error', res.error?.message || 'Failed to update user', 'error');
    }
  };

  const navigateToProfile = () => navigate('/profile');

  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg relative">
        <span
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={navigateToProfile}
        >
          <i className="fa fa-times"></i>
        </span>

        <h2 className="text-2xl font-bold mb-6">Update User</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={userData.firstName}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={userData.lastName}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={userData.email}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <div className="flex flex-col">
            <label className="mb-1">Verified:</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  name="enabled"
                  value={true}
                  checked={userData.enabled === true}
                  disabled={userData.enabled === true && originalEnabled === true}
                  onChange={handleChange}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  name="enabled"
                  value={false}
                  checked={userData.enabled === false}
                  onChange={handleChange}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <input
            type="text"
            name="city"
            placeholder="City"
            value={userData.city}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
