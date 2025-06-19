import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Clock, DollarSign, Star } from 'lucide-react-native';
import { useRide } from '@/contexts/RideContext';
import { Ride } from '@/types';

export default function HistoryScreen() {
  const { rideHistory } = useRide();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (ride: Ride) => {
    if (!ride.completedAt) return 'N/A';
    const duration = Math.floor((ride.completedAt.getTime() - ride.createdAt.getTime()) / (1000 * 60));
    return `${duration} min`;
  };

  const renderRideItem = ({ item: ride }: { item: Ride }) => (
    <TouchableOpacity style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(ride.status) }]} />
          <Text style={styles.rideStatus}>{getStatusText(ride.status)}</Text>
        </View>
        <Text style={styles.rideDate}>{formatDate(ride.createdAt)}</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <View style={styles.pickupDot} />
          <Text style={styles.locationText} numberOfLines={1}>{ride.pickup.address}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.locationRow}>
          <View style={styles.destinationDot} />
          <Text style={styles.locationText} numberOfLines={1}>{ride.destination.address}</Text>
        </View>
      </View>

      <View style={styles.rideDetails}>
        <View style={styles.detailItem}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.detailText}>{formatDuration(ride)}</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>{ride.distance.toFixed(1)} km</Text>
        </View>
        <View style={styles.detailItem}>
          <DollarSign size={16} color="#6B7280" />
          <Text style={styles.detailText}>${(ride.actualPrice || ride.estimatedPrice).toFixed(2)}</Text>
        </View>
      </View>

      {ride.driver && (
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{ride.driver.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.driverRating}>{ride.driver.rating}</Text>
          </View>
        </View>
      )}

      <View style={styles.pinCodeContainer}>
        <Text style={styles.pinCodeLabel}>PIN:</Text>
        <Text style={styles.pinCode}>{ride.pinCode}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Calendar size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No rides yet</Text>
      <Text style={styles.emptySubtitle}>Your ride history will appear here once you complete your first trip.</Text>
    </View>
  );

  const totalSpent = rideHistory.reduce((sum, ride) => sum + (ride.actualPrice || ride.estimatedPrice), 0);
  const totalRides = rideHistory.length;
  const averageRating = rideHistory.filter(r => r.driver).reduce((sum, ride) => sum + (ride.driver?.rating || 0), 0) / rideHistory.filter(r => r.driver).length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <Text style={styles.subtitle}>Track all your completed trips</Text>
      </View>

      {totalRides > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRides}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      )}

      <FlatList
        data={rideHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderRideItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  rideStatus: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  rideDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  routeContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 10,
  },
  destinationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 10,
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginLeft: 3,
    marginVertical: 2,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverRating: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 4,
  },
  pinCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  pinCodeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginRight: 4,
  },
  pinCode: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#374151',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
});