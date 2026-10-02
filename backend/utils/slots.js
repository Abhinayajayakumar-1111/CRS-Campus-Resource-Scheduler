/**
 * CRS Slot & Conflict Engine
 * ---------------------------------------------------------
 * Three fixed room time slots are supported:
 *   HALF_MORNING   -> 08:00 - 12:00
 *   HALF_AFTERNOON -> 13:00 - 17:00
 *   FULL_DAY       -> 08:00 - 17:00
 *
 * Each slot is represented internally as an hour range so we can
 * detect overlaps generically (used for both room blocking and
 * resource/equipment deduction across overlapping slots).
 */

const SLOT_DEFINITIONS = {
  HALF_MORNING: { label: "8:00 AM - 12:00 PM", start: 8, end: 12 },
  HALF_AFTERNOON: { label: "1:00 PM - 5:00 PM", start: 13, end: 17 },
  FULL_DAY: { label: "8:00 AM - 5:00 PM (Full Day)", start: 8, end: 17 },
};

const ALL_SLOTS = Object.keys(SLOT_DEFINITIONS);

// Bookings in these statuses are considered "active" and therefore
// block rooms / consume resource inventory. Rejected bookings never
// block. Completed bookings only stop blocking once explicitly
// released via roomReleased / resourcesReleased flags.
const ACTIVE_STATUSES = ["Pending", "Approved"];
//new code for advance booking
// Room and resource bookings must be requested at least this many
// days in advance. Today and the next (MIN_ADVANCE_DAYS - 1) days
// are disabled, exactly like past dates already are.
const MIN_ADVANCE_DAYS = 3;

/** Returns the earliest bookable date (today + MIN_ADVANCE_DAYS) as YYYY-MM-DD. */
function getMinBookableDateString() {
  const d = new Date();
  d.setDate(d.getDate() + MIN_ADVANCE_DAYS);
  return d.toISOString().slice(0, 10);
}

/**
 * True if the given YYYY-MM-DD date string satisfies the minimum
 * advance-notice rule (date >= today + MIN_ADVANCE_DAYS). Plain string
 * comparison works correctly here because YYYY-MM-DD sorts
 * lexicographically the same as chronologically.
 */
function isDateAdvanceCompliant(dateStr) {
  return dateStr >= getMinBookableDateString();
}

/** Do two hour-ranges overlap? */
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/** Do two named slots overlap in time? */
function slotsOverlap(slotA, slotB) {
  const a = SLOT_DEFINITIONS[slotA];
  const b = SLOT_DEFINITIONS[slotB];
  if (!a || !b) return false;
  return rangesOverlap(a.start, a.end, b.start, b.end);
}

/**
 * Given the list of "active" bookings (already filtered to the same
 * room + date, active status, and NOT roomReleased) compute which of
 * the three slots are currently available.
 *
 * Rules:
 *  - If FULL_DAY is booked -> nothing is available.
 *  - If HALF_MORNING is booked -> FULL_DAY is blocked; HALF_MORNING
 *    is blocked; only HALF_AFTERNOON may remain available.
 *  - If HALF_AFTERNOON is booked -> FULL_DAY is blocked; HALF_AFTERNOON
 *    is blocked; only HALF_MORNING may remain available.
 *  - If both halves are booked -> nothing is available (equivalent to
 *    a full day being taken).
 */
// function computeRoomSlotAvailability(activeBookingsForRoomDate) {
//   const bookedSlots = new Set(activeBookingsForRoomDate.map((b) => b.slot));

//   const availability = {};
//   for (const slot of ALL_SLOTS) {
//     // A slot is available only if it does not overlap with ANY
//     // currently active/blocking slot for that room+date.
//     const blocked = [...bookedSlots].some((bookedSlot) =>
//       slotsOverlap(slot, bookedSlot),
//     );
//     availability[slot] = !blocked;
//   }
//   return availability;
// }
//new code v1
const ROOM_SLOT_STATUS = {
  AVAILABLE: "AVAILABLE",
  BOOKED: "BOOKED",
  NOT_AVAILABLE: "NOT_AVAILABLE",
};

/**
 * For each of the 3 slots, returns one of three statuses:
 *  - 'BOOKED'        -> this exact slot has an active booking on it.
 *  - 'NOT_AVAILABLE' -> this slot is blocked only because it overlaps
 *                       with a different slot that is booked (e.g. Full
 *                       Day is blocked by a booked half-day, or a
 *                       half-day is blocked by a booked Full Day).
 *  - 'AVAILABLE'     -> free to book.
 */
function computeRoomSlotAvailability(activeBookingsForRoomDate) {
  const bookedSlots = new Set(activeBookingsForRoomDate.map((b) => b.slot));

  const availability = {};
  for (const slot of ALL_SLOTS) {
    if (bookedSlots.has(slot)) {
      availability[slot] = ROOM_SLOT_STATUS.BOOKED;
      continue;
    }
    const blockedByOverlap = [...bookedSlots].some((bookedSlot) =>
      slotsOverlap(slot, bookedSlot),
    );
    availability[slot] = blockedByOverlap
      ? ROOM_SLOT_STATUS.NOT_AVAILABLE
      : ROOM_SLOT_STATUS.AVAILABLE;
  }
  return availability;
}

/**
 * Given a resource's totalCount and the list of active booking-resource
 * entries (each with { slot, quantity }) for that resource on a given
 * date, compute how many units remain available for a *specific*
 * target slot. Any active booking whose slot overlaps the target slot
 * reduces the remaining pool (since the equipment would be in use
 * during that overlapping window).
 */
// function computeResourceAvailabilityForSlot(totalCount, activeResourceBookings, targetSlot) {
//   const reserved = activeResourceBookings
//     .filter((entry) => slotsOverlap(entry.slot, targetSlot))
//     .reduce((sum, entry) => sum + entry.quantity, 0);

//   return Math.max(totalCount - reserved, 0);
// }

// /**
//  * Compute remaining availability of a resource for EVERY slot at once.
//  * Returns { HALF_MORNING: n, HALF_AFTERNOON: n, FULL_DAY: n }
//  */
// function computeResourceAvailabilityAllSlots(totalCount, activeResourceBookings) {
//   const result = {};
//   for (const slot of ALL_SLOTS) {
//     result[slot] = computeResourceAvailabilityForSlot(totalCount, activeResourceBookings, slot);
//   }
//   return result;
// }

// module.exports = {
//   SLOT_DEFINITIONS,
//   ALL_SLOTS,
//   ACTIVE_STATUSES,
//   slotsOverlap,
//   computeRoomSlotAvailability,
//   computeResourceAvailabilityForSlot,
//   computeResourceAvailabilityAllSlots,
// };

//new code
/**
 * Resources are allocated PER DAY, not per time slot. Once a quantity
 * of a resource is booked (Pending or Approved) for a given date, that
 * quantity is unavailable for the REST of that day, regardless of
 * which slot the new request wants. So we simply sum every active
 * quantity reserved on that date, independent of slot.
 *
 * `activeQuantities` is a plain array of numbers - the quantity from
 * each active (Pending/Approved, not yet released) booking of this
 * resource on the target date.
 */
function computeResourceAvailability(totalCount, activeQuantities) {
  const reserved = activeQuantities.reduce((sum, qty) => sum + qty, 0);
  return Math.max(totalCount - reserved, 0);
}

module.exports = {
  SLOT_DEFINITIONS,
  ALL_SLOTS,
  ACTIVE_STATUSES,
  //new code 1 line below
  ROOM_SLOT_STATUS,
  //new code for advance booking - 3 lines
  MIN_ADVANCE_DAYS,
  getMinBookableDateString,
  isDateAdvanceCompliant,
  slotsOverlap,
  computeRoomSlotAvailability,
  computeResourceAvailability,
};
