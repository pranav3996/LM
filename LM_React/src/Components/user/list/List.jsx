import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { useAdmin } from '../../../Context/AdminContext';

const List = () => {
  const {
    users,
    getAllUsers,
    getUserById,
    deleteUser,
    uploadFile,
    error,
    loading,
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
      const result = await getUserById(trimmed);
      if (!result.success) {
        Swal.fire('Error', 'User not found', 'error');
      }
    } else {
      // If search is empty, reload all users
      getAllUsers();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    getAllUsers();
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteUser(userId);
      if (deleteResult.success) {
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
        setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
      } else {
        Swal.fire('Error', deleteResult.error?.message || 'Failed to delete user', 'error');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedUsers.length} user(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete them!',
    });

    if (result.isConfirmed) {
      for (const user of selectedUsers) {
        await deleteUser(user.id);
      }
      setSelectedUsers([]);
      setAllSelected(false);
      Swal.fire('Deleted!', 'Selected users have been deleted.', 'success');
    }
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
    if (res.success) {
      Swal.fire('Success', res.data.message || 'File uploaded successfully', 'success');
    } else {
      Swal.fire('Error', res.error?.message || 'Upload failed', 'error');
    }

    // Reset file input
    event.target.value = '';
  };

  const downloadExcel = () => {
    if (!users || users.length === 0) {
      Swal.fire('Info', 'No users to download', 'info');
      return;
    }

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
    XLSX.writeFile(wb, `users_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire('Success', 'Excel file downloaded successfully', 'success');
  };

  // =====================
  // Render
  // =====================
  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-6 gap-4">
        <span className="font-semibold text-lg">User Data</span>
        <div className="flex-1" />

        {/* Search Section */}
        <div className="flex items-center gap-2">
          <input
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by User ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin-register')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add User
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
          />
          <button
            onClick={triggerFileInput}
            className="bg-amber-400 text-white px-4 py-2 rounded hover:bg-amber-500 transition-colors"
          >
            Upload File
          </button>

          <button
            onClick={downloadExcel}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {typeof error === 'string' ? error : error.message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 cursor-pointer hover:bg-gray-200" onClick={toggleSelectAll}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="mr-2"
                  />
                  {allSelected ? 'Deselect All' : 'Select All'}
                </th>
                <th className="border px-4 py-2">Sr.No</th>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">First Name</th>
                <th className="border px-4 py-2">Last Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Verified</th>
                <th className="border px-4 py-2">City</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map((user, i) => (
                  <tr key={user.id} className="text-center hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.some((u) => u.id === user.id)}
                        onChange={() => handleCheckboxChange(user)}
                      />
                    </td>
                    <td className="border px-4 py-2">{i + 1}</td>
                    <td className="border px-4 py-2">{user.id}</td>
                    <td className="border px-4 py-2">{user.firstName}</td>
                    <td className="border px-4 py-2">{user.lastName}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      {user.enabled ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </td>
                    <td className="border px-4 py-2">{user.city}</td>
                    <td className="border px-4 py-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => navigateToUpdate(user.id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Selected Button */}
      {selectedUsers.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-gray-600">
            {selectedUsers.length} user(s) selected
          </p>
          <button
            onClick={handleDeleteSelected}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Delete Selected Users ({selectedUsers.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default List;
