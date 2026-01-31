/**
 * MapView Component
 * OpenLayers map consuming Tegola vector tiles from PostGIS
 */

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Circle, Fill, Stroke } from "ol/style";
import MVT from "ol/format/MVT";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import type { Property } from "@boilerplate/types";

interface MapViewProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  onMapReady?: (map: Map) => void;
  properties?: Property[];
}

export default function MapView({
  center = [4.3517, 50.8503], // Brussels, Belgium
  zoom = 12,
  onMapReady,
  properties = [],
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [propertyMarkersLayer, setPropertyMarkersLayer] =
    useState<VectorLayer<VectorSource> | null>(null);
  const onMapReadyRef = useRef(onMapReady);

  // Update ref when callback changes
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Base map layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Tegola vector tile layer for properties
    const propertyLayer = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url: "http://localhost:8081/maps/properties/{z}/{x}/{y}.pbf",
      }),
      style: {
        "circle-radius": 8,
        "circle-fill-color": "#3b82f6",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });

    // Property markers layer from API data
    const markersSource = new VectorSource();
    const markersLayer = new VectorLayer({
      source: markersSource,
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: "#3b82f6" }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
      }),
    });

    setPropertyMarkersLayer(markersLayer);

    // Initialize map
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [baseLayer, propertyLayer, markersLayer],
      view: new View({
        center: fromLonLat(center),
        zoom,
      }),
    });

    setMap(mapInstance);
    onMapReadyRef.current?.(mapInstance);

    // Cleanup on unmount
    return () => {
      mapInstance.setTarget(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update center/zoom when props change
  useEffect(() => {
    if (map) {
      map.getView().setCenter(fromLonLat(center));
      map.getView().setZoom(zoom);
    }
  }, [map, center, zoom]);

  // Update property markers when properties change
  useEffect(() => {
    if (!propertyMarkersLayer || !properties) return;

    const source = propertyMarkersLayer.getSource();
    if (!source) return;

    // Clear existing markers
    source.clear();

    // Add markers for properties that have location data
    const features = properties
      .filter((property) => {
        // Check if address has coordinates
        if (typeof property.address === "object" && property.address) {
          return property.address.longitude != null && property.address.latitude != null;
        }
        return false;
      })
      .map((property) => {
        const address = property.address as {
          longitude: number;
          latitude: number;
          [key: string]: any;
        };
        const feature = new Feature({
          geometry: new Point(fromLonLat([address.longitude, address.latitude])),
          property: property,
        });
        return feature;
      });

    source.addFeatures(features);
  }, [propertyMarkersLayer, properties]);

  return <div data-testid="property-map" ref={mapRef} className="w-full h-full" style={{ minHeight: "500px" }} />;
}
