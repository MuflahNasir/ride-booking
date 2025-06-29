import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, Clock, DollarSign, MapPin, Maximize2, Minimize2 } from 'lucide-react-native';
import LocationInput from '@/components/LocationInput';
import MapView from '@/components/MapView';
import VehicleSelector from '@/components/VehicleSelector';
import RideStatusCard from '@/components/RideStatusCard';
import { useRide } from '@/contexts/RideContext';
import { Location, Ride, VehicleType } from '@/types';
import { calculateDistance, generatePinCode } from '@/utils/locationService';
import { calculateFare, estimateArrivalTime } from '@/utils/vehicleService';
import { MOCK_DRIVERS } from '@/utils/mockData';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function HomeScreen() {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const { currentRide, updateRideStatus, startSimulation, driverLocation, clearCurrentRide } = useRide();
  const prevRideRef = useRef(currentRide);
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const insets = useSafeAreaInsets();

  const distance = pickup && destination ? calculateDistance(pickup, destination) : 0;

  const handleLocationSet = () => {
    if (pickup && destination) {
      setShowVehicleSelector(true);
    }
  };

  const handleVehicleSelect = (vehicleType: VehicleType) => {
    setSelectedVehicle(vehicleType);
  };

  const handleBookRide = () => {
    if (!pickup || !destination || !selectedVehicle) {
      Alert.alert('Error', 'Please select pickup location, destination, and vehicle type');
      return;
    }

    const estimatedPrice = calculateFare(selectedVehicle, distance);
    const estimatedTime = estimateArrivalTime(selectedVehicle, distance);
    const pinCode = generatePinCode();

    const newRide: Ride = {
      id: Date.now().toString(),
      pickup,
      destination,
      vehicleType: selectedVehicle,
      status: 'booking',
      estimatedTime,
      estimatedPrice,
      pinCode,
      createdAt: new Date(),
      distance,
    };

    setShowVehicleSelector(false);
    startSimulation(newRide);
  };

  const resetBooking = () => {
    setPickup(null);
    setDestination(null);
    setSelectedVehicle(null);
    setShowVehicleSelector(false);
  };

  useEffect(() => {
    if (prevRideRef.current && !currentRide) {
      // Ride just completed or cancelled
      setPickup(null);
      setDestination(null);
      setSelectedVehicle(null);
      setShowVehicleSelector(false);
    }
    prevRideRef.current = currentRide;
  }, [currentRide]);

  if (currentRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={isMapMaximized ? styles.mapFullScreen : styles.mapContainer}>
          <MapView 
            pickup={currentRide.pickup}
            destination={currentRide.destination}
            driverLocation={driverLocation || undefined}
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
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <RideStatusCard ride={currentRide} onUpdateStatus={updateRideStatus} onRatingSubmitted={clearCurrentRide} />
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView style={styles.scrollView} enableOnAndroid={true} extraScrollHeight={100}>
        <View style={styles.header}>
          <Text style={styles.title}>Book a Ride</Text>
          <Text style={styles.subtitle}>Where would you like to go?</Text>
        </View>

        <View style={styles.locationInputs}>
          <LocationInput
            label="Pickup Location"
            value={pickup}
            onSelect={(location) => {
              setPickup(location);
              handleLocationSet();
            }}
            placeholder="Enter pickup location"
          />
          <View style={{ height: 8 }} />
          <LocationInput
            label="Destination"
            value={destination}
            onSelect={(location) => {
              setDestination(location);
              handleLocationSet();
            }}
            placeholder="Where to?"
          />
        </View>

        {pickup && destination && !showVehicleSelector && (
          <View style={styles.ridePreview}>
            <Text style={styles.previewTitle}>Trip Details</Text>
            
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <MapPin size={20} color="#2563EB" />
                <Text style={styles.previewLabel}>Distance</Text>
                <Text style={styles.previewValue}>{distance.toFixed(1)} km</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.selectVehicleButton}
                onPress={() => setShowVehicleSelector(true)}
              >
                <Car size={20} color="#FFFFFF" />
                <Text style={styles.selectVehicleText}>
                  {selectedVehicle ? `${selectedVehicle.name} Selected` : 'Select Vehicle Type'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedVehicle && !showVehicleSelector && (
          <View style={styles.selectedVehicleCard}>
            <View style={styles.selectedVehicleHeader}>
              <Text style={styles.selectedVehicleName}>{selectedVehicle.name}</Text>
              <Text style={styles.selectedVehiclePrice}>
                ${calculateFare(selectedVehicle, distance).toFixed(2)}
              </Text>
            </View>
            <Text style={styles.selectedVehicleDescription}>{selectedVehicle.description}</Text>
            <View style={styles.selectedVehicleDetails}>
              <View style={styles.detailItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {estimateArrivalTime(selectedVehicle, distance)} min
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.changeVehicleButton}
                onPress={() => setShowVehicleSelector(true)}
              >
                <Text style={styles.changeVehicleText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>

      {showVehicleSelector && pickup && destination && (
        <VehicleSelector
          distance={distance}
          onSelectVehicle={handleVehicleSelect}
          selectedVehicle={selectedVehicle ?? undefined}
        />
      )}

      {selectedVehicle && !showVehicleSelector && (
        <View style={styles.bookingSection}>
          <View style={styles.bookingActions}>
            <TouchableOpacity style={styles.resetButton} onPress={resetBooking}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookButton} onPress={handleBookRide}>
              <Text style={styles.bookButtonText}>Book Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showVehicleSelector && (
        <View style={styles.vehicleSelectorActions}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowVehicleSelector(false)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          {selectedVehicle && (
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => setShowVehicleSelector(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  locationInputs: {
    paddingHorizontal: 20,
    marginBottom: 24,
    position: 'relative',
    minHeight: 200,
  },
  ridePreview: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 12,
  },
  previewValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  selectVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
  },
  selectVehicleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  selectedVehicleCard: {
    marginHorizontal: 20,
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 24,
  },
  selectedVehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedVehicleName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
  },
  selectedVehiclePrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
  },
  selectedVehicleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 12,
  },
  selectedVehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  changeVehicleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  changeVehicleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  bookingSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#374151',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  bookButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  vehicleSelectorActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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