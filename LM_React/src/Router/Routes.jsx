
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../Components/login/Login';
import UserRegister from '../Components/user/register/Register';
import AdminRegister from '../Components/adminRegister/AdminRegister';
import { AdminGuard, UserGuard } from './ProtectedRoute';
import UpdateUser from '../Components/user/update/Update';
import UserList from '../Components/user/list/List';
import ChangePassword from '../Components/changePassword/ChangePassword';
import ResetPassword from '../Components/forgotPassword/resetPassword/ResetPassword';
import ConfirmPassword from '../Components/forgotPassword/confirmPassword/ConfirmPassword';
import Profile from '../Components/user/profile/Profile';

const AppRoutes = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/user-register" element={<UserRegister />} />

        <Route
            path="/admin-register"
            element={
                <AdminGuard>
                    <AdminRegister />
                </AdminGuard>
            }
        />

        <Route
            path="/profile"
            element={
                <UserGuard>
                    <Profile />
                </UserGuard>
            }
        />

        <Route
            path="/update/:id"
            element={
                <AdminGuard>
                    <UpdateUser />
                </AdminGuard>
            }
        />

        <Route
            path="/users"
            element={
                <AdminGuard>
                    <UserList />
                </AdminGuard>
            }
        />

        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ConfirmPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />


        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
);

export default AppRoutes;
