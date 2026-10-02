import React from 'react';

export const SLOT_LABELS = {
  HALF_MORNING: '8:00 AM - 12:00 PM',
  HALF_AFTERNOON: '1:00 PM - 5:00 PM',
  FULL_DAY: 'Full Day (8:00 AM - 5:00 PM)',
};

export const StatusBadge = ({ status }) => (
  <span className={`badge badge-status-${status.toLowerCase()}`}>{status}</span>
);

export const SlotBadge = ({ slot }) => (
  <span className="badge badge-slot">{SLOT_LABELS[slot] || slot}</span>
);
