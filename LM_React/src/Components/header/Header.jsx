import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../Context/AuthContext';
const Header = () => {
  const navigate = useNavigate();
  const { logOut, accessToken } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    // Here, you can decode the JWT token or use your AuthContext info
    if (accessToken) {
      setIsAuthenticated(true);

      // Example: decode token for roles or check from sessionStorage
      const userRole = sessionStorage.getItem('role'); // 'ADMIN' or 'USER'
      setIsAdmin(userRole === 'ADMIN');
      setIsUser(userRole === 'USER');
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsUser(false);
    }
  }, [accessToken]);

  const confirmSignOut = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fbbf24',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign me out!',
    }).then((result) => {
      if (result.isConfirmed) {
        logOut();
        navigate('/login');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsUser(false);
      }
    });
  };

  return (
    <nav className="bg-amber-400">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        {/* Left */}
        <div className="flex items-center ml-5">
          <strong className="text-white text-xl">Believe</strong>
        </div>

        {/* Right */}
        <ul className="flex items-center space-x-4 mr-10 mt-1 hidden md:flex">
          {isAuthenticated && (
            <li>
              <NavLink to="/profile" className="text-white text-xl hover:text-gray-200">
                <i className="fas fa-user fa-lg"></i>
              </NavLink>
            </li>
          )}

          {isAdmin && (
            <li>
              <NavLink to="/users" className="text-white text-2xl hover:text-gray-200">
                <i className="fas fa-home"></i>
              </NavLink>
            </li>
          )}

          <li className="relative">
            <button className="text-white text-2xl ml-2 focus:outline-none">
              <i className="fas fa-bars"></i>
            </button>
            <ul className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  Contact Us
                </a>
              </li>
              <li>
                <NavLink to="/change-password" className="block px-4 py-2 hover:bg-gray-100">
                  Change Password
                </NavLink>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <hr className="border-t my-1" />
              </li>
              <li>
                <button
                  onClick={confirmSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
