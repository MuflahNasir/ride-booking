import { Driver, User } from '@/types';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'John Smith',
    rating: 4.8,
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver',
      plate: 'ABC-123'
    },
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    rating: 4.9,
    vehicle: {
      make: 'Honda',
      model: 'Accord',
      color: 'Blue',
      plate: 'XYZ-789'
    },
    phone: '+1 (555) 987-6543'
  },
  {
    id: '3',
    name: 'Mike Chen',
    rating: 4.7,
    vehicle: {
      make: 'Nissan',
      model: 'Altima',
      color: 'Black',
      plate: 'DEF-456'
    },
    phone: '+1 (555) 456-7890'
  }
];

export const MOCK_USER: User = {
  id: '1',
  name: 'Alex Thompson',
  email: 'alex.thompson@email.com',
  phone: '+1 (555) 234-5678',
  rating: 4.6,
  totalRides: 47
};