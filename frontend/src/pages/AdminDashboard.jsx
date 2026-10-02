import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { StatusBadge, SlotBadge } from "../components/Badges";
import api from "../api/axios";

const TABS = ["Master Schedule", "Rooms", "Resources"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Master Schedule");

  return (
    <div className="page-shell">
      <Navbar />
      <main className="page-content">
        <h2 className="section-title">Admin Dashboard</h2>
        <p className="section-subtitle">
          Master controls for rooms, equipment inventory, and booking approvals.
        </p>

        <div className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "tab-btn-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Master Schedule" && <MasterSchedule />}
        {activeTab === "Rooms" && <RoomsManager />}
        {activeTab === "Resources" && <ResourcesManager />}
      </main>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Master Schedule                                                     */
/* ------------------------------------------------------------------ */

const MasterSchedule = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reasonText, setReasonText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings");
      setBookings(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load master schedule",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (fn, successText) => {
    setMessage(null);
    try {
      await fn();
      setMessage({ type: "success", text: successText });
      load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Action failed",
      });
    }
  };

  const handleApprove = (id) =>
    runAction(() => api.put(`/bookings/${id}/approve`), "Booking approved");

  const handleRejectSubmit = (id) => {
    if (!reasonText.trim()) {
      setMessage({ type: "error", text: "A rejection reason is required" });
      return;
    }
    runAction(
      () => api.put(`/bookings/${id}/reject`, { reason: reasonText }),
      "Booking rejected",
    ).then(() => {
      setRejectingId(null);
      setReasonText("");
    });
  };

  const handleReleaseRoom = (id) =>
    runAction(
      () => api.put(`/bookings/${id}/release-room`),
      "Room released and slot freed up",
    );

  const handleReleaseResources = (id) =>
    runAction(
      () => api.put(`/bookings/${id}/release-resources`),
      "Resources released and inventory restored",
    );

  return (
    <div className="card">
      <div className="card-header-row">
        <h3>Master Schedule — All Rooms &amp; Resources</h3>
        <button className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="empty-hint">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="empty-hint">No booking requests yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requested By</th>
                <th>Room</th>
                <th>Date</th>
                <th>Slot</th>
                {/* new line for showing the purpose */}
                <th>Purpose</th>
                <th>Equipment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.requestedBy?.name}
                    <br />
                    <span className="muted-text">{b.requesterRole}</span>
                  </td>

                  <td className="cell-nowrap">{b.room?.name}</td>
                  <td>{b.date}</td>
                  <td className="cell-nowrap">
                    <SlotBadge slot={b.slot} />
                  </td>
                  {/* new code  */}
                  <td>
                    {b.purpose ? (
                      b.purpose
                    ) : (
                      <span className="muted-text">—</span>
                    )}
                  </td>
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
                  <td>
                    <StatusBadge status={b.status} />
                    {b.status === "Rejected" && b.rejectionReason && (
                      <div className="muted-text text-danger">
                        Reason: {b.rejectionReason}
                      </div>
                    )}
                    {b.status !== "Rejected" && (
                      <div className="muted-text">
                        Room: {b.roomReleased ? "Released" : "Active"}
                        {b.resources?.length > 0 && (
                          <>
                            {" "}
                            · Equip:{" "}
                            {b.resourcesReleased ? "Released" : "Active"}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  {
                    /* <td className="actions-cell">
                    {b.status === 'Pending' && (
                      <>
                        <button className="btn btn-small btn-success" onClick={() => handleApprove(b._id)}>
                          Approve
                        </button>
                        {rejectingId === b._id ? (
                          <div className="reject-inline">
                            <input
                              className="field-input"
                              type="text"
                              placeholder="Rejection reason (required)"
                              value={reasonText}
                              onChange={(e) => setReasonText(e.target.value)}
                            />
                            <button className="btn btn-small btn-danger" onClick={() => handleRejectSubmit(b._id)}>
                              Confirm Reject
                            </button>
                            <button
                              className="btn btn-small btn-ghost"
                              onClick={() => {
                                setRejectingId(null);
                                setReasonText('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => {
                              setRejectingId(b._id);
                              setReasonText('');
                            }}
                          >
                            Reject
                          </button>
                        )}
                      </>
                    )}

                    {(b.status === 'Approved' || b.status === 'Pending') && !b.roomReleased && (
                      <button className="btn btn-small btn-primary" onClick={() => handleReleaseRoom(b._id)}>
                        Release Room
                      </button>
                    )}

                    {(b.status === 'Approved' || b.status === 'Pending') &&
                      b.resources?.length > 0 &&
                      !b.resourcesReleased && (
                        <button className="btn btn-small btn-primary" onClick={() => handleReleaseResources(b._id)}>
                          Release Resources
                        </button>
                      )}
                  </td> */
                    // new code
                    <td className="actions-cell">
                      <div className="actions-cell-inner">
                        {b.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-small btn-success"
                              onClick={() => handleApprove(b._id)}
                            >
                              Approve
                            </button>
                            {rejectingId === b._id ? (
                              <div className="reject-inline">
                                <input
                                  className="field-input"
                                  type="text"
                                  placeholder="Rejection reason (required)"
                                  value={reasonText}
                                  onChange={(e) =>
                                    setReasonText(e.target.value)
                                  }
                                />
                                <button
                                  className="btn btn-small btn-danger"
                                  onClick={() => handleRejectSubmit(b._id)}
                                >
                                  Confirm Reject
                                </button>
                                <button
                                  className="btn btn-small btn-ghost"
                                  onClick={() => {
                                    setRejectingId(null);
                                    setReasonText("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-small btn-danger"
                                onClick={() => {
                                  setRejectingId(b._id);
                                  setReasonText("");
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}

                        {(b.status === "Approved" || b.status === "Pending") &&
                          !b.roomReleased && (
                            <button
                              className="btn btn-small btn-primary"
                              onClick={() => handleReleaseRoom(b._id)}
                            >
                              Release Room
                            </button>
                          )}

                        {(b.status === "Approved" || b.status === "Pending") &&
                          b.resources?.length > 0 &&
                          !b.resourcesReleased && (
                            <button
                              className="btn btn-small btn-primary"
                              onClick={() => handleReleaseResources(b._id)}
                            >
                              Release Resources
                            </button>
                          )}
                      </div>
                    </td>
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Rooms Manager                                                       */
/* ------------------------------------------------------------------ */

const RoomsManager = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ name: "", capacity: "", location: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rooms");
      setRooms(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load rooms",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({ name: "", capacity: "", location: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingId) {
        await api.put(`/rooms/${editingId}`, form);
        setMessage({ type: "success", text: "Room updated" });
      } else {
        await api.post("/rooms", form);
        setMessage({ type: "success", text: "Room created" });
      }
      resetForm();
      load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save room",
      });
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      name: room.name,
      capacity: room.capacity,
      location: room.location || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room? This cannot be undone.")) return;
    try {
      await api.delete(`/rooms/${id}`);
      setMessage({ type: "success", text: "Room deleted" });
      load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete room",
      });
    }
  };

  return (
    <div className="card">
      <h3>{editingId ? "Edit Room" : "Add a New Room"}</h3>
      {message && (
        <div
          className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}
        >
          {message.text}
        </div>
      )}

      <form className="inline-form" onSubmit={handleSubmit}>
        <div>
          <label className="field-label">Room Name</label>
          <input
            className="field-input"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Seminar Hall A"
            required
          />
        </div>
        <div>
          <label className="field-label">Total Seating Capacity</label>
          <input
            className="field-input"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            placeholder="e.g. 60"
            required
          />
        </div>
        <div>
          <label className="field-label">Location (optional)</label>
          <input
            className="field-input"
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Block C, 2nd Floor"
          />
        </div>
        <div className="inline-form-actions">
          <button className="btn btn-primary" type="submit">
            {editingId ? "Update Room" : "Create Room"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="section-gap">All Rooms</h3>
      {loading ? (
        <p className="empty-hint">Loading...</p>
      ) : rooms.length === 0 ? (
        <p className="empty-hint">No rooms created yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room.name}</td>
                  <td>{room.capacity}</td>
                  <td>{room.location || "—"}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-small btn-ghost"
                      onClick={() => handleEdit(room)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(room._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Resources Manager                                                    */
/* ------------------------------------------------------------------ */

const ResourcesManager = () => {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ name: "", totalCount: "", unit: "units" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/resources");
      setResources(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load resources",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({ name: "", totalCount: "", unit: "units" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingId) {
        await api.put(`/resources/${editingId}`, form);
        setMessage({ type: "success", text: "Resource updated" });
      } else {
        await api.post("/resources", form);
        setMessage({ type: "success", text: "Resource created" });
      }
      resetForm();
      load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save resource",
      });
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource._id);
    setForm({
      name: resource.name,
      totalCount: resource.totalCount,
      unit: resource.unit || "units",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource? This cannot be undone.")) return;
    try {
      await api.delete(`/resources/${id}`);
      setMessage({ type: "success", text: "Resource deleted" });
      load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete resource",
      });
    }
  };

  return (
    <div className="card">
      <h3>{editingId ? "Edit Resource" : "Add Inventory Resource"}</h3>
      {message && (
        <div
          className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}
        >
          {message.text}
        </div>
      )}

      <form className="inline-form" onSubmit={handleSubmit}>
        <div>
          <label className="field-label">Resource Name</label>
          <input
            className="field-input"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Projector"
            required
          />
        </div>
        <div>
          <label className="field-label">Total Available Count</label>
          <input
            className="field-input"
            type="number"
            min={1}
            value={form.totalCount}
            onChange={(e) => setForm({ ...form, totalCount: e.target.value })}
            placeholder="e.g. 10"
            required
          />
        </div>
        <div>
          <label className="field-label">Unit Label (optional)</label>
          <input
            className="field-input"
            type="text"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="units"
          />
        </div>
        <div className="inline-form-actions">
          <button className="btn btn-primary" type="submit">
            {editingId ? "Update Resource" : "Add Resource"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="section-gap">All Resources</h3>
      {loading ? (
        <p className="empty-hint">Loading...</p>
      ) : resources.length === 0 ? (
        <p className="empty-hint">No resources added yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Count</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource._id}>
                  <td>{resource.name}</td>
                  <td>{resource.totalCount}</td>
                  <td>{resource.unit}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-small btn-ghost"
                      onClick={() => handleEdit(resource)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(resource._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
