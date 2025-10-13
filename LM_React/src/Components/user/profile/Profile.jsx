import  { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../../Context/ProfileContext';

const Profile = () => {
  const { profile, error, fetchProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = (id) => {
    navigate(`/update/${id}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-md bg-white rounded-lg shadow-md mt-10">
      {error && (
        <p className="text-red-500 text-center mb-4">{error.message}</p>
      )}

      <h2 className="text-2xl font-bold mb-4 text-center">Profile Information</h2>

      <div className="space-y-2">
        <p>
          <span className="font-semibold">First Name:</span>{' '}
          {profile?.users?.firstName || '-'}
        </p>
        <p>
          <span className="font-semibold">Last Name:</span>{' '}
          {profile?.users?.lastName || '-'}
        </p>
        <p>
          <span className="font-semibold">Email:</span>{' '}
          {profile?.users?.email || '-'}
        </p>
        <p>
          <span className="font-semibold">City:</span> {profile?.users?.city || '-'}
        </p>
      </div>

      {profile?.users?.role === 'ADMIN' && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => updateProfile(profile?.users?.id)}
            className="bg-amber-400 text-white py-2 px-4 rounded-lg hover:bg-amber-500 transition-colors"
          >
            Update Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
