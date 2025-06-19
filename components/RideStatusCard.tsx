import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Car, Phone, MessageCircle, Star, Clock } from 'lucide-react-native';
import { Ride } from '@/types';

interface RideStatusCardProps {
  ride: Ride;
  onUpdateStatus: (status: Ride['status']) => void;
}

export default function RideStatusCard({ ride, onUpdateStatus }: RideStatusCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(ride.estimatedTime);

  useEffect(() => {
    if (ride.status === 'driver_arriving' || ride.status === 'in_progress') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [ride.status]);

  const getStatusInfo = () => {
    switch (ride.status) {
      case 'booking':
        return {
          title: 'Finding a driver...',
          subtitle: `Looking for ${ride.vehicleType.name} drivers nearby`,
          action: () => setTimeout(() => onUpdateStatus('driver_assigned'), 3000),
          actionText: 'Cancel'
        };
      case 'driver_assigned':
        return {
          title: 'Driver assigned!',
          subtitle: `${ride.driver?.name} is coming to pick you up`,
          action: () => onUpdateStatus('driver_arriving'),
          actionText: 'Driver arriving'
        };
      case 'driver_arriving':
        return {
          title: 'Driver is arriving',
          subtitle: `${timeRemaining} min away`,
          action: () => onUpdateStatus('in_progress'),
          actionText: 'Start trip'
        };
      case 'in_progress':
        return {
          title: 'Trip in progress',
          subtitle: `${timeRemaining} min to destination`,
          action: () => onUpdateStatus('completed'),
          actionText: 'Complete trip'
        };
      default:
        return {
          title: 'Unknown status',
          subtitle: '',
          action: () => {},
          actionText: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(ride.status) }]} />
          <Text style={styles.statusTitle}>{statusInfo.title}</Text>
        </View>
        <Text style={styles.pinCode}>PIN: {ride.pinCode}</Text>
      </View>

      <Text style={styles.subtitle}>{statusInfo.subtitle}</Text>

      {/* Vehicle Type Info */}
      <View style={styles.vehicleTypeInfo}>
        <Image source={{ uri: ride.vehicleType.image }} style={styles.vehicleTypeImage} />
        <View style={styles.vehicleTypeDetails}>
          <Text style={styles.vehicleTypeName}>{ride.vehicleType.name}</Text>
          <Text style={styles.vehicleTypeDescription}>{ride.vehicleType.description}</Text>
        </View>
        <Text style={styles.vehicleTypePrice}>${ride.estimatedPrice.toFixed(2)}</Text>
      </View>

      {ride.driver && (
        <View style={styles.driverInfo}>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{ride.driver.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{ride.driver.rating}</Text>
            </View>
          </View>
          <Text style={styles.vehicleInfo}>
            {ride.driver.vehicle.color} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
          </Text>
          <Text style={styles.plateNumber}>{ride.driver.vehicle.plate}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.callButton}>
              <Phone size={18} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <MessageCircle size={18} color="#2563EB" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.routeInfo}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>{ride.pickup.address}</Text>
        </View>
        <View style={styles.locationLine} />
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.destinationDot]} />
          <Text style={styles.locationText}>{ride.destination.address}</Text>
        </View>
      </View>
    </View>
  );
}

function getStatusColor(status: Ride['status']): string {
  switch (status) {
    case 'booking': return '#F59E0B';
    case 'driver_assigned': return '#2563EB';
    case 'driver_arriving': return '#EA580C';
    case 'in_progress': return '#10B981';
    case 'completed': return '#10B981';
    default: return '#6B7280';
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  pinCode: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  vehicleTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  vehicleTypeImage: {
    width: 50,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  vehicleTypeDetails: {
    flex: 1,
  },
  vehicleTypeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  vehicleTypeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  vehicleTypePrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  driverInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  driverDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 4,
  },
  vehicleInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  plateNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
  },
  messageButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  routeInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#EF4444',
  },
  locationLine: {
    width: 1,
    height: 20,
    backgroundColor: '#D1D5DB',
    marginLeft: 4,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
  },
});