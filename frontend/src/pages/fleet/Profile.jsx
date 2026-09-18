import React from 'react';
import ProfileSettings from '../../components/common/ProfileSettings';

const FleetProfile = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Manager Profile Settings</h1>
      <ProfileSettings />
    </div>
  );
};

export default FleetProfile;
