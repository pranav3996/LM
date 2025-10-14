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
        const { firstName = '', lastName = '', email = '', city = '', role = 'USER', enabled = false } = res.data.users || {};
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
            value={userData.firstName || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={userData.lastName || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={userData.email || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <select
            name="role"
            value={userData.role || 'USER'}
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
            value={userData.city || ''}
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

// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAdmin } from '../../../Context/AdminContext';
// import Swal from 'sweetalert2';

// const UpdateUser = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { currentUser, getUserById, updateUser, loading } = useAdmin();

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     city: '',
//     role: '',
//     enabled: true,
//   });

//   // ✅ Fetch user data when component mounts
//   useEffect(() => {
//     if (id) {
//       getUserById(id);
//     }
//   }, [id, getUserById]);

//   // ✅ Populate form when currentUser is loaded
//   useEffect(() => {
//     if (currentUser?.users) {
//       // Access the nested 'users' object from the full response
//       const user = currentUser.users;
//       setFormData({
//         firstName: user.firstName || '',
//         lastName: user.lastName || '',
//         email: user.email || '',
//         city: user.city || '',
//         role: user.role || '',
//         enabled: user.enabled ?? true,
//       });
//     }
//   }, [currentUser]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const result = await updateUser(id, formData);

//     if (result.success) {
//       Swal.fire('Success', 'User updated successfully', 'success');
//       navigate('/list');
//     } else {
//       Swal.fire('Error', result.error?.message || 'Failed to update user', 'error');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 max-w-2xl">
//       <h2 className="text-2xl font-bold mb-6">Update User</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">First Name</label>
//           <input
//             type="text"
//             name="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Last Name</label>
//           <input
//             type="text"
//             name="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">City</label>
//           <input
//             type="text"
//             name="city"
//             value={formData.city}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Role</label>
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           >
//             <option value="">Select Role</option>
//             <option value="USER">User</option>
//             <option value="ADMIN">Admin</option>
//           </select>
//         </div>

//         <div className="flex items-center">
//           <input
//             type="checkbox"
//             name="enabled"
//             checked={formData.enabled}
//             onChange={handleChange}
//             className="mr-2"
//           />
//           <label className="text-sm font-medium">Account Enabled</label>
//         </div>

//         <div className="flex gap-4 pt-4">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
//             disabled={loading}
//           >
//             {loading ? 'Updating...' : 'Update User'}
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate('/list')}
//             className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UpdateUser;
