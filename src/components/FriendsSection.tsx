"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/i18n/context";
import { QRCodeSVG } from "qrcode.react";
import { UserPlus, Search, MapPin, Check, X, QrCode, Copy, Users, Navigation } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  avatar?: string | null;
}

interface NearbyUser {
  id: string;
  name: string;
  avatar?: string | null;
  distance_km: number;
}

interface PendingRequest {
  id: string;
  fromUser: { id: string; name: string; avatar?: string | null };
}

interface FriendsSectionProps {
  userId: string;
  userName: string;
  geoLat?: number | null;
  geoLng?: number | null;
}

export default function FriendsSection({ userId, userName, geoLat, geoLng }: FriendsSectionProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [tab, setTab] = useState<"friends" | "add" | "nearby">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Load friends
  const loadFriends = useCallback(async () => {
    try {
      const r = await fetch(`/api/friends?userId=${userId}`);
      const data = await r.json();
      setFriends(data.friends || []);
      setPending(data.pendingReceived || []);
    } catch { /* ignore */ }
  }, [userId]);

  useEffect(() => { loadFriends(); }, [loadFriends]);

  // Load nearby
  const loadNearby = useCallback(async () => {
    if (!geoLat || !geoLng) return;
    try {
      const r = await fetch(`/api/friends/nearby?userId=${userId}&lat=${geoLat}&lng=${geoLng}&radius=2`);
      const data = await r.json();
      if (Array.isArray(data)) setNearby(data);
    } catch { /* ignore */ }
  }, [userId, geoLat, geoLng]);

  useEffect(() => { if (tab === "nearby") loadNearby(); }, [tab, loadNearby]);

  // Search
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    try {
      const r = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}&userId=${userId}`);
      setSearchResults(await r.json());
    } catch { /* ignore */ }
  };

  // Add friend
  const handleAddFriend = async (toUserId: string) => {
    setAddingId(toUserId);
    try {
      await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", fromUserId: userId, toUserId }),
      });
      loadFriends();
    } catch { /* ignore */ }
    setAddingId(null);
  };

  // Accept/reject request
  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, requestId }),
    });
    loadFriends();
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-5">
      <h3 className="text-[14px] font-bold mb-3 flex items-center gap-2">
        <Users size={16} strokeWidth={1.8} style={{ color: "var(--color-primary)" }} />
        {isEn ? "Friends" : "เพื่อน"}
        {friends.length > 0 && <span className="text-[12px] font-normal" style={{ color: "var(--color-text-tertiary)" }}>({friends.length})</span>}
      </h3>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-3">
        {([
          { id: "friends" as const, label: isEn ? "My Friends" : "เพื่อนของฉัน" },
          { id: "add" as const, label: isEn ? "Add Friend" : "เพิ่มเพื่อน" },
          { id: "nearby" as const, label: isEn ? "Nearby" : "ใกล้เคียง" },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="pill-btn text-[12px]"
            style={{ background: tab === t.id ? "var(--color-primary)" : "var(--color-surface-3)", color: tab === t.id ? "white" : "var(--color-text-secondary)", padding: "6px 14px" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* My Friends */}
      {tab === "friends" && (
        <div className="space-y-2">
          {/* Pending requests */}
          {pending.map((req) => (
            <div key={req.id} className="app-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "#F59E0B" }}>
                {req.fromUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold">{req.fromUser.name}</span>
                <span className="text-[11px] block" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "wants to be friends" : "ขอเป็นเพื่อน"}</span>
              </div>
              <button onClick={() => handleRequest(req.id, "accept")} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#10B98115" }}>
                <Check size={16} strokeWidth={2} style={{ color: "#10B981" }} />
              </button>
              <button onClick={() => handleRequest(req.id, "reject")} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EF444415" }}>
                <X size={16} strokeWidth={2} style={{ color: "#EF4444" }} />
              </button>
            </div>
          ))}

          {friends.length === 0 && pending.length === 0 && (
            <div className="text-center py-6">
              <Users size={28} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: "var(--color-text-tertiary)" }} />
              <p className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "No friends yet" : "ยังไม่มีเพื่อน"}</p>
            </div>
          )}

          {friends.map((f) => (
            <div key={f.id} className="app-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "var(--color-primary)" }}>
                {f.name.charAt(0)}
              </div>
              <span className="text-[13px] font-semibold flex-1">{f.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Friend */}
      {tab === "add" && (
        <div className="space-y-3">
          {/* My QR Code */}
          <div className="app-card p-4 text-center">
            <button onClick={() => setShowQR(!showQR)} className="pill-btn gap-1.5 text-[12px] mb-3"
              style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)", padding: "8px 16px" }}>
              <QrCode size={14} strokeWidth={2} />
              {showQR ? (isEn ? "Hide QR" : "ซ่อน QR") : (isEn ? "Show My QR Code" : "แสดง QR Code ของฉัน")}
            </button>

            {showQR && (
              <div className="animate-fade-in">
                <div className="inline-block p-4 bg-white rounded-2xl mb-2" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <QRCodeSVG value={`moodquest://friend/${userId}`} size={160} level="M"
                    fgColor="#6366F1" bgColor="white" />
                </div>
                <p className="text-[12px] font-semibold mb-1">{userName}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>{userId.slice(0, 16)}...</span>
                  <button onClick={copyId} className="text-[10px] font-medium flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                    {copied ? <Check size={10} strokeWidth={2} /> : <Copy size={10} strokeWidth={2} />}
                    {copied ? "Copied!" : "Copy ID"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search by name/ID */}
          <div className="app-card p-4">
            <p className="text-[12px] font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
              {isEn ? "Search by name or ID" : "ค้นหาจากชื่อหรือ ID"}
            </p>
            <div className="flex gap-2">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={isEn ? "Name or user ID..." : "ชื่อหรือ user ID..."}
                className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border-light)" }} />
              <button onClick={handleSearch} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
                <Search size={16} strokeWidth={2} color="white" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--color-primary)" }}>
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-[13px] font-medium flex-1">{u.name}</span>
                    <button onClick={() => handleAddFriend(u.id)} disabled={addingId === u.id}
                      className="pill-btn text-[11px] gap-1" style={{ background: "#6366F115", color: "var(--color-primary)", padding: "5px 12px" }}>
                      <UserPlus size={12} strokeWidth={2} />
                      {addingId === u.id ? "..." : (isEn ? "Add" : "เพิ่ม")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearby */}
      {tab === "nearby" && (
        <div className="space-y-2">
          {!geoLat || !geoLng ? (
            <div className="app-card p-4 text-center">
              <MapPin size={24} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: "var(--color-text-tertiary)" }} />
              <p className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "Enable GPS to find nearby users" : "เปิด GPS เพื่อหาคนใกล้เคียง"}</p>
            </div>
          ) : nearby.length === 0 ? (
            <div className="app-card p-4 text-center">
              <Navigation size={24} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: "var(--color-text-tertiary)" }} />
              <p className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "No users nearby (2km)" : "ไม่พบคนใกล้เคียง (2 กม.)"}</p>
            </div>
          ) : (
            nearby.map((u) => (
              <div key={u.id} className="app-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "#10B981" }}>
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold">{u.name}</span>
                  <span className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    <MapPin size={10} strokeWidth={2} />
                    {u.distance_km < 1 ? `${Math.round(u.distance_km * 1000)}m` : `${u.distance_km.toFixed(1)}km`}
                  </span>
                </div>
                <button onClick={() => handleAddFriend(u.id)} disabled={addingId === u.id}
                  className="pill-btn text-[11px] gap-1" style={{ background: "#10B98115", color: "#10B981", padding: "5px 12px" }}>
                  <UserPlus size={12} strokeWidth={2} />
                  {addingId === u.id ? "..." : (isEn ? "Add" : "เพิ่ม")}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
