import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import type { HazardReport, Incident, CoastalRegion, Severity } from '@/types';
import { SEVERITY_COLORS, HAZARD_TYPE_LABELS } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface HazardMapProps {
  reports?: HazardReport[];
  incidents?: Incident[];
  regions?: CoastalRegion[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

export function HazardMap({
  reports = [],
  incidents = [],
  regions = [],
  center = [12.5, 79.0],
  zoom = 6,
  className = 'h-[600px]',
  onMarkerClick,
}: HazardMapProps) {
  const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const attribution = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; OpenStreetMap &copy; CARTO';

  const verifiedReports = useMemo(() => reports.filter((r) => r.status === 'verified' || r.status === 'under_review'), [reports]);
  const verifiedIncidents = useMemo(() => incidents.filter((i) => i.status !== 'cancelled'), [incidents]);

  return (
    <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom={true}>
      <TileLayer url={tileUrl} attribution={attribution} />

      {/* Coastal region boundaries */}
      {regions.map((region) => {
        const bounds: [number, number][] = [
          [region.boundingBox.minLat, region.boundingBox.minLon],
          [region.boundingBox.maxLat, region.boundingBox.minLon],
          [region.boundingBox.maxLat, region.boundingBox.maxLon],
          [region.boundingBox.minLat, region.boundingBox.maxLon],
        ];
        return (
          <Polygon
            key={region.id}
            positions={bounds}
            pathOptions={{
              color: '#0ea5e9',
              weight: 1,
              opacity: 0.3,
              fillOpacity: 0.03,
            }}
          />
        );
      })}

      {/* Report markers */}
      {verifiedReports.map((report) => {
        const color = SEVERITY_COLORS[report.severity];
        const radius = report.severity === 'critical' ? 12 : report.severity === 'warning' ? 10 : report.severity === 'advisory' ? 8 : 6;

        return (
          <CircleMarker
            key={report.id}
            center={[report.latitude, report.longitude]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.4,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onMarkerClick?.(report.id),
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="mb-1 font-semibold text-slate-100">{report.title}</div>
                <div className="text-slate-400">
                  {HAZARD_TYPE_LABELS[report.hazardType]}
                </div>
                <div className="mt-1 text-slate-500">
                  {report.districtName}, {report.stateCode}
                </div>
                <div className="text-slate-500">
                  {formatRelativeTime(report.observedAt)}
                </div>
                {report.confidenceScore !== undefined && (
                  <div className="mt-1 text-slate-400">
                    Confidence: {report.confidenceScore}%
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Incident markers */}
      {verifiedIncidents.map((incident) => {
        const color = SEVERITY_COLORS[incident.severity];
        const radius = incident.severity === 'critical' ? 16 : 12;
        const isResponding = incident.status === 'responding' || incident.status === 'assigned';

        return (
          <CircleMarker
            key={incident.id}
            center={[incident.location.latitude, incident.location.longitude]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.5,
              weight: 3,
            }}
            eventHandlers={{
              click: () => onMarkerClick?.(incident.id),
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="mb-1 font-semibold text-slate-100">{incident.title}</div>
                <div className="text-slate-400">{incident.incidentCode}</div>
                <div className="mt-1 text-slate-500">
                  {incident.location.districtName}, {incident.location.stateCode}
                </div>
                <div className="text-slate-500">
                  Status: {incident.status.replace(/_/g, ' ')}
                </div>
                <div className="text-slate-500">
                  Reports: {incident.reportCount}
                </div>
                {isResponding && (
                  <div className="mt-1 text-orange-400 font-medium">
                    Response team deployed
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}