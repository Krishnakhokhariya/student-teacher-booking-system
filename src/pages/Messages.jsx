import React, { useEffect, useState, useRef } from "react";
import AppLayout from "../layouts/AppLayout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import {
  sendMessage,
  getConversation,
  getConversationPartners,
  getUnreadCounts,
  markConversationRead,
} from "../utils/messages";

function Messages() {
  const { userProfile } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  const [isChatViewMobile, setIsChatViewMobile] = useState(false);

  const bottomRef = useRef(null);

  const hasSelectedUser = !!selectedUser;
  const [isXL, setIsXL] = useState(window.innerWidth >= 1280);

  const showChatPanel = isXL || (hasSelectedUser && isChatViewMobile);
  const showContacts = isXL || !isChatViewMobile;

  useEffect(() => {
    function handleResize() {
      setIsXL(window.innerWidth >= 1280);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userProfile?.uid) return;
    loadContactsAndUnread();
  }, [userProfile?.uid, userProfile?.role]);

  async function loadContactsAndUnread() {
    try {
      setLoadingContacts(true);

      const [list, counts] = await Promise.all([
        getConversationPartners(userProfile.uid, userProfile.role),
        getUnreadCounts(userProfile.uid),
      ]);

      const lastTimes = await Promise.all(
        list.map(async (c) => {
          const conv = await getConversation(userProfile.uid, c.uid);
          if (conv.length === 0) return { uid: c.uid, last: 0 };
          return {
            uid: c.uid,
            last: conv[conv.length - 1].createdAt?.seconds || 0,
          };
        })
      );

      const sorted = list.sort((a, b) => {
        const unreadA = counts[a.uid] || 0;
        const unreadB = counts[b.uid] || 0;

        const lastA = lastTimes.find((t) => t.uid === a.uid)?.last || 0;
        const lastB = lastTimes.find((t) => t.uid === b.uid)?.last || 0;

        if (unreadA !== unreadB) return unreadB - unreadA;
        if (lastA !== lastB) return lastB - lastA;

        return a.name.localeCompare(b.name);
      });

      setContacts(sorted);
      setUnreadCounts(counts);
    } catch (err) {
      setAlertMsg("Failed to load contacts.");
      setAlertOpen(true);
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  }
  async function loadChat(partner) {
    if (!partner) return;

    setSelectedUser(partner);
    setLoadingChat(true);

    try {
      const conv = await getConversation(userProfile.uid, partner.uid);
      setMessages(conv);

      await markConversationRead(userProfile.uid, partner.uid);
      setUnreadCounts(await getUnreadCounts(userProfile.uid));

      scrollToBottom();

      if (window.innerWidth < 1280) {
        setIsChatViewMobile(true);
      }
    } catch (err) {
      setAlertMsg("Failed to load conversation.");
      setAlertOpen(true);
    } finally {
      setLoadingChat(false);
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedUser) return;

    const temp = newMessage.trim();

    try {
      await sendMessage({
        fromUid: userProfile.uid,
        fromName: userProfile.name,
        toUid: selectedUser.uid,
        toName: selectedUser.name,
        message: temp,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: "local-" + Date.now(),
          fromUid: userProfile.uid,
          message: temp,
          createdAt: { seconds: Date.now() / 1000 },
        },
      ]);

      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.style.height = "40px";
      }

      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      setAlertMsg("Failed to send message");
      setAlertOpen(true);
    }
  }

  function handleBackToContacts() {
    setIsChatViewMobile(false);
    setIsChatViewMobile(false);
    setSelectedUser(null);
  }

  function formatTime(seconds) {
    if (!seconds) return "";
    return new Date(seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <AppLayout>
      <div className="h-full grid grid-cols-12 gap-4">
        {showContacts && (
          <div className="col-span-12 xl:col-span-4 bg-white rounded-xl shadow p-4 overflow-y-auto">
            <div className="flex justify-between mb-3">
              <h2 className="text-lg font-semibold">Messages</h2>
              {loadingContacts ? (
                <span className="text-xs text-gray-500">Loading...</span>
              ) : (
                <span className="text-xs text-gray-500">
                  {contacts.length} contacts
                </span>
              )}
            </div>

            <div className="space-y-1">
              {contacts.map((c) => {
                const unread = unreadCounts[c.uid] || 0;
                const active = selectedUser?.uid === c.uid;

                return (
                  <button
                    key={c.uid}
                    onClick={() => loadChat(c)}
                    className={`w-full px-3 py-2 rounded-lg flex justify-between hover:bg-gray-100
                      ${active ? "bg-gray-200" : ""}`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.email}</div>
                    </div>

                    {unread > 0 && (
                      <span className="bg-red-500 h-7 w-7 text-white text-center rounded-full text-sm p-1">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showChatPanel && (
          <div className="col-span-12 xl:col-span-8 bg-white rounded-xl shadow flex flex-col">
            <div className="border-b px-4 py-3 flex bg-gray-200 rounded-md items-center gap-5">
              {hasSelectedUser && (
                <button
                  className="xl:hidden text-sm text-gray-600"
                  onClick={handleBackToContacts}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
              )}

              <div>
                <div className="font-semibold text-sm">
                  {selectedUser?.name || "Select a conversation"}
                </div>
                {selectedUser && (
                  <div className="text-xs text-gray-500">
                    {selectedUser.email}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
              {!hasSelectedUser ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Select a contact
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No messages yet. Start chating
                </div>
              ) : (
                <>
                  {messages.map((m) => {
                    const mine = m.fromUid === userProfile.uid;

                    return (
                      <div
                        key={m.id}
                        className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm flex flex-col
                        ${
                          mine
                            ? "ml-auto bg-gray-900 text-white"
                            : "mr-auto bg-white border border-gray-200 text-gray-800"
                        }`}
                      >
                        {m.message}
                        <span
                          className={`text-[10px] mt-1 self-end ${
                            mine ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {formatTime(m.createdAt?.seconds)}
                        </span>
                      </div>
                    );
                  })}

                  <div ref={bottomRef}></div>
                </>
              )}
            </div>

            {hasSelectedUser && (
              <div className="border-t p-3 flex gap-2 items-end bg-white">
                <textarea
                  ref={bottomRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(
                      e.target.scrollHeight,
                      120
                    )}px`;
                  }}
                  className="flex-1 border rounded-xl px-3 py-2 text-sm max-h-[120px] overflow-y-auto resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Type a message..."
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="h-10 px-5 flex items-center justify-center bg-gray-900 text-white rounded-full disabled:opacity-40 hover:bg-black transition"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={alertOpen}
        title="Message"
        primaryLabel="OK"
        onPrimaryClick={() => setAlertOpen(false)}
        onClose={() => setAlertOpen(false)}
      >
        <p>{alertMsg}</p>
      </Modal>
    </AppLayout>
  );
}

export default Messages;
