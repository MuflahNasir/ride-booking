import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Linking, Modal } from 'react-native';
import { Car, Phone, MessageCircle, Star, Clock } from 'lucide-react-native';
import { Ride } from '@/types';

interface RideStatusCardProps {
  ride: Ride;
  onUpdateStatus: (status: Ride['status']) => void;
  onRatingSubmitted?: () => void;
}

export default function RideStatusCard({ ride, onUpdateStatus, onRatingSubmitted }: RideStatusCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(ride.estimatedTime);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (ride.status === 'driver_arriving' || ride.status === 'in_progress') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [ride.status]);

  useEffect(() => {
    if (ride.status === 'completed') {
      setShowRating(true);
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

      {/* Real-time ETA and distance */}
      {ride.status !== 'booking' && (
        <View style={styles.realtimeInfo}>
          <View style={styles.realtimeItem}>
            <Clock size={16} color="#10B981" />
            <Text style={styles.realtimeText}>{ride.remainingTime ?? ride.estimatedTime} min</Text>
          </View>
          <View style={styles.realtimeItem}>
            <Car size={16} color="#2563EB" />
            <Text style={styles.realtimeText}>{ride.remainingDistance ?? ride.distance} km</Text>
          </View>
        </View>
      )}

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

      {/* Cancel Button for waiting statuses */}
      {(ride.status === 'booking' || ride.status === 'driver_assigned' || ride.status === 'driver_arriving') && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => onUpdateStatus('cancelled')}>
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}

      {ride.driver && (
        <View style={styles.driverInfo}>
          <View style={styles.driverDetails}>
            {ride.driver.photo && (
              <Image source={{ uri: ride.driver.photo }} style={styles.driverAvatar} />
            )}
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
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                const phone = ride.driver?.phone || '+1234567890';
                Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Unable to open dialer.'));
              }}
            >
              <Phone size={18} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => {
                const phone = ride.driver?.phone || '+1234567890';
                Linking.openURL(`sms:${phone}`).catch(() => Alert.alert('Error', 'Unable to open messaging app.'));
              }}
            >
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

      <Modal visible={showRating} transparent animationType="slide">
        <View style={styles.ratingModalOverlay}>
          <View style={styles.ratingModal}>
            <Text style={styles.ratingTitle}>Rate your driver</Text>
            <View style={styles.ratingStars}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star size={32} color={star <= rating ? '#F59E0B' : '#E5E7EB'} fill={star <= rating ? '#F59E0B' : '#E5E7EB'} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitRatingButton} onPress={() => {
              setShowRating(false);
              if (onRatingSubmitted) {
                onRatingSubmitted();
              }
            }}>
              <Text style={styles.submitRatingText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  realtimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  realtimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  realtimeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 4,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  ratingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 300,
  },
  ratingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  submitRatingButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  submitRatingText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});