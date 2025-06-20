import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from 'react';
import { Ride, Location } from '@/types';

const ORS_API_KEY = '5b3ce3597851110001cf6248077000b99b4545969da9e70e09910ca4'; // <-- Replace with your OpenRouteService key

interface RideContextType {
  currentRide: Ride | null;
  rideHistory: Ride[];
  setCurrentRide: (ride: Ride | null) => void;
  addToHistory: (ride: Ride) => void;
  updateRideStatus: (status: Ride['status']) => void;
  driverLocation: Location | null;
  startSimulation: (ride: Ride) => void;
  stopSimulation: () => void;
  routePolyline: { latitude: number; longitude: number }[];
}

const RideContext = createContext<RideContextType | null>(null);

function getDistanceMeters(coord1: { latitude: number; longitude: number }, coord2: { latitude: number; longitude: number }): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function RideProvider({ children }: { children: ReactNode }) {
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [routePolyline, setRoutePolyline] = useState<{ latitude: number; longitude: number }[]>([]);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  const addToHistory = (ride: Ride) => {
    setRideHistory(prev => [ride, ...prev]);
  };

  const updateRideStatus = (status: Ride['status']) => {
    if (currentRide) {
      const updatedRide = { ...currentRide, status };
      setCurrentRide(updatedRide);
      if (status === 'completed' || status === 'cancelled') {
        addToHistory({ ...updatedRide, completedAt: new Date() });
        setCurrentRide(null);
        setDriverLocation(null);
        setRoutePolyline([]);
        stopSimulation();
      }
    }
  };

  // Fetch route polyline from ORS
  const fetchRoutePolyline = async (pickup: Location, destination: Location) => {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pickup.coordinates.longitude},${pickup.coordinates.latitude}&end=${destination.coordinates.longitude},${destination.coordinates.latitude}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.features && data.features.length) {
        const coords = data.features[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));
        return coords;
      }
    } catch (e) {
      // ignore
    }
    return [pickup.coordinates, destination.coordinates];
  };

  // Main simulation logic
  const startSimulation = useCallback(async (ride: Ride) => {
    setCurrentRide(ride);
    setDriverLocation(null);
    setRoutePolyline([]);
    if (simulationRef.current) clearInterval(simulationRef.current);

    // Fetch the route polyline
    const polylineCoords = await fetchRoutePolyline(ride.pickup, ride.destination);
    setRoutePolyline(polylineCoords);

    // Step 1: Simulate driver assignment after short delay
    let phase: 'finding_driver' | 'to_pickup' | 'to_destination' = 'finding_driver';
    let status: Ride['status'] = 'booking';
    let progress = 0;
    let intervalMs = 1000;
    let step = 1; // index step for polyline
    let polylineIndex = 0;

    let simulation: any = null;
    simulation = setInterval(() => {
      if (!ride) return;
      if (phase === 'finding_driver') {
        // Simulate finding driver
        status = 'driver_assigned';
        setCurrentRide(r => r ? { ...r, status } : null);
        phase = 'to_pickup';
        // Start driver at the first point of the polyline
        polylineIndex = 0;
        setDriverLocation({
          address: 'Driver Start',
          coordinates: polylineCoords[polylineIndex]
        });
        return;
      }
      if (phase === 'to_pickup') {
        // Move driver along the polyline to pickup (first 1/3 of polyline)
        status = 'driver_arriving';
        setCurrentRide(r => r ? { ...r, status } : null);
        polylineIndex += step;
        const pickupIndex = Math.floor(polylineCoords.length / 3);
        if (polylineIndex >= pickupIndex) {
          // Arrived at pickup
          phase = 'to_destination';
          setCurrentRide(r => r ? { ...r, status: 'in_progress' } : null);
          setDriverLocation({
            address: 'At Pickup',
            coordinates: polylineCoords[pickupIndex]
          });
          polylineIndex = pickupIndex;
          return;
        }
        setDriverLocation({
          address: 'En route to pickup',
          coordinates: polylineCoords[polylineIndex]
        });
        return;
      }
      if (phase === 'to_destination') {
        // Move driver along the polyline to destination (last 2/3 of polyline)
        polylineIndex += step;
        if (polylineIndex >= polylineCoords.length - 1) {
          // Arrived at destination
          status = 'completed';
          setCurrentRide(r => r ? { ...r, status } : null);
          setDriverLocation({
            address: 'Arrived',
            coordinates: polylineCoords[polylineCoords.length - 1]
          });
          stopSimulation();
          return;
        }
        setDriverLocation({
          address: 'En route to destination',
          coordinates: polylineCoords[polylineIndex]
        });
        return;
      }
    }, intervalMs);
    simulationRef.current = simulation;
  }, []);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, []);

  return (
    <RideContext.Provider value={{
      currentRide,
      rideHistory,
      setCurrentRide,
      addToHistory,
      updateRideStatus,
      driverLocation,
      startSimulation,
      stopSimulation,
      routePolyline
    }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRide() {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
}