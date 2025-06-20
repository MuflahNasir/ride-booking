import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Location } from '@/types';
import { POPULAR_LOCATIONS } from '@/utils/locationService';

interface LocationInputProps {
  label: string;
  value: Location | null;
  onSelect: (location: Location) => void;
  placeholder: string;
}

export default function LocationInput({ label, value, onSelect, placeholder }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [showDropdown, setShowDropdown] = useState(false);

  // For web platform, use a simplified input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.webInputContainer}>
          <MapPin size={20} color="#6B7280" style={styles.icon} />
          <Text style={[styles.webInput, !value && styles.placeholder]}>
            {value ? value.address : placeholder}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MapPin size={20} color="#6B7280" style={styles.icon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={inputValue}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onChangeText={setInputValue}
        />
      </View>
      {showDropdown && (
        <FlatList
          data={POPULAR_LOCATIONS.filter(loc =>
            loc.address.toLowerCase().includes(inputValue.toLowerCase())
          )}
          keyExtractor={item => item.address}
          style={styles.listView}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                setInputValue(item.address);
                setShowDropdown(false);
                onSelect(item);
              }}
            >
              <Text style={styles.description}>{item.address}</Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 2,
  },
  webInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  webInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginLeft: 12,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    height: 48,
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: 200,
  },
  row: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
});