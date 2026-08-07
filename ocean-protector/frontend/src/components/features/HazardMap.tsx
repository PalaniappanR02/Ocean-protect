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
  /** DBSCAN social-signal clusters: { clusterId, signalCount, latitude, longitude } */
  hotspots?: Array<{ clusterId: string; signalCount: number; latitude: number; longitude: number }>;
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

export function HazardMap({
  reports = [],
  incidents = [],
  regions = [],
  hotspots = [],
  center = [12.5, 79.0],
  zoom = 6,
  className = 'h-[600px]',
  onMarkerClick,
}: HazardMapProps) {
  const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
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
              color: 'var(--color-accent)',
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
            className={`map-marker map-marker--${report.severity}`}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.5,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onMarkerClick?.(report.id),
            }}
          >
            <Popup className="map-popup">
              <div className="map-popup-card">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-sm">IMG</div>
                  <div>
                    <div className="font-semibold text-sm">{report.title}</div>
                    <div className="text-xs text-muted-foreground">{HAZARD_TYPE_LABELS[report.hazardType]}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{report.districtName}, {report.stateCode}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(report.observedAt)}</div>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Dynamic hotspots — DBSCAN clusters of social signals */}
      {hotspots.map((hotspot) => {
        const radius = Math.min(26, 10 + hotspot.signalCount * 2.5);
        return (
          <CircleMarker
            key={hotspot.clusterId}
            center={[hotspot.latitude, hotspot.longitude]}
            radius={radius}
            className="map-marker map-marker--hotspot"
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.35,
              weight: 2,
              dashArray: '4 4',
            }}
          >
            <Popup className="map-popup">
              <div className="map-popup-card">
                <div className="font-semibold text-sm">Signal hotspot</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {hotspot.signalCount} correlated social signals
                </div>
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
            className={`map-marker map-marker--${incident.severity} map-marker--incident ${isResponding ? 'map-marker--active' : ''}`}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 3,
            }}
            eventHandlers={{
              click: () => onMarkerClick?.(incident.id),
            }}
          >
            <Popup className="map-popup">
              <div className="map-popup-card">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-md bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white text-sm">INC</div>
                  <div>
                    <div className="font-semibold text-sm">{incident.title}</div>
                    <div className="text-xs text-muted-foreground">{incident.incidentCode}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{incident.location.districtName}, {incident.location.stateCode}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Status: {incident.status.replace(/_/g, ' ')}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Reports: {incident.reportCount}</div>
                    {isResponding && (
                      <div className="mt-1 text-sm text-amber-400 font-medium">Response team deployed</div>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
