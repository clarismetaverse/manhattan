import React from 'react';
import type { Profile } from './types';
import UGCView from './UGCView';

const PROView: React.FC<{ profile: Profile }> = ({ profile }) => {
  return <UGCView profile={profile} />;
};

export default PROView;
