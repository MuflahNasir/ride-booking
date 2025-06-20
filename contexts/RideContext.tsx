import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from 'react';
import { Ride, Location } from '@/types';

interface RideContextType {
  currentRide: Ride | null;
  rideHistory: Ride[];
  setCurrentRide: (ride: Ride | null) => void;
  addToHistory: (ride: Ride) => void;
  updateRideStatus: (status: Ride['status']) => void;
  driverLocation: Location | null;
  startSimulation: (ride: Ride) => void;
  stopSimulation: () => void;
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
        stopSimulation();
      }
    }
  };

  // Main simulation logic
  const startSimulation = useCallback((ride: Ride) => {
    setCurrentRide(ride);
    setDriverLocation(null);
    if (simulationRef.current) clearInterval(simulationRef.current);

    // Step 1: Simulate driver assignment after short delay
    let phase: 'finding_driver' | 'to_pickup' | 'to_destination' = 'finding_driver';
    let driverPos: Location | null = null;
    let status: Ride['status'] = 'booking';
    let progress = 0;
    let intervalMs = 1000;
    let step = 0.02;

    simulationRef.current = setInterval(() => {
      if (!ride) return;
      if (phase === 'finding_driver') {
        // Simulate finding driver
        status = 'driver_assigned';
        setCurrentRide(r => r ? { ...r, status } : null);
        phase = 'to_pickup';
        // Start driver at a random location near pickup
        const { latitude, longitude } = ride.pickup.coordinates;
        driverPos = {
          address: 'Driver Start',
          coordinates: {
            latitude: latitude + (Math.random() - 0.5) * 0.01,
            longitude: longitude + (Math.random() - 0.5) * 0.01,
          },
        };
        setDriverLocation(driverPos);
        progress = 0;
        return;
      }
      if (phase === 'to_pickup' && driverPos) {
        // Move driver toward pickup
        status = 'driver_arriving';
        setCurrentRide(r => r ? { ...r, status } : null);
        const start = driverPos.coordinates;
        const end = ride.pickup.coordinates;
        progress += step;
        if (progress > 1) progress = 1;
        const newPos = {
          address: 'En route to pickup',
          coordinates: {
            latitude: start.latitude + (end.latitude - start.latitude) * progress,
            longitude: start.longitude + (end.longitude - start.longitude) * progress,
          },
        };
        setDriverLocation(newPos);
        if (getDistanceMeters(newPos.coordinates, end) < 30) {
          // Arrived at pickup
          phase = 'to_destination';
          setCurrentRide(r => r ? { ...r, status: 'in_progress' } : null);
          driverPos = { ...ride.pickup };
          setDriverLocation(driverPos);
          progress = 0;
          return;
        }
        driverPos = newPos;
        return;
      }
      if (phase === 'to_destination' && driverPos) {
        // Move driver toward destination
        const start = driverPos.coordinates;
        const end = ride.destination.coordinates;
        progress += step;
        if (progress > 1) progress = 1;
        const newPos = {
          address: 'En route to destination',
          coordinates: {
            latitude: start.latitude + (end.latitude - start.latitude) * progress,
            longitude: start.longitude + (end.longitude - start.longitude) * progress,
          },
        };
        setDriverLocation(newPos);
        if (getDistanceMeters(newPos.coordinates, end) < 30) {
          // Arrived at destination
          status = 'completed';
          setCurrentRide(r => r ? { ...r, status } : null);
          setDriverLocation(end ? { address: 'Arrived', coordinates: end } : null);
          stopSimulation();
          return;
        }
        driverPos = newPos;
        return;
      }
    }, intervalMs);
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
      stopSimulation
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