import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Clock, Users, Star } from 'lucide-react-native';
import { VehicleType } from '@/types';
import { VEHICLE_TYPES, calculateFare, estimateArrivalTime } from '@/utils/vehicleService';

interface VehicleSelectorProps {
  distance: number;
  onSelectVehicle: (vehicleType: VehicleType) => void;
  selectedVehicle?: VehicleType;
}

export default function VehicleSelector({ distance, onSelectVehicle, selectedVehicle }: VehicleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bike' | 'economy' | 'comfort' | 'premium'>('all');

  const filteredVehicles = selectedCategory === 'all' 
    ? VEHICLE_TYPES 
    : VEHICLE_TYPES.filter(v => v.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All', icon: '🚗' },
    { id: 'bike', name: 'Bike', icon: '🏍️' },
    { id: 'economy', name: 'Economy', icon: '🚙' },
    { id: 'comfort', name: 'Comfort', icon: '🚗' },
    { id: 'premium', name: 'Premium', icon: '🚘' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a ride</Text>
      
      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id as any)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Vehicle List */}
      <ScrollView style={styles.vehicleList} showsVerticalScrollIndicator={false}>
        {filteredVehicles.map((vehicle) => {
          const fare = calculateFare(vehicle, distance);
          const arrivalTime = estimateArrivalTime(vehicle, distance);
          const isSelected = selectedVehicle?.id === vehicle.id;

          return (
            <TouchableOpacity
              key={vehicle.id}
              style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
              onPress={() => onSelectVehicle(vehicle)}
            >
              <View style={styles.vehicleImageContainer}>
                <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
                {vehicle.category === 'premium' && (
                  <View style={styles.premiumBadge}>
                    <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleHeader}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehiclePrice}>${fare.toFixed(2)}</Text>
                </View>
                
                <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
                
                <View style={styles.vehicleDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{arrivalTime} min</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Users size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{vehicle.capacity}</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {vehicle.features.slice(0, 3).map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <View style={styles.selectedDot} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  vehicleList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  vehicleCardSelected: {
    borderColor: '#2563EB',
    borderWidth: 2,
    backgroundColor: '#EBF5FF',
  },
  vehicleImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  vehiclePrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  vehicleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  featureText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  selectedIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
});