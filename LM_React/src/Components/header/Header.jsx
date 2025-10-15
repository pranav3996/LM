import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../Context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { logOut, accessToken } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (accessToken) {
      setIsAuthenticated(true);
      const userRole = sessionStorage.getItem('role');
      setIsAdmin(userRole === 'ADMIN');
      setIsUser(userRole === 'USER');
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsUser(false);
    }
  }, [accessToken]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <nav className="bg-gradient-to-r from-amber-500 to-amber-400 shadow-md">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        {/* Left: Logo */}
        <div className="flex items-center ml-2">
          <strong className="text-white text-2xl font-bold tracking-wide">Believe</strong>
        </div>

        {/* Right: Nav Links */}
        <div className="flex items-center space-x-4 mr-4 relative" ref={menuRef}>
          {/* Profile Icon */}
          {isAuthenticated && (
            <NavLink
              to="/profile"
              className="text-white text-xl hover:text-gray-200 transition-colors duration-200"
              title="Profile"
            >
              <i className="fas fa-user fa-lg"></i>
            </NavLink>
          )}

          {/* Admin Home */}
          {isAdmin && (
            <NavLink
              to="/users"
              className="text-white text-2xl hover:text-gray-200 transition-colors duration-200"
              title="Users"
            >
              <i className="fas fa-home"></i>
            </NavLink>
          )}

          {/* Dropdown Menu Button */}
          <button
            className="text-white text-2xl ml-2 p-2 rounded hover:bg-white/20 transition duration-200 focus:outline-none"
            onClick={() => setMenuOpen((prev) => !prev)}
            title="Menu"
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <ul className="absolute right-0 top-12 w-60 bg-white rounded-lg shadow-lg z-50 animate-fade-in">
              <li>
                <a
                  href="#"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors duration-150"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors duration-150"
                >
                  Contact Us
                </a>
              </li>
              {isAuthenticated && (
                <li>
                  <NavLink
                    to="/change-password"
                    className="block px-4 py-3 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => setMenuOpen(false)}
                  >
                    Change Password
                  </NavLink>
                </li>
              )}
              <li>
                <a
                  href="#"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors duration-150"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <hr className="border-t my-1" />
              </li>
              {isAuthenticated && (
                <li>
                  <button
                    onClick={confirmSignOut}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </nav>

  );
};

export default Header;
