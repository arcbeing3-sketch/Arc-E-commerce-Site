import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, MapMouseEvent } from '@vis.gl/react-google-maps';
import { MapPin, ExternalLink, Layers, Navigation } from 'lucide-react';
import { getCityCoordinates, CITY_COORDINATES } from '../../shared/pakistanCities';

interface GoogleMapViewProps {
  city: string;
  street?: string;
  province?: string;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  className?: string;
  interactive?: boolean;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  city,
  street = '',
  province = '',
  onLocationSelect,
  className = '',
  interactive = true,
}) => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  const apiKey = metaEnv?.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';
  
  // Get initial city coordinates
  const initialCoords = getCityCoordinates(city);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(initialCoords);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');

  // Center map on city update
  useEffect(() => {
    const coords = getCityCoordinates(city);
    setMarkerPosition(coords);
    if (onLocationSelect) {
      onLocationSelect(coords);
    }
  }, [city]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (!interactive || !e.detail.latLng) return;
    const newPos = {
      lat: e.detail.latLng.lat,
      lng: e.detail.latLng.lng,
    };
    setMarkerPosition(newPos);
    if (onLocationSelect) {
      onLocationSelect(newPos);
    }
  };

  const addressQuery = [street, city, province, 'Pakistan'].filter(Boolean).join(', ');
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    addressQuery
  )}&utm_campaign=gmp_mcp_codeassist_v1_aistudio`;

  return (
    <div className={`border border-zinc-200 bg-zinc-50 rounded-none overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="px-3.5 py-2.5 bg-zinc-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="font-medium tracking-wide uppercase text-[11px]">
            Google Maps Delivery View
          </span>
          <span className="text-zinc-400 hidden sm:inline">&bull;</span>
          <span className="text-zinc-300 truncate max-w-xs font-light hidden sm:inline">
            {city || 'Select city'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {apiKey && (
            <button
              type="button"
              onClick={() => setMapType(mapType === 'roadmap' ? 'hybrid' : 'roadmap')}
              className="text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-none border border-zinc-700 transition-colors"
              title="Toggle satellite view"
            >
              <Layers className="w-3 h-3" />
              <span>{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
            </button>
          )}

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-none border border-zinc-700 transition-colors"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Map Content Container */}
      <div className="relative w-full h-56 sm:h-64 bg-zinc-100">
        {apiKey ? (
          <APIProvider apiKey={apiKey} region="pk" language="en">
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              defaultCenter={markerPosition}
              center={markerPosition}
              defaultZoom={13}
              zoom={13}
              mapTypeId={mapType}
              gestureHandling={interactive ? 'greedy' : 'none'}
              onClick={handleMapClick}
              disableDefaultUI={false}
            >
              <AdvancedMarker position={markerPosition}>
                <div className="relative flex items-center justify-center">
                  <div className="w-7 h-7 bg-zinc-950 text-white rounded-none border border-white shadow-lg flex items-center justify-center">
                    <Navigation className="w-3.5 h-3.5 text-white transform -rotate-45" />
                  </div>
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-zinc-950 rotate-45 border-r border-b border-white" />
                </div>
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          /* Interactive Embed Preview when API Key is pending */
          <div className="w-full h-full relative">
            <iframe
              title={`Google Map - ${city}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                [street, city, 'Pakistan'].filter(Boolean).join(' ')
              )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            />
            <div className="absolute top-2 left-2 bg-zinc-950/85 text-white px-2.5 py-1 text-[10px] tracking-wide uppercase rounded-none backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google Maps View &bull; {city}, Pakistan</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info bar */}
      <div className="px-3.5 py-2 bg-white border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5 font-light">
          <span className="text-zinc-900 font-medium">Pinpoint:</span>
          <span>
            {markerPosition.lat.toFixed(4)}° N, {markerPosition.lng.toFixed(4)}° E
          </span>
          {CITY_COORDINATES[city]?.province && (
            <span className="text-zinc-400">({CITY_COORDINATES[city].province})</span>
          )}
        </div>

        <div className="text-[10px] text-zinc-400 font-light">
          {interactive ? 'Click on map to calibrate delivery spot' : 'Live delivery destination'}
        </div>
      </div>
    </div>
  );
};
