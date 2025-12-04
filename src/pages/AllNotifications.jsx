import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import {
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "../utils/notifications";
import { useUnreadNotificationsCount } from "../hooks/useUnreadNotificationsCount";
import {
  CheckCircleIcon,
  CheckIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

function formatDateTime(ts) {
  if (!ts?.toDate) return "-";
  return ts.toDate().toLocaleString();
}

function Notifications() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    if (!userProfile?.uid) return;
    loadNotifications();
  }, [userProfile?.uid]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const list = await getNotificationsForUser(userProfile.uid);
      setNotifications(list);
    } catch (err) {
      console.error(err);
      setAlertMsg("Failed to load notifications");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                read: true,
              }
            : n
        )
      );
    } catch (err) {
      console.error(err);
      setAlertMsg("Failed to update notification.");
      setAlertOpen(true);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead(userProfile.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
      setAlertMsg("Failed to mark all as read");
      setAlertOpen(true);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              See updates about registrations and appointments.
            </p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition"
            disabled={notifications.length === 0}
          >
            <CheckIcon className="h-5 w-5" />
            Mark all
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading Notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start justify-between px-4 py-4 transition ${
                    n.read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                     
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        {n.type || "Notification"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-900">{n.message}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[120px]">

                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(n.createdAt)}
                    </p>


                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-gray-600 hover:text-green-600 transition"
                        title="Mark as Read"
                      >
                        <CheckCircleIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal
        isOpen={alertOpen}
        title="Notification"
        onClose={() => setAlertOpen(false)}
      >
        <p className="text-sm text-gray-700">{alertMsg}</p>
      </Modal>
    </AppLayout>
  );
}

export default Notifications;
