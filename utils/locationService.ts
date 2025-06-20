import { Location } from '@/types';

// Mock popular locations for demo (in production, these would come from Google Places)
export const POPULAR_LOCATIONS: Location[] = [
  {
    address: "Times Square, New York, NY, USA",
    coordinates: { latitude: 40.7580, longitude: -73.9855 }
  },
  {
    address: "Central Park, New York, NY, USA",
    coordinates: { latitude: 40.7812, longitude: -73.9665 }
  },
  {
    address: "Brooklyn Bridge, New York, NY, USA",
    coordinates: { latitude: 40.7061, longitude: -73.9969 }
  },
  {
    address: "Empire State Building, New York, NY, USA",
    coordinates: { latitude: 40.7484, longitude: -73.9857 }
  },
  {
    address: "Statue of Liberty, New York, NY, USA",
    coordinates: { latitude: 40.6892, longitude: -74.0445 }
  },
  {
    address: "One World Trade Center, New York, NY, USA",
    coordinates: { latitude: 40.7127, longitude: -74.0134 }
  }
];

export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(loc2.coordinates.latitude - loc1.coordinates.latitude);
  const dLon = toRad(loc2.coordinates.longitude - loc1.coordinates.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(loc1.coordinates.latitude)) * Math.cos(toRad(loc2.coordinates.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI/180);
}

export function estimatePrice(distance: number): number {
  const basePrice = 3.50;
  const pricePerKm = 2.20;
  return Math.round((basePrice + (distance * pricePerKm)) * 100) / 100;
}

export function estimateTime(distance: number): number {
  const averageSpeed = 25; // km/h in city traffic
  return Math.ceil((distance / averageSpeed) * 60); // minutes
}

export function generatePinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Mock function to simulate getting current location
export async function getCurrentLocation(): Promise<Location> {
  // In a real app, this would use expo-location
  return {
    address: "Current Location, New York, NY, USA",
    coordinates: { latitude: 40.7589, longitude: -73.9851 }
  };
}

// Mock function to simulate reverse geocoding
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  // In a real app, this would use Google Maps Geocoding API
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}