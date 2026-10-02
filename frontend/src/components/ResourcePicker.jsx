// import React from 'react';

/**
 * Lets Faculty pick equipment quantities for the currently selected
 * slot. The "remaining" count shown is specific to the chosen slot,
 * since availability is computed per-slot (overlapping bookings
 * deduct from the shared pool).
 */
// const ResourcePicker = ({ resources, selectedSlot, selections, onChange }) => {
//   if (!selectedSlot) {
//     return <p className="empty-hint">Select a room and time slot above to see live equipment availability.</p>;
//   }

//   if (!resources || resources.length === 0) {
//     return <p className="empty-hint">No equipment/resources have been added by the Admin yet.</p>;
//   }

//   const handleQtyChange = (resourceId, value, max) => {
//     let qty = parseInt(value, 10);
//     if (isNaN(qty) || qty < 0) qty = 0;
//     if (qty > max) qty = max;
//     onChange(resourceId, qty);
//   };

//   return (
//     <div className="resource-picker-list">
//       {resources.map((res) => {
//         const remaining = res.availability?.[selectedSlot] ?? 0;
//         const qty = selections[res._id] || 0;
//         return (
//           <div key={res._id} className="resource-row">
//             <div className="resource-row-info">
//               <span className="resource-name">{res.name}</span>
//               <span className={`muted-text ${remaining === 0 ? 'text-danger' : ''}`}>
//                 {remaining} {res.unit} remaining of {res.totalCount} for this slot
//               </span>
//             </div>
//             <input
//               type="number"
//               className="field-input resource-qty-input"
//               min={0}
//               max={remaining}
//               value={qty}
//               disabled={remaining === 0}
//               onChange={(e) => handleQtyChange(res._id, e.target.value, remaining)}
//               placeholder="0"
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ResourcePicker;

//new code starts here-1
// import React from "react";
// import { SLOT_LABELS } from "./Badges";

// const SLOTS = ["HALF_MORNING", "HALF_AFTERNOON", "FULL_DAY"];

// /**
//  * Always shows LIVE remaining quantity for EVERY resource across ALL
//  * three slots (same always-visible pattern as RoomSlotPicker), so any
//  * reduction caused by a Pending or Approved request is immediately
//  * visible — even before a slot is selected, and even after a request
//  * is submitted (which used to reset selection and hide this panel).
//  * The quantity input for a resource is only enabled once a room + slot
//  * has been picked above, and is live-capped to that slot's remaining count.
//  */
// const ResourcePicker = ({ resources, selectedSlot, selections, onChange }) => {
//   if (!resources || resources.length === 0) {
//     return (
//       <p className="empty-hint">
//         No equipment/resources have been added by the Admin yet.
//       </p>
//     );
//   }

//   const handleQtyChange = (resourceId, value, max) => {
//     let qty = parseInt(value, 10);
//     if (isNaN(qty) || qty < 0) qty = 0;
//     if (qty > max) qty = max;
//     onChange(resourceId, qty);
//   };

//   return (
//     <div className="table-wrap">
//       <table className="data-table">
//         <thead>
//           <tr>
//             <th>Resource</th>
//             {SLOTS.map((slot) => (
//               <th key={slot}>{SLOT_LABELS[slot]}</th>
//             ))}
//             <th>Request Qty {selectedSlot ? "" : "(select a slot above)"}</th>
//           </tr>
//         </thead>
//         <tbody>
//           {resources.map((res) => {
//             const remainingForSelectedSlot = selectedSlot
//               ? (res.availability?.[selectedSlot] ?? 0)
//               : 0;
//             const qty = selections[res._id] || 0;
//             return (
//               <tr key={res._id}>
//                 <td>
//                   {res.name}
//                   <div className="muted-text">
//                     Total: {res.totalCount} {res.unit}
//                   </div>
//                 </td>
//                 {SLOTS.map((slot) => {
//                   const remaining = res.availability?.[slot] ?? 0;
//                   return (
//                     <td key={slot}>
//                       <span className={remaining === 0 ? "text-danger" : ""}>
//                         {remaining} {res.unit}
//                       </span>
//                     </td>
//                   );
//                 })}
//                 <td>
//                   <input
//                     type="number"
//                     className="field-input resource-qty-input"
//                     min={0}
//                     max={remainingForSelectedSlot}
//                     value={qty}
//                     disabled={!selectedSlot || remainingForSelectedSlot === 0}
//                     onChange={(e) =>
//                       handleQtyChange(
//                         res._id,
//                         e.target.value,
//                         remainingForSelectedSlot,
//                       )
//                     }
//                     placeholder="0"
//                   />
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ResourcePicker;

//new code v2
import React from "react";

/**
 * Resources are reserved for the WHOLE DAY once requested (not per
 * slot), so a single "remaining today" number is shown per resource -
 * no per-slot breakdown needed. The quantity input is enabled as soon
 * as a room + slot has been selected above (since a request still
 * needs a slot for the room booking itself), and is live-capped to
 * that resource's remaining count for the chosen date.
 */
const ResourcePicker = ({ resources, selectedSlot, selections, onChange }) => {
  if (!selectedSlot) {
    return (
      <p className="empty-hint">
        Select a room and time slot above to request equipment.
      </p>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <p className="empty-hint">
        No equipment/resources have been added by the Admin yet.
      </p>
    );
  }

  const handleQtyChange = (resourceId, value, max) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 0) qty = 0;
    if (qty > max) qty = max;
    onChange(resourceId, qty);
  };

  return (
    <div className="resource-picker-list">
      {resources.map((res) => {
        const remaining = res.available ?? 0;
        const qty = selections[res._id] || 0;
        return (
          <div key={res._id} className="resource-row">
            <div className="resource-row-info">
              <span className="resource-name">{res.name}</span>
              <span
                className={`muted-text ${remaining === 0 ? "text-danger" : ""}`}
              >
                {remaining} {res.unit} remaining today (of {res.totalCount}{" "}
                total)
              </span>
            </div>
            <input
              type="number"
              className="field-input resource-qty-input"
              min={0}
              max={remaining}
              value={qty}
              disabled={remaining === 0}
              onChange={(e) =>
                handleQtyChange(res._id, e.target.value, remaining)
              }
              placeholder="0"
            />
          </div>
        );
      })}
    </div>
  );
};

export default ResourcePicker;
