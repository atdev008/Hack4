"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PinMapProps {
  initialLat: number;
  initialLng: number;
  onPin: (lat: number, lng: number) => void;
}

export default function PinMap({ initialLat, initialLng, onPin }: PinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: true }).setView([initialLat, initialLng], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

    // Center crosshair marker
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#6366F1;color:white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 12px rgba(99,102,241,0.5);border:3px solid white;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([initialLat, initialLng], { icon, draggable: true }).addTo(map);
    markerRef.current = marker;

    // Click on map to move pin
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setPinned(true);
    });

    marker.on("dragend", () => {
      setPinned(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLat, initialLng]);

  const handleConfirm = () => {
    if (markerRef.current) {
      const { lat, lng } = markerRef.current.getLatLng();
      onPin(lat, lng);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <button
        onClick={handleConfirm}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 pill-btn text-[13px] font-semibold z-[1000]"
        style={{
          background: "var(--color-primary)",
          color: "white",
          padding: "10px 24px",
          boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
        }}
      >
        {pinned ? "✓ ยืนยันจุดนี้" : "กดบนแผนที่เพื่อปักหมุด"}
      </button>
    </div>
  );
}
