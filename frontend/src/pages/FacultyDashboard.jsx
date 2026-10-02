import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import RoomSlotPicker from "../components/RoomSlotPicker";
import ResourcePicker from "../components/ResourcePicker";
import MyBookingsList from "../components/MyBookingsList";
import api from "../api/axios";

// const todayStr = () => new Date().toISOString().slice(0, 10);
//new code for advance booking
const MIN_ADVANCE_DAYS = 3;

const minBookableDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + MIN_ADVANCE_DAYS);
  return d.toISOString().slice(0, 10);
};

const FacultyDashboard = () => {
  // const [date, setDate] = useState(todayStr());
  //new code for advance booking
  const [date, setDate] = useState(minBookableDateStr());
  const [rooms, setRooms] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [resourceSelections, setResourceSelections] = useState({});
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

  const loadResources = useCallback(async () => {
    try {
      const { data } = await api.get("/resources/availability/all", {
        params: { date },
      });
      setResources(data);
    } catch (err) {
      // silent
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
    loadResources();
    setSelectedRoomId("");
    setSelectedSlot("");
    setResourceSelections({});
  }, [loadRooms, loadResources]);

  useEffect(() => {
    loadMyBookings();
  }, [loadMyBookings]);

  const handleSelect = (roomId, slot) => {
    setSelectedRoomId(roomId);
    setSelectedSlot(slot);
    setResourceSelections({}); // reset quantities since availability is per-slot
  };

  const handleResourceChange = (resourceId, qty) => {
    setResourceSelections((prev) => {
      const next = { ...prev };
      if (qty > 0) next[resourceId] = qty;
      else delete next[resourceId];
      return next;
    });
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

    const resourcePayload = Object.entries(resourceSelections).map(
      ([resourceId, quantity]) => ({
        resourceId,
        quantity,
      }),
    );

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        roomId: selectedRoomId,
        date,
        slot: selectedSlot,
        purpose,
        resources: resourcePayload,
      });
      setMessage({
        type: "success",
        text: "Booking request submitted successfully!",
      });
      setSelectedRoomId("");
      setSelectedSlot("");
      setResourceSelections({});
      setPurpose("");
      loadRooms();
      loadResources();
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
        <h2 className="section-title">Faculty Dashboard</h2>
        <p className="section-subtitle">
          Request a room and, optionally, specific equipment quantities.
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
            <h3>1. Select Room &amp; Time Slot</h3>
            <div className="date-picker-wrap">
              <label className="field-label">Date</label>
              <input
                type="date"
                className="field-input"
                // min={todayStr()} -- new code for advance booking
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
        </div>

        <div className="card">
          <h3>2. Request Equipment (optional)</h3>
          <ResourcePicker
            resources={resources}
            selectedSlot={selectedRoomId ? selectedSlot : ""}
            selections={resourceSelections}
            onChange={handleResourceChange}
          />
        </div>

        <div className="card">
          <h3>3. Confirm Request</h3>
          <form onSubmit={handleSubmit} className="booking-form-footer">
            <label className="field-label">Purpose (optional)</label>
            <input
              className="field-input"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Departmental seminar"
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

export default FacultyDashboard;
