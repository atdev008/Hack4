"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RouteItem } from "@/types";

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface LeafletMapProps {
  points: RouteItem[];
}

export default function LeafletMap({ points }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const validPoints = points.filter((p) => p.place_lat && p.place_lng);
    if (validPoints.length === 0) return;

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    // Add markers with labels
    const latLngs: L.LatLngExpression[] = [];
    validPoints.forEach((p, i) => {
      const latLng: L.LatLngExpression = [p.place_lat!, p.place_lng!];
      latLngs.push(latLng);

      // Custom marker with label
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:#6366F1;color:white;
          display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:700;
          box-shadow:0 2px 8px rgba(99,102,241,0.4);
          border:2px solid white;
        ">${LABELS[i]}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(latLng, { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-size:13px;font-weight:600;min-width:120px">
            <b>${LABELS[i]}. ${p.place}</b><br/>
            <span style="font-size:11px;color:#6B7280">${p.time} · ${p.stay_minutes} min</span>
          </div>`,
          { closeButton: false }
        );
    });

    // Draw route line
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: "#6366F1",
        weight: 3,
        opacity: 0.7,
        dashArray: "8, 8",
      }).addTo(map);
    }

    // Fit bounds
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [30, 30] });

    // Add zoom control bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
