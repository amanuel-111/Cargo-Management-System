import React from 'react';
import { getStatusColor, getStatusLabel } from '../../utils/helpers';

const StatusBadge = ({ status }) => (
  <span className={`badge ${getStatusColor(status)}`}>
    {getStatusLabel(status)}
  </span>
);

export default StatusBadge;
