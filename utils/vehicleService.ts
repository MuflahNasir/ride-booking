import { VehicleType } from '@/types';

export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'bike',
    name: 'Bike',
    description: 'Quick and affordable rides',
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400',
    basePrice: 2.00,
    pricePerKm: 0.80,
    capacity: 1,
    estimatedTime: 5,
    features: ['Quick pickup', 'Beat traffic'],
    category: 'bike'
  },
  {
    id: 'auto',
    name: 'Auto',
    description: 'Comfortable 3-wheeler rides',
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400',
    basePrice: 3.00,
    pricePerKm: 1.20,
    capacity: 3,
    estimatedTime: 8,
    features: ['Affordable', 'Good for short trips'],
    category: 'economy'
  },
  {
    id: 'mini',
    name: 'RideShare Mini',
    description: 'Compact cars for everyday trips',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
    basePrice: 4.50,
    pricePerKm: 1.80,
    capacity: 4,
    estimatedTime: 10,
    features: ['AC', 'Compact', 'Affordable'],
    category: 'economy'
  },
  {
    id: 'sedan',
    name: 'RideShare Go',
    description: 'Comfortable sedans with AC',
    image: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400',
    basePrice: 6.00,
    pricePerKm: 2.20,
    capacity: 4,
    estimatedTime: 12,
    features: ['AC', 'Spacious', 'Comfortable'],
    category: 'comfort'
  },
  {
    id: 'suv',
    name: 'RideShare XL',
    description: 'Spacious SUVs for groups',
    image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400',
    basePrice: 8.50,
    pricePerKm: 3.00,
    capacity: 6,
    estimatedTime: 15,
    features: ['AC', 'Extra space', '6 seats'],
    category: 'comfort'
  },
  {
    id: 'premium',
    name: 'RideShare Premium',
    description: 'Luxury cars for special occasions',
    image: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=400',
    basePrice: 12.00,
    pricePerKm: 4.50,
    capacity: 4,
    estimatedTime: 18,
    features: ['Luxury', 'Premium AC', 'Professional driver'],
    category: 'premium'
  }
];

export function calculateFare(vehicleType: VehicleType, distance: number): number {
  const fare = vehicleType.basePrice + (distance * vehicleType.pricePerKm);
  return Math.round(fare * 100) / 100;
}

export function estimateArrivalTime(vehicleType: VehicleType, distance: number): number {
  const baseTime = vehicleType.estimatedTime;
  const travelTime = Math.ceil((distance / 25) * 60); // 25 km/h average speed
  return baseTime + travelTime;
}

export function getVehiclesByCategory() {
  return {
    bike: VEHICLE_TYPES.filter(v => v.category === 'bike'),
    economy: VEHICLE_TYPES.filter(v => v.category === 'economy'),
    comfort: VEHICLE_TYPES.filter(v => v.category === 'comfort'),
    premium: VEHICLE_TYPES.filter(v => v.category === 'premium')
  };
}