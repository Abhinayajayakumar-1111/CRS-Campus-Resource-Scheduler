// import React from 'react';
// import { SLOT_LABELS } from './Badges';

// const SLOTS = ['HALF_MORNING', 'HALF_AFTERNOON', 'FULL_DAY'];

// /**
//  * Renders the list of rooms with live per-slot availability for the
//  * chosen date. Clicking an available slot selects that room + slot.
//  * Unavailable slots are visibly disabled (conflict-free UX).
//  */
// const RoomSlotPicker = ({ rooms, selectedRoomId, selectedSlot, onSelect }) => {
//   if (!rooms || rooms.length === 0) {
//     return <p className="empty-hint">No rooms have been added by the Admin yet.</p>;
//   }

//   return (
//     <div className="room-picker-list">
//       {rooms.map((room) => (
//         <div key={room._id} className="room-picker-card">
//           <div className="room-picker-header">
//             <div>
//               <h4>{room.name}</h4>
//               <span className="muted-text">
//                 Capacity: {room.capacity} {room.location ? `· ${room.location}` : ''}
//               </span>
//             </div>
//           </div>
//           <div className="slot-btn-row">
//             {SLOTS.map((slot) => {
//               const isAvailable = room.availability?.[slot];
//               const isSelected = selectedRoomId === room._id && selectedSlot === slot;
//               return (
//                 <button
//                   type="button"
//                   key={slot}
//                   disabled={!isAvailable}
//                   className={`slot-btn ${isSelected ? 'slot-btn-selected' : ''} ${
//                     !isAvailable ? 'slot-btn-disabled' : 'slot-btn-open'
//                   }`}
//                   onClick={() => onSelect(room._id, slot)}
//                   title={isAvailable ? 'Available' : 'Not available - conflicts with an existing booking'}
//                 >
//                   {SLOT_LABELS[slot]}
//                   <span className="slot-btn-status">{isAvailable ? 'Available' : 'Booked'}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default RoomSlotPicker;

//new code
import React from "react";
import { SLOT_LABELS } from "./Badges";

const SLOTS = ["HALF_MORNING", "HALF_AFTERNOON", "FULL_DAY"];

const STATUS_TEXT = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  NOT_AVAILABLE: "Not Available",
};

/**
 * Renders the list of rooms with live per-slot status for the chosen
 * date. Only 'AVAILABLE' slots are clickable. A slot that itself has
 * an active booking shows 'Booked'; a slot that is merely blocked
 * because a different, overlapping slot is booked (e.g. Full Day is
 * blocked by a booked half-day, or a half-day is blocked by a booked
 * Full Day) shows 'Not Available' instead.
 */
const RoomSlotPicker = ({ rooms, selectedRoomId, selectedSlot, onSelect }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <p className="empty-hint">No rooms have been added by the Admin yet.</p>
    );
  }

  return (
    <div className="room-picker-list">
      {rooms.map((room) => (
        <div key={room._id} className="room-picker-card">
          <div className="room-picker-header">
            <div>
              <h4>{room.name}</h4>
              <span className="muted-text">
                Capacity: {room.capacity}{" "}
                {room.location ? `· ${room.location}` : ""}
              </span>
            </div>
          </div>
          <div className="slot-btn-row">
            {SLOTS.map((slot) => {
              const status = room.availability?.[slot];
              const isAvailable = status === "AVAILABLE";
              const isSelected =
                selectedRoomId === room._id && selectedSlot === slot;
              return (
                <button
                  type="button"
                  key={slot}
                  disabled={!isAvailable}
                  className={`slot-btn ${isSelected ? "slot-btn-selected" : ""} ${
                    !isAvailable ? "slot-btn-disabled" : "slot-btn-open"
                  }`}
                  onClick={() => onSelect(room._id, slot)}
                  title={
                    isAvailable
                      ? "Available"
                      : status === "BOOKED"
                        ? "Already booked for this slot"
                        : "Not available - conflicts with an existing booking"
                  }
                >
                  {SLOT_LABELS[slot]}
                  <span className="slot-btn-status">
                    {STATUS_TEXT[status] || status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomSlotPicker;
