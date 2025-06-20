import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { Location } from '@/types';

const ORS_API_KEY = '5b3ce3597851110001cf6248077000b99b4545969da9e70e09910ca4'; // <-- Replace with your OpenRouteService key

interface MapViewProps {
  pickup?: Location;
  destination?: Location;
  driverLocation?: Location;
  showRoute?: boolean;
  isTracking?: boolean;
}

export default function RealMapView({ pickup, destination, driverLocation, showRoute = true }: MapViewProps) {
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  // Fetch directions when pickup or destination changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickup || !destination) {
        setRouteCoords([]);
        return;
      }
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pickup.coordinates.longitude},${pickup.coordinates.latitude}&end=${destination.coordinates.longitude},${destination.coordinates.latitude}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length) {
          const coords = data.features[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoords(coords);
        } else {
          setRouteCoords([pickup.coordinates, destination.coordinates]);
        }
      } catch (e) {
        setRouteCoords([pickup.coordinates, destination.coordinates]);
      }
    };
    fetchRoute();
  }, [pickup, destination]);

  // Center the map
  const initialRegion: Region = pickup
    ? {
        latitude: pickup.coordinates.latitude,
        longitude: pickup.coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
        {pickup && (
          <Marker
            coordinate={pickup.coordinates}
            title="Pickup"
            pinColor="green"
          />
        )}
        {destination && (
          <Marker
            coordinate={destination.coordinates}
            title="Destination"
            pinColor="red"
          />
        )}
        {driverLocation && (
          <Marker
            coordinate={driverLocation.coordinates}
            title="Driver"
            pinColor="blue"
          />
        )}
        {showRoute && routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#2563EB"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});