export interface Location {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface VehicleType {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  pricePerKm: number;
  capacity: number;
  estimatedTime: number;
  features: string[];
  category: 'economy' | 'comfort' | 'premium' | 'bike';
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plate: string;
    type: string;
  };
  phone: string;
  photo?: string;
}

export interface Ride {
  id: string;
  pickup: Location;
  destination: Location;
  vehicleType: VehicleType;
  status: 'booking' | 'driver_assigned' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';
  driver?: Driver;
  estimatedTime: number;
  estimatedPrice: number;
  actualPrice?: number;
  pinCode: string;
  createdAt: Date;
  completedAt?: Date;
  distance: number;
  remainingDistance?: number;
  remainingTime?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalRides: number;
}