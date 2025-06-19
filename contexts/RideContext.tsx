import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ride } from '@/types';

interface RideContextType {
  currentRide: Ride | null;
  rideHistory: Ride[];
  setCurrentRide: (ride: Ride | null) => void;
  addToHistory: (ride: Ride) => void;
  updateRideStatus: (status: Ride['status']) => void;
}

const RideContext = createContext<RideContextType | null>(null);

export function RideProvider({ children }: { children: ReactNode }) {
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);

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
      }
    }
  };

  return (
    <RideContext.Provider value={{
      currentRide,
      rideHistory,
      setCurrentRide,
      addToHistory,
      updateRideStatus
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