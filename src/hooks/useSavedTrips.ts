"use client";

import { useState, useCallback, useEffect } from "react";
import { TripResult, MissionStatus } from "@/types";

export interface SavedTrip {
  id: string;
  trip: TripResult;
  missions: MissionStatus[];
  savedAt: string;
  completed: boolean;
}

const STORAGE_KEY = "moodquest_trips";

function loadLocal(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function persistLocal(trips: SavedTrip[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function useSavedTrips(userId?: string) {
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  // Load from localStorage on mount, then sync from DB
  useEffect(() => {
    setTrips(loadLocal());
    if (userId) {
      fetch(`/api/trips?userId=${userId}`)
        .then((r) => r.json())
        .then((dbTrips: Array<{ id: string; tripData: TripResult; missionsData: MissionStatus[]; createdAt: string; status: string }>) => {
          if (Array.isArray(dbTrips) && dbTrips.length > 0) {
            const mapped: SavedTrip[] = dbTrips.map((t) => ({
              id: t.id,
              trip: t.tripData as TripResult,
              missions: (t.missionsData as MissionStatus[]) || [],
              savedAt: t.createdAt,
              completed: t.status === "completed",
            }));
            setTrips(mapped);
            persistLocal(mapped);
          }
        })
        .catch(() => { /* use local */ });
    }
  }, [userId]);

  const saveTrip = useCallback((trip: TripResult, missions: MissionStatus[]) => {
    const allCompleted = missions.length > 0 && missions.every((m) => m.completed);
    const newTrip: SavedTrip = {
      id: `trip_${Date.now()}`,
      trip, missions,
      savedAt: new Date().toISOString(),
      completed: allCompleted,
    };

    setTrips((prev) => {
      const updated = [newTrip, ...prev];
      persistLocal(updated);
      return updated;
    });

    // Save to DB
    if (userId) {
      fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, trip, missions }),
      }).catch(() => { /* offline fallback */ });
    }

    return newTrip.id;
  }, [userId]);

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      persistLocal(updated);
      return updated;
    });
  }, []);

  const allTrips = trips;
  const completedTrips = trips.filter((t) => t.completed);

  return { allTrips, completedTrips, saveTrip, deleteTrip };
}
