// Country Selector Component for Security Alerts
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../../theme';
import { LocationUtils } from '../../utils/locationUtils';

const CountrySelector = ({ onCountryChange, currentCountry }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [countries] = useState(LocationUtils.getSupportedCountries());

  useEffect(() => {
    setSelectedCountry(currentCountry);
  }, [currentCountry]);

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country.code);
    await LocationUtils.setUserCountry(country.code);
    setModalVisible(false);
    if (onCountryChange) {
      onCountryChange(country.code);
    }
  };

  const getCurrentCountryInfo = () => {
    return LocationUtils.getCountryInfo(selectedCountry);
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry === item.code && styles.selectedCountryItem
      ]}
      onPress={() => handleCountrySelect(item)}
    >
      <View style={styles.countryInfo}>
        <Text style={styles.countryFlag}>{item.flag}</Text>
        <View style={styles.countryTexts}>
          <Text style={styles.countryName}>{item.name}</Text>
          <Text style={styles.countrySource}>Source: {item.source}</Text>
        </View>
      </View>
      {selectedCountry === item.code && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={Colors.accent}
        />
      )}
    </TouchableOpacity>
  );

  const currentInfo = getCurrentCountryInfo();

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectorFlag}>{currentInfo?.flag}</Text>
          <View style={styles.selectorTexts}>
            <Text style={styles.selectorTitle}>Security Alerts Region</Text>
            <Text style={styles.selectorSubtitle}>{currentInfo?.name}</Text>
          </View>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Region</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Choose your region to get relevant security alerts
            </Text>
            <FlatList
              data={countries}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              style={styles.countryList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    ...CommonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Responsive.padding.card,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorFlag: {
    fontSize: 24,
    marginRight: Responsive.spacing.md,
  },
  selectorTexts: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  selectorSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Responsive.borderRadius.xlarge,
    borderTopRightRadius: Responsive.borderRadius.xlarge,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Responsive.spacing.sm,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Responsive.padding.card,
    marginHorizontal: Responsive.padding.screen,
    marginVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.large,
    backgroundColor: Colors.surface,
  },
  selectedCountryItem: {
    backgroundColor: Colors.accent + '20',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryFlag: {
    fontSize: 32,
    marginRight: Responsive.spacing.md,
  },
  countryTexts: {
    flex: 1,
  },
  countryName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  countrySource: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default CountrySelector;
