import React from 'react';
import { StatusBadge, SlotBadge } from './Badges';

const MyBookingsList = ({ bookings }) => {
  if (!bookings || bookings.length === 0) {
    return <p className="empty-hint">You have not made any booking requests yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Date</th>
            <th>Slot</th>
            <th>Equipment</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.room?.name}</td>
              <td>{b.date}</td>
              <td><SlotBadge slot={b.slot} /></td>
              <td>
                {b.resources && b.resources.length > 0 ? (
                  <ul className="inline-list">
                    {b.resources.map((r, idx) => (
                      <li key={idx}>
                        {r.resource?.name}: {r.quantity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="muted-text">—</span>
                )}
              </td>
              <td><StatusBadge status={b.status} /></td>
              <td>
                {b.status === 'Rejected' && b.rejectionReason && (
                  <span className="text-danger">Reason: {b.rejectionReason}</span>
                )}
                {b.status === 'Completed' && <span className="muted-text">Released</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyBookingsList;
