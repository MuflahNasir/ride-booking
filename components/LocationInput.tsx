import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MapPin } from 'lucide-react-native';
import { Location } from '@/types';

interface LocationInputProps {
  label: string;
  value: Location | null;
  onSelect: (location: Location) => void;
  placeholder: string;
}

export default function LocationInput({ label, value, onSelect, placeholder }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value?.address || '');
  const ref = useRef<any>(null);

  const handlePlaceSelect = (data: any, details: any) => {
    if (details) {
      const location: Location = {
        address: details.formatted_address || data.description,
        coordinates: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        },
      };
      onSelect(location);
      setInputValue(location.address);
    }
  };

  // For web platform, use a simplified input since Google Places might not work
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
        <GooglePlacesAutocomplete
          ref={ref}
          placeholder={placeholder}
          onPress={handlePlaceSelect}
          query={{
            key: 'AIzaSyCtMaqd4AQayEx4-QTbuM_uL91pQrUsbK8', // Replace with your API key
            language: 'en',
            types: 'geocode',
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            listView: styles.listView,
            row: styles.row,
            description: styles.description,
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          debounce={300}
          textInputProps={{
            value: inputValue,
            onChangeText: setInputValue,
          }}
        />
      </View>
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
  autocompleteContainer: {
    flex: 0,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
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