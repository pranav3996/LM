import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { useAdmin } from '../../../Context/AdminContext';

const UserList = () => {
  const {
    users,
    getAllUsers,
    getUserById,
    deleteUser,
    uploadFile,
    error,
  } = useAdmin();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  // =====================
  // Handlers
  // =====================
  const handleSearch = async () => {
    const trimmed = searchTerm.trim();
    if (trimmed) {
      await getUserById(trimmed);
    } else {
      getAllUsers();
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
      setAllSelected(false);
    } else {
      setSelectedUsers(users || []);
      setAllSelected(true);
    }
  };

  const handleCheckboxChange = (user) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      setAllSelected(false);
    } else {
      const newSelected = [...selectedUsers, user];
      setSelectedUsers(newSelected);
      setAllSelected(newSelected.length === users.length);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      await deleteUser(userId);
      setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;
    for (const user of selectedUsers) {
      await deleteUser(user.id);
    }
    setSelectedUsers([]);
    setAllSelected(false);
  };

  const navigateToUpdate = (userId) => {
    navigate(`/update/${userId}`);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const res = await uploadFile(file);
    if (res.success) Swal.fire('Success', res.data.message, 'success');
  };

  const downloadExcel = () => {
    if (!users || users.length === 0) return;

    const filteredData = users.map((user, index) => ({
      SrNo: index + 1,
      ID: user.id,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      Email: user.email,
      Role: user.role,
      Verified: user.enabled ? 'Yes' : 'No',
      City: user.city,
    }));

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users.xlsx');
  };

  // =====================
  // Render
  // =====================
  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Management Page</h2>

      {/* Toolbar */}
      <div className="flex items-center mb-6 space-x-4">
        <span className="font-semibold">User Data</span>
        <div className="flex-1" />

        <div className="flex items-center space-x-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Search User"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/adminRegister')}
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Add User
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            onClick={triggerFileInput}
            className="bg-amber-400 text-white px-2 py-1 rounded hover:bg-amber-500"
          >
            Upload File
          </button>

          <button
            onClick={downloadExcel}
            className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800"
          >
            Download Excel
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error.message}</p>}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 cursor-pointer" onClick={toggleSelectAll}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </th>
              <th className="border px-2 py-1">SrNo</th>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">First Name</th>
              <th className="border px-2 py-1">Last Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Verified</th>
              <th className="border px-2 py-1">City</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user, i) => (
                <tr key={user.id} className="text-center">
                  <td className="border px-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedUsers.some((u) => u.id === user.id)}
                      onChange={() => handleCheckboxChange(user)}
                    />
                  </td>
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{user.id}</td>
                  <td className="border px-2 py-1">{user.firstName}</td>
                  <td className="border px-2 py-1">{user.lastName}</td>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">{user.role}</td>
                  <td className="border px-2 py-1">{user.enabled ? 'Yes' : 'No'}</td>
                  <td className="border px-2 py-1">{user.city}</td>
                  <td className="border px-2 py-1 space-x-1">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => navigateToUpdate(user.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUsers.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDeleteSelected}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Selected Users
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;
