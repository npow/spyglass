import { useCallback, useMemo, useRef, useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import type { Ship } from '../types';
import { getShipCategory, SHIP_COLORS, MAP_STYLE } from '../utils';

interface ShipMapProps {
  ships: Map<number, Ship>;
  selectedShip: Ship | null;
  onSelectShip: (ship: Ship | null) => void;
}

interface HoverInfo {
  x: number;
  y: number;
  name: string;
  sog: number;
  category: string;
}

export function ShipMap({ ships, selectedShip, onSelectShip }: ShipMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const geojson = useMemo((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: Array.from(ships.values())
      .filter(s => s.latitude !== 0 || s.longitude !== 0)
      .map((ship) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [ship.longitude, ship.latitude],
        },
        properties: {
          mmsi: ship.mmsi,
          name: ship.name || 'Unknown',
          shipType: ship.shipType,
          category: getShipCategory(ship.shipType),
          color: SHIP_COLORS[getShipCategory(ship.shipType)],
          sog: ship.sog,
          cog: ship.cog,
          heading: ship.heading,
        },
      })),
  }), [ships]);

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) {
      onSelectShip(null);
      return;
    }

    if (feature.layer?.id === 'clusters') {
      const map = mapRef.current;
      if (!map) return;
      const source = map.getSource('ships') as GeoJSONSource;
      const clusterId = feature.properties?.cluster_id;
      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const coords = (feature.geometry as GeoJSON.Point).coordinates;
        map.easeTo({
          center: [coords[0], coords[1]],
          zoom: zoom + 0.5,
          duration: 500,
        });
      });
    } else if (feature.layer?.id === 'ships-point') {
      const mmsi = feature.properties?.mmsi;
      const ship = ships.get(mmsi);
      if (ship) {
        onSelectShip(ship);
        mapRef.current?.easeTo({
          center: [ship.longitude, ship.latitude],
          duration: 400,
        });
      }
    }
  }, [ships, onSelectShip]);

  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (feature && feature.layer?.id === 'ships-point') {
      setHoverInfo({
        x: event.point.x,
        y: event.point.y,
        name: feature.properties?.name || 'Unknown',
        sog: feature.properties?.sog ?? 0,
        category: feature.properties?.category || 'other',
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  // Fly to selected ship when it changes
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional fire on mmsi change only
  useMemo(() => {
    if (selectedShip && mapRef.current) {
      mapRef.current.easeTo({
        center: [selectedShip.longitude, selectedShip.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 5),
        duration: 600,
      });
    }
  }, [selectedShip?.mmsi]);

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 20,
          latitude: 25,
          zoom: 2,
        }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={['clusters', 'ships-point']}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        cursor={hoverInfo ? 'pointer' : 'grab'}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={true} />

        <Source
          id="ships"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={11}
          clusterRadius={50}
        >
          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-radius': ['step', ['get', 'point_count'], 14, 50, 18, 200, 24, 500, 30],
              'circle-color': ['step', ['get', 'point_count'],
                '#2563eb', 50,
                '#7c3aed', 200,
                '#c026d3', 500,
                '#e11d48',
              ],
              'circle-opacity': 0.7,
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255,255,255,0.15)',
            }}
          />

          {/* Cluster count text */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Semibold'],
              'text-size': 12,
              'text-allow-overlap': true,
            }}
            paint={{
              'text-color': '#ffffff',
            }}
          />

          {/* Ship glow */}
          <Layer
            id="ships-glow"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 5, 8, 10, 14],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.12,
              'circle-blur': 1,
            }}
          />

          {/* Ship points */}
          <Layer
            id="ships-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 2, 5, 3.5, 10, 6, 14, 10],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.9,
              'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 1, 0, 6, 0.5, 10, 1],
              'circle-stroke-color': 'rgba(255,255,255,0.3)',
            }}
          />
        </Source>
      </Map>

      {hoverInfo && (
        <div
          className="ship-tooltip"
          style={{
            left: hoverInfo.x + 12,
            top: hoverInfo.y - 12,
          }}
        >
          <div className="name">{hoverInfo.name}</div>
          <div className="meta">{hoverInfo.sog.toFixed(1)} kn</div>
        </div>
      )}
    </>
  );
}
