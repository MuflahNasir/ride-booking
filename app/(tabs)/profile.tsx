import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Star, Phone, Mail, MapPin, Settings, CreditCard, Bell, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { useRide } from '@/contexts/RideContext';
import { MOCK_USER } from '@/utils/mockData';

export default function ProfileScreen() {
  const { rideHistory } = useRide();

  const menuItems = [
    { icon: Settings, label: 'Account Settings', color: '#6B7280' },
    { icon: CreditCard, label: 'Payment Methods', color: '#6B7280' },
    { icon: Bell, label: 'Notifications', color: '#6B7280' },
    { icon: HelpCircle, label: 'Help & Support', color: '#6B7280' },
    { icon: LogOut, label: 'Sign Out', color: '#EF4444' },
  ];

  const completedRides = rideHistory.filter(ride => ride.status === 'completed').length;
  const totalSpent = rideHistory.reduce((sum, ride) => sum + (ride.actualPrice || ride.estimatedPrice), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#FFFFFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{MOCK_USER.name}</Text>
            <View style={styles.userRating}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{MOCK_USER.rating} rating</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactItem}>
            <Phone size={20} color="#6B7280" />
            <Text style={styles.contactText}>{MOCK_USER.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Mail size={20} color="#6B7280" />
            <Text style={styles.contactText}>{MOCK_USER.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MapPin size={24} color="#2563EB" />
              <Text style={styles.statValue}>{completedRides}</Text>
              <Text style={styles.statLabel}>Completed Rides</Text>
            </View>
            <View style={styles.statCard}>
              <CreditCard size={24} color="#10B981" />
              <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <item.icon size={20} color={item.color} />
                <Text style={[styles.menuItemText, { color: item.color }]}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  userRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 6,
  },
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 12,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  menuItemRight: {
    opacity: 0.5,
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});