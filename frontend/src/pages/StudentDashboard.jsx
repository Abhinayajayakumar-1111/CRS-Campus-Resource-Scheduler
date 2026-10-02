import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import RoomSlotPicker from "../components/RoomSlotPicker";
import MyBookingsList from "../components/MyBookingsList";
import api from "../api/axios";

// const todayStr = () => new Date().toISOString().slice(0, 10);
//new code for advamce booking
const MIN_ADVANCE_DAYS = 3;

const minBookableDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + MIN_ADVANCE_DAYS);
  return d.toISOString().slice(0, 10);
};

const StudentDashboard = () => {
  // const [date, setDate] = useState(todayStr());
  //new code 1 line advance booking
  const [date, setDate] = useState(minBookableDateStr());
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [purpose, setPurpose] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rooms/availability/all", {
        params: { date },
      });
      setRooms(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load rooms",
      });
    } finally {
      setLoading(false);
    }
  }, [date]);

  const loadMyBookings = useCallback(async () => {
    try {
      const { data } = await api.get("/bookings/my");
      setMyBookings(data);
    } catch (err) {
      // silent
    }
  }, []);

  useEffect(() => {
    loadRooms();
    setSelectedRoomId("");
    setSelectedSlot("");
  }, [loadRooms]);

  useEffect(() => {
    loadMyBookings();
  }, [loadMyBookings]);

  const handleSelect = (roomId, slot) => {
    setSelectedRoomId(roomId);
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedRoomId || !selectedSlot) {
      setMessage({
        type: "error",
        text: "Please select a room and an available time slot",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        roomId: selectedRoomId,
        date,
        slot: selectedSlot,
        purpose,
      });
      setMessage({
        type: "success",
        text: "Room booking request submitted successfully!",
      });
      setSelectedRoomId("");
      setSelectedSlot("");
      setPurpose("");
      loadRooms();
      loadMyBookings();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit booking request",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="page-content">
        <h2 className="section-title">Student Dashboard</h2>
        <p className="section-subtitle">
          Browse rooms and submit a booking request. Students may request rooms
          only.
        </p>

        {message && (
          <div
            className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}
          >
            {message.text}
          </div>
        )}

        <div className="card">
          <div className="card-header-row">
            <h3>Request a Room</h3>
            <div className="date-picker-wrap">
              <label className="field-label">Date</label>
              <input
                type="date"
                className="field-input"
                // min={todayStr()}-- new code 1 line below
                min={minBookableDateStr()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="empty-hint">Loading room availability...</p>
          ) : (
            <RoomSlotPicker
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              selectedSlot={selectedSlot}
              onSelect={handleSelect}
            />
          )}

          <form onSubmit={handleSubmit} className="booking-form-footer">
            <label className="field-label">Purpose (optional)</label>
            <input
              className="field-input"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Study group session"
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting || !selectedRoomId}
            >
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>My Booking Requests</h3>
          <MyBookingsList bookings={myBookings} />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
