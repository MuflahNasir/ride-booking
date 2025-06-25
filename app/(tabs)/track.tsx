import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MapPin, Navigation, Clock, Phone, Maximize2, Minimize2 } from 'lucide-react-native';
import MapView from '@/components/MapView';
import { useRide } from '@/contexts/RideContext';
import { Ride } from '@/types';

export default function TrackScreen() {
  const [pinCode, setPinCode] = useState('');
  const [trackingRide, setTrackingRide] = useState<Ride | null>(null);
  const { currentRide, rideHistory, driverLocation } = useRide();
  // If tracking the current ride, always use the latest currentRide for live updates
  const liveTrackingRide = trackingRide && currentRide && trackingRide.id === currentRide.id ? currentRide : trackingRide;
  const isLiveTracking = !!liveTrackingRide && (liveTrackingRide.status === 'driver_arriving' || liveTrackingRide.status === 'in_progress');
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const insets = useSafeAreaInsets();

  const handleTrackRide = () => {
    if (!pinCode.trim()) {
      Alert.alert('Error', 'Please enter a PIN code');
      return;
    }

    // Check current ride
    if (currentRide && currentRide.pinCode === pinCode.toUpperCase()) {
      setTrackingRide(currentRide);
      return;
    }

    // Check ride history
    const historicalRide = rideHistory.find(ride => ride.pinCode === pinCode.toUpperCase());
    if (historicalRide) {
      setTrackingRide(historicalRide);
      return;
    }

    Alert.alert('Not Found', 'No ride found with this PIN code');
  };

  const clearTracking = () => {
    setTrackingRide(null);
    setPinCode('');
  };

  if (liveTrackingRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={isMapMaximized ? styles.mapFullScreen : styles.mapContainer}>
          <MapView 
            pickup={liveTrackingRide.pickup}
            destination={liveTrackingRide.destination}
            driverLocation={driverLocation || (liveTrackingRide.driver ? liveTrackingRide.pickup : undefined)}
            showRoute={true}
            isTracking={isLiveTracking}
          />
          <TouchableOpacity
            style={[
              styles.maximizeButton,
              isMapMaximized
                ? { top: insets.top + 12, right: 16, bottom: undefined }
                : { bottom: insets.bottom + 24, right: 16, top: undefined }
            ]}
            onPress={() => setIsMapMaximized(!isMapMaximized)}
          >
            {isMapMaximized ? (
              <Minimize2 size={24} color="#2563EB" />
            ) : (
              <Maximize2 size={24} color="#2563EB" />
            )}
          </TouchableOpacity>
        </View>
        {!isMapMaximized && (
          <>
            <View style={styles.trackingHeader}>
              <View style={styles.trackingTitleContainer}>
                <Text style={styles.trackingTitle}>
                  {isLiveTracking ? 'Live Tracking' : 'Ride Details'}
                </Text>
                {isLiveTracking && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={clearTracking} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.trackingInfo}>
                <View style={styles.statusContainer}>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(liveTrackingRide.status) }]} />
                    <Text style={styles.statusText}>{getStatusText(liveTrackingRide.status)}</Text>
                  </View>
                  {isLiveTracking && (
                    <View style={styles.etaContainer}>
                      <Clock size={16} color="#10B981" />
                      <Text style={styles.etaText}>{(liveTrackingRide.remainingTime ?? liveTrackingRide.estimatedTime)} min</Text>
                      <Text style={styles.etaText}> | {(liveTrackingRide.remainingDistance ?? liveTrackingRide.distance)} km</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.routeDetails}>
                  <View style={styles.locationRow}>
                    <View style={styles.pickupDot} />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationLabel}>Pickup</Text>
                      <Text style={styles.locationText}>{liveTrackingRide.pickup.address}</Text>
                    </View>
                  </View>
                  <View style={styles.locationLine} />
                  <View style={styles.locationRow}>
                    <View style={styles.destinationDot} />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationLabel}>Destination</Text>
                      <Text style={styles.locationText}>{liveTrackingRide.destination.address}</Text>
                    </View>
                  </View>
                </View>
                
                {liveTrackingRide.driver && (
                  <View style={styles.driverCard}>
                    <View style={styles.driverHeader}>
                      <View style={styles.driverInfo}>
                        {liveTrackingRide.driver.photo && (
                          <Image source={{ uri: liveTrackingRide.driver.photo }} style={styles.driverAvatar} />
                        )}
                        <Text style={styles.driverName}>{liveTrackingRide.driver.name}</Text>
                        <Text style={styles.vehicleInfo}>
                          {liveTrackingRide.driver.vehicle.color} {liveTrackingRide.driver.vehicle.make} {liveTrackingRide.driver.vehicle.model}
                        </Text>
                        <Text style={styles.plateNumber}>{liveTrackingRide.driver.vehicle.plate}</Text>
                      </View>
                      <View style={styles.driverActions}>
                        <TouchableOpacity style={styles.callButton}>
                          <Phone size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navigateButton}>
                          <Navigation size={18} color="#2563EB" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.tripDetails}>
                      <View style={styles.tripDetailItem}>
                        <Text style={styles.tripDetailLabel}>Distance</Text>
                        <Text style={styles.tripDetailValue}>{liveTrackingRide.distance.toFixed(1)} km</Text>
                      </View>
                      <View style={styles.tripDetailItem}>
                        <Text style={styles.tripDetailLabel}>Fare</Text>
                        <Text style={styles.tripDetailValue}>
                          ${(liveTrackingRide.actualPrice || liveTrackingRide.estimatedPrice).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.tripDetailItem}>
                        <Text style={styles.tripDetailLabel}>PIN</Text>
                        <Text style={styles.tripDetailValue}>{liveTrackingRide.pinCode}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track a Ride</Text>
        <Text style={styles.subtitle}>Enter a PIN code to track any ride in real-time</Text>
      </View>

      <View style={styles.trackingForm}>
        <View style={styles.pinInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.pinInput}
            placeholder="Enter PIN code (e.g., ABC123)"
            value={pinCode}
            onChangeText={setPinCode}
            autoCapitalize="characters"
            maxLength={6}
          />
        </View>
        
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackRide}>
          <MapPin size={20} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>Track Ride</Text>
        </TouchableOpacity>
      </View>

      {currentRide && (
        <View style={styles.currentRideSection}>
          <Text style={styles.sectionTitle}>Your Current Ride</Text>
          <TouchableOpacity 
            style={styles.currentRideCard}
            onPress={() => setTrackingRide(currentRide)}
          >
            <View style={styles.currentRideHeader}>
              <View style={styles.currentRideStatus}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(currentRide.status) }]} />
                <Text style={styles.currentRideStatusText}>
                  {getStatusText(currentRide.status)}
                </Text>
              </View>
              <Text style={styles.currentRidePin}>PIN: {currentRide.pinCode}</Text>
            </View>
            <Text style={styles.currentRideRoute}>
              {currentRide.pickup.address} → {currentRide.destination.address}
            </Text>
            <View style={styles.currentRideFooter}>
              <Text style={styles.currentRideVehicle}>{currentRide.vehicleType.name}</Text>
              <Text style={styles.currentRidePrice}>
                ${currentRide.estimatedPrice.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Get a PIN code when booking a ride</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Share the PIN with friends and family</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Track the ride in real-time with live updates</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'booking': return '#F59E0B';
    case 'driver_assigned': return '#2563EB';
    case 'driver_arriving': return '#EA580C';
    case 'in_progress': return '#10B981';
    case 'completed': return '#10B981';
    default: return '#6B7280';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'booking': return 'Finding Driver';
    case 'driver_assigned': return 'Driver Assigned';
    case 'driver_arriving': return 'Driver Arriving';
    case 'in_progress': return 'Trip in Progress';
    case 'completed': return 'Trip Completed';
    default: return 'Unknown';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  trackingForm: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  trackingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginRight: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3F2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  trackingInfo: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    marginTop: -16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  etaText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 4,
  },
  routeDetails: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
    marginTop: 4,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 12,
    marginTop: 4,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: '#D1D5DB',
    marginLeft: 5,
    marginVertical: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  driverCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
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
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 10,
  },
  navigateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripDetailItem: {
    alignItems: 'center',
  },
  tripDetailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  tripDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  currentRideSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  currentRideCard: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  currentRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentRideStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentRideStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  currentRidePin: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentRideRoute: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 12,
  },
  currentRideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentRideVehicle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  currentRidePrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  howItWorks: {
    paddingHorizontal: 20,
  },
  stepContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  mapFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  mapContainer: {
    height: 250,
    width: '100%',
  },
  maximizeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    zIndex: 20,
  },
});