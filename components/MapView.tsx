import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Platform, Dimensions, Image } from 'react-native';
import { Location } from '@/types';

interface MapViewProps {
  pickup?: Location;
  destination?: Location;
  driverLocation?: Location;
  showRoute?: boolean;
  isTracking?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function MapView({ 
  pickup, 
  destination, 
  driverLocation, 
  showRoute = true,
  isTracking = false 
}: MapViewProps) {
  const [driverPosition, setDriverPosition] = useState(driverLocation);
  const animationRef = useRef<NodeJS.Timeout>();

  // Simulate driver movement when tracking
  useEffect(() => {
    if (isTracking && pickup && destination && driverLocation) {
      const animateDriver = () => {
        setDriverPosition(prev => {
          if (!prev || !destination) return prev;
          
          // Simple animation towards destination
          const latDiff = destination.coordinates.latitude - prev.coordinates.latitude;
          const lngDiff = destination.coordinates.longitude - prev.coordinates.longitude;
          
          return {
            ...prev,
            coordinates: {
              latitude: prev.coordinates.latitude + latDiff * 0.02,
              longitude: prev.coordinates.longitude + lngDiff * 0.02,
            }
          };
        });
      };

      animationRef.current = setInterval(animateDriver, 2000);
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [isTracking, pickup, destination, driverLocation]);

  // For web platform, show a styled map simulation
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webMap}>
          {/* Map background with grid pattern */}
          <View style={styles.mapGrid} />
          
          {/* Street lines */}
          <View style={[styles.street, styles.horizontalStreet1]} />
          <View style={[styles.street, styles.horizontalStreet2]} />
          <View style={[styles.street, styles.verticalStreet1]} />
          <View style={[styles.street, styles.verticalStreet2]} />
          
          {/* Pickup marker */}
          {pickup && (
            <View style={[styles.marker, styles.pickupMarker]}>
              <View style={styles.markerInner} />
            </View>
          )}
          
          {/* Destination marker */}
          {destination && (
            <View style={[styles.marker, styles.destinationMarker]}>
              <View style={styles.markerInner} />
            </View>
          )}
          
          {/* Driver/Car marker */}
          {(driverPosition || driverLocation) && (
            <View style={[styles.marker, styles.driverMarker]}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                style={styles.carIcon}
              />
            </View>
          )}
          
          {/* Route line */}
          {showRoute && pickup && destination && (
            <View style={styles.routeLine} />
          )}
          
          {/* Animated route for tracking */}
          {isTracking && (
            <View style={styles.trackingRoute} />
          )}
        </View>
      </View>
    );
  }

  // For native platforms, you would use react-native-maps here
  return (
    <View style={styles.container}>
      <View style={styles.nativeMapPlaceholder}>
        {/* This would be replaced with actual MapView from react-native-maps */}
        <View style={styles.mapGrid} />
        
        {pickup && (
          <View style={[styles.marker, styles.pickupMarker]}>
            <View style={styles.markerInner} />
          </View>
        )}
        
        {destination && (
          <View style={[styles.marker, styles.destinationMarker]}>
            <View style={styles.markerInner} />
          </View>
        )}
        
        {(driverPosition || driverLocation) && (
          <View style={[styles.marker, styles.driverMarker]}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=100' }}
              style={styles.carIcon}
            />
          </View>
        )}
        
        {showRoute && pickup && destination && (
          <View style={styles.routeLine} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  webMap: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8F4FD',
    overflow: 'hidden',
  },
  nativeMapPlaceholder: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8F4FD',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F4FD',
    opacity: 0.3,
  },
  street: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  horizontalStreet1: {
    top: '30%',
    left: 0,
    right: 0,
    height: 4,
  },
  horizontalStreet2: {
    top: '70%',
    left: 0,
    right: 0,
    height: 4,
  },
  verticalStreet1: {
    left: '25%',
    top: 0,
    bottom: 0,
    width: 4,
  },
  verticalStreet2: {
    left: '75%',
    top: 0,
    bottom: 0,
    width: 4,
  },
  marker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  pickupMarker: {
    backgroundColor: '#10B981',
    top: '25%',
    left: '20%',
  },
  destinationMarker: {
    backgroundColor: '#EF4444',
    bottom: '25%',
    right: '20%',
  },
  driverMarker: {
    backgroundColor: '#2563EB',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  carIcon: {
    width: 32,
    height: 24,
    borderRadius: 4,
    resizeMode: 'cover',
  },
  routeLine: {
    position: 'absolute',
    top: '30%',
    left: '25%',
    right: '25%',
    bottom: '30%',
    borderWidth: 3,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 50,
    transform: [{ rotate: '45deg' }],
    opacity: 0.7,
  },
  trackingRoute: {
    position: 'absolute',
    top: '30%',
    left: '25%',
    right: '25%',
    bottom: '30%',
    borderWidth: 4,
    borderColor: '#10B981',
    borderRadius: 50,
    transform: [{ rotate: '45deg' }],
    opacity: 0.8,
  },
});