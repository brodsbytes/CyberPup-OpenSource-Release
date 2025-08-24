import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { SCREEN_NAMES } from '../constants';

// Device hierarchy configuration
const DEVICE_HIERARCHY = {
  mobile: {
    apple: {
      name: 'Apple (iPhone, iPad)',
      icon: 'phone-portrait',
      models: ['iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPad Pro', 'iPad Air', 'iPad', 'Other iPhone', 'Other iPad']
    },
    android: {
      name: 'Android (Samsung, Pixel, etc)',
      icon: 'phone-portrait',
      models: ['Samsung Galaxy S24', 'Samsung Galaxy S23', 'Google Pixel 8', 'Google Pixel 7', 'OnePlus', 'Other Android Phone', 'Android Tablet']
    }
  },
  computer: {
    macos: {
      name: 'macOS (MacBook, iMac, etc)',
      icon: 'laptop',
      types: {
        macbook: ['MacBook Air M3', 'MacBook Air M2', 'MacBook Pro 14"', 'MacBook Pro 16"', 'Other MacBook'],
        'mac-mini': ['Mac mini M3', 'Mac mini M2', 'Other Mac mini'],
        imac: ['iMac 24" M3', 'iMac 24" M1', 'Other iMac']
      }
    },
    windows: {
      name: 'Windows (HP, Dell, Lenovo, etc)',
      icon: 'laptop',
      versions: {
        'windows-11': ['Windows 11 Home', 'Windows 11 Pro'],
        'windows-10': ['Windows 10 Home', 'Windows 10 Pro']
      }
    }
  }
};

const DeviceAuditScreen = ({ navigation, route }) => {
  const [devices, setDevices] = useState([]);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  
  // Hierarchical device selection state
  const [selectedTier1, setSelectedTier1] = useState(null); // 'mobile' or 'computer'
  const [selectedTier2, setSelectedTier2] = useState(null); // platform/brand
  const [selectedTier3, setSelectedTier3] = useState(null); // model/version
  const [customDeviceName, setCustomDeviceName] = useState('');
  
  // Device removal confirmation state
  const [deviceToRemove, setDeviceToRemove] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

  // Check if this is coming from initial onboarding or profile
  useEffect(() => {
    const fromProfile = route?.params?.fromProfile || false;
    setIsFirstTime(!fromProfile);
    loadDevices();
    
    // Auto-detect current device if first time
    if (!fromProfile) {
      autoDetectCurrentDevice();
    }
  }, [route]);

  const autoDetectCurrentDevice = () => {
    try {
      const { width, height } = Dimensions.get('window');
      const isTablet = Math.min(width, height) >= 768;
      
      let deviceName = '';
      let deviceType = 'mobile';

      if (Platform.OS === 'ios') {
        if (isTablet) {
          deviceName = 'iPad';
          deviceType = 'mobile'; // iPad is still considered mobile for our purposes
        } else {
          deviceName = 'iPhone';
          deviceType = 'mobile';
        }
      } else if (Platform.OS === 'android') {
        if (isTablet) {
          deviceName = 'Android Tablet';
          deviceType = 'mobile';
        } else {
          deviceName = 'Android Phone';
          deviceType = 'mobile';
        }
      } else {
        deviceName = 'Computer';
        deviceType = 'computer';
      }

      // Only auto-add if we're confident about the detection (mobile devices)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const autoDetectedDevice = {
          id: Date.now().toString(),
          name: deviceName,
          type: deviceType,
          autoDetected: true,
        };
        setDevices([autoDetectedDevice]);
      }
    } catch (error) {
      console.log('Error auto-detecting device:', error);
    }
  };

  const loadDevices = async () => {
    try {
      const savedDevices = await AsyncStorage.getItem('user_devices');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
      }
    } catch (error) {
      console.log('Error loading devices:', error);
    }
  };

  const saveDevices = async (deviceList) => {
    try {
      await AsyncStorage.setItem('user_devices', JSON.stringify(deviceList));
      await AsyncStorage.setItem('device_audit_completed', 'true');
    } catch (error) {
      console.log('Error saving devices:', error);
    }
  };

  const addDevice = () => {
    // Generate device name based on selections
    let deviceName = '';
    let deviceType = selectedTier1;
    
    if (customDeviceName.trim()) {
      deviceName = customDeviceName.trim();
    } else if (selectedTier3) {
      deviceName = selectedTier3;
    } else if (selectedTier2) {
      deviceName = DEVICE_HIERARCHY[selectedTier1][selectedTier2].name;
    } else if (selectedTier1) {
      deviceName = selectedTier1 === 'mobile' ? 'Mobile Device' : 'Computer';
    }
    
    if (deviceName && selectedTier1) {
      const newDevice = {
        id: Date.now().toString(),
        name: deviceName,
        type: deviceType,
        tier1: selectedTier1,
        tier2: selectedTier2,
        tier3: selectedTier3,
        autoDetected: false,
      };
      const updatedDevices = [...devices, newDevice];
      setDevices(updatedDevices);
      saveDevices(updatedDevices);
      resetSelections();
      setIsAddingDevice(false);
    }
  };

  const resetSelections = () => {
    setSelectedTier1(null);
    setSelectedTier2(null);
    setSelectedTier3(null);
    setCustomDeviceName('');
  };

  const removeDevice = (deviceId) => {
    const deviceToDelete = devices.find(device => device.id === deviceId);
    setDeviceToRemove(deviceToDelete);
    setShowRemoveConfirmation(true);
  };

  const confirmRemoveDevice = async () => {
    if (deviceToRemove) {
      console.log('Removing device:', deviceToRemove.name);
      const updatedDevices = devices.filter(device => device.id !== deviceToRemove.id);
      setDevices(updatedDevices);
      await saveDevices(updatedDevices);
      console.log('Device removal completed');
    }
    setShowRemoveConfirmation(false);
    setDeviceToRemove(null);
  };

  const cancelRemoveDevice = () => {
    setShowRemoveConfirmation(false);
    setDeviceToRemove(null);
  };

  const handleContinue = async () => {
    await saveDevices(devices);
    
    if (isFirstTime) {
      // Continue to Level 1 checks
      navigation.replace(SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS);
    } else {
      // Return to profile
      navigation.goBack();
    }
  };

  const renderHierarchicalSelector = () => {
    const isDeviceNameReady = () => {
      return customDeviceName.trim() || selectedTier3 || selectedTier2 || selectedTier1;
    };

    return (
      <View style={styles.hierarchicalSelector}>
        {/* Tier 1: Device Type */}
        <View style={styles.selectorTier}>
          <Text style={styles.tierTitle}>Device Type</Text>
          <View style={styles.tierOptions}>
            <TouchableOpacity
              style={[
                styles.tierOption,
                selectedTier1 === 'mobile' && styles.tierOptionActive,
              ]}
              onPress={() => {
                setSelectedTier1('mobile');
                setSelectedTier2(null);
                setSelectedTier3(null);
              }}
            >
              <Ionicons 
                name="phone-portrait" 
                size={Responsive.iconSizes.medium} 
                color={selectedTier1 === 'mobile' ? Colors.accent : Colors.textSecondary} 
              />
              <Text style={[
                styles.tierOptionText,
                selectedTier1 === 'mobile' && styles.tierOptionTextActive,
              ]}>
                Mobile Device
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tierOption,
                selectedTier1 === 'computer' && styles.tierOptionActive,
              ]}
              onPress={() => {
                setSelectedTier1('computer');
                setSelectedTier2(null);
                setSelectedTier3(null);
              }}
            >
              <Ionicons 
                name="laptop" 
                size={Responsive.iconSizes.medium} 
                color={selectedTier1 === 'computer' ? Colors.accent : Colors.textSecondary} 
              />
              <Text style={[
                styles.tierOptionText,
                selectedTier1 === 'computer' && styles.tierOptionTextActive,
              ]}>
                Computer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tier 2: Platform/Brand */}
        {selectedTier1 && (
          <View style={styles.selectorTier}>
            <Text style={styles.tierTitle}>
              {selectedTier1 === 'mobile' ? 'Platform' : 'Operating System'}
            </Text>
            <View style={styles.tierOptionsList}>
              {Object.keys(DEVICE_HIERARCHY[selectedTier1]).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.listOption,
                    selectedTier2 === key && styles.listOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedTier2(key);
                    setSelectedTier3(null);
                  }}
                >
                  <Text style={[
                    styles.listOptionText,
                    selectedTier2 === key && styles.listOptionTextActive,
                  ]}>
                    {DEVICE_HIERARCHY[selectedTier1][key].name}
                  </Text>
                  <Ionicons 
                    name={selectedTier2 === key ? "checkmark-circle" : "radio-button-off"} 
                    size={Responsive.iconSizes.medium} 
                    color={selectedTier2 === key ? Colors.accent : Colors.textSecondary} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tier 3: Model/Version */}
        {selectedTier2 && (
          <View style={styles.selectorTier}>
            <Text style={styles.tierTitle}>
              {selectedTier1 === 'mobile' ? 'Model (Optional)' : 'Version/Model (Optional)'}
            </Text>
            <View style={styles.tierOptionsList}>
              {(() => {
                const tier2Data = DEVICE_HIERARCHY[selectedTier1][selectedTier2];
                let options = [];
                
                if (selectedTier1 === 'mobile') {
                  options = tier2Data.models;
                } else if (selectedTier1 === 'computer') {
                  if (selectedTier2 === 'macos') {
                    // For macOS, show device types first
                    options = Object.keys(tier2Data.types).map(type => 
                      type === 'mac-mini' ? 'Mac mini' : 
                      type === 'macbook' ? 'MacBook' : 
                      type === 'imac' ? 'iMac' : type
                    );
                  } else if (selectedTier2 === 'windows') {
                    // For Windows, show versions
                    options = Object.keys(tier2Data.versions).map(version => 
                      version === 'windows-11' ? 'Windows 11' :
                      version === 'windows-10' ? 'Windows 10' : version
                    );
                  }
                }
                
                return options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.listOption,
                      selectedTier3 === option && styles.listOptionActive,
                    ]}
                    onPress={() => setSelectedTier3(option)}
                  >
                    <Text style={[
                      styles.listOptionText,
                      selectedTier3 === option && styles.listOptionTextActive,
                    ]}>
                      {option}
                    </Text>
                    <Ionicons 
                      name={selectedTier3 === option ? "checkmark-circle" : "radio-button-off"} 
                      size={Responsive.iconSizes.medium} 
                      color={selectedTier3 === option ? Colors.accent : Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                ));
              })()}
            </View>
          </View>
        )}

        {/* Custom Device Name */}
        {selectedTier1 && (
          <View style={styles.selectorTier}>
            <Text style={styles.tierTitle}>Custom Name (Optional)</Text>
            <TextInput
              style={styles.customInput}
              placeholder="Enter a custom name for this device"
              placeholderTextColor={Colors.textSecondary}
              value={customDeviceName}
              onChangeText={setCustomDeviceName}
            />
          </View>
        )}

        {/* Preview */}
        {selectedTier1 && (
          <View style={styles.devicePreview}>
            <Text style={styles.previewTitle}>Device Preview:</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewIcon}>
                <Ionicons 
                  name={selectedTier1 === 'mobile' ? 'phone-portrait' : 'laptop'} 
                  size={Responsive.iconSizes.medium} 
                  color={Colors.accent} 
                />
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>
                  {customDeviceName.trim() || selectedTier3 || (selectedTier2 ? DEVICE_HIERARCHY[selectedTier1][selectedTier2].name : selectedTier1 === 'mobile' ? 'Mobile Device' : 'Computer')}
                </Text>
                <Text style={styles.previewType}>
                  {selectedTier1 === 'mobile' ? 'Mobile Device' : 'Computer'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderDeviceCard = (device) => (
    <View key={device.id} style={styles.deviceCard}>
      <View style={styles.deviceCardContent}>
        <View style={styles.deviceIcon}>
          <Ionicons 
            name={device.type === 'mobile' ? 'phone-portrait' : 'laptop'} 
            size={Responsive.iconSizes.medium} 
            color={Colors.accent} 
          />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceType}>
            {device.type === 'mobile' ? 'Mobile Device' : 'Computer'}
          </Text>
          {device.autoDetected && (
            <Text style={styles.autoDetectedLabel}>Auto-detected</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            console.log('Remove button pressed for device:', device.id);
            removeDevice(device.id);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={Responsive.iconSizes.medium} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isFirstTime ? 'Device Discovery' : 'Manage Devices'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Description */}
          {isFirstTime && (
            <View style={styles.descriptionContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="search" size={Responsive.iconSizes.large} color={Colors.accent} />
              </View>
              <Text style={styles.title}>
                Let's discover your devices
              </Text>
              <Text style={styles.description}>
                Every Cybersecurity assessment starts with a discovery phase. We will only use this information to personally guide you through our checks.
              </Text>
            </View>
          )}

          {/* Device List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Your Devices ({devices.length})
            </Text>
            
            {devices.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="phone-portrait" size={Responsive.iconSizes.large} color={Colors.accent} />
                <Text style={styles.emptyStateText}>No devices added yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add your mobile devices and computers to get personalized security recommendations
                </Text>
              </View>
            ) : (
              <View style={styles.deviceList}>
                {devices.map(renderDeviceCard)}
              </View>
            )}
          </View>

          {/* Add Device Section */}
          <View style={styles.section}>
            {!isAddingDevice ? (
              <TouchableOpacity
                style={styles.addDeviceButton}
                onPress={() => setIsAddingDevice(true)}
              >
                <Ionicons name="add-circle" size={Responsive.iconSizes.medium} color={Colors.accent} />
                <Text style={styles.addDeviceButtonText}>Add Device</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addDeviceForm}>
                <Text style={styles.formTitle}>Add New Device</Text>
                
                {renderHierarchicalSelector()}
                
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingDevice(false);
                      resetSelections();
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.saveButton, !selectedTier1 && styles.saveButtonDisabled]}
                    onPress={addDevice}
                    disabled={!selectedTier1}
                  >
                    <Text style={styles.saveButtonText}>Add Device</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, devices.length === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={devices.length === 0}
        >
          <Text style={styles.continueButtonText}>
            {isFirstTime ? 'Continue to Security Checks' : 'Save Changes'}
          </Text>
          {isFirstTime && (
            <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Remove Confirmation Modal */}
      {showRemoveConfirmation && (
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Remove Device</Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to remove "{deviceToRemove?.name}"?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.confirmationCancelButton}
                onPress={cancelRemoveDevice}
              >
                <Text style={styles.confirmationCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmationRemoveButton}
                onPress={confirmRemoveDevice}
              >
                <Text style={styles.confirmationRemoveText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Responsive.padding.screen,
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.lg,
  },
  descriptionContainer: {
    alignItems: 'center',
    paddingVertical: Responsive.spacing.xl,
    marginBottom: Responsive.spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Responsive.spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  description: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.4,
    paddingHorizontal: Responsive.spacing.md,
  },
  section: {
    marginBottom: Responsive.spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Responsive.spacing.xl,
    paddingHorizontal: Responsive.spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: Typography.sizes.md,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.3,
  },
  deviceList: {
    gap: Responsive.spacing.sm,
  },
  deviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  deviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Responsive.spacing.lg,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Responsive.spacing.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  deviceType: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  autoDetectedLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    marginTop: Responsive.spacing.xs,
  },
  removeButton: {
    padding: Responsive.spacing.md,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    gap: Responsive.spacing.sm,
  },
  addDeviceButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.accent,
  },
  addDeviceForm: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  deviceTypeSelector: {
    flexDirection: 'row',
    marginBottom: Responsive.spacing.md,
    gap: Responsive.spacing.sm,
  },
  deviceTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.spacing.md,
    paddingHorizontal: Responsive.spacing.sm,
    backgroundColor: Colors.track,
    borderRadius: Responsive.borderRadius.medium,
    gap: Responsive.spacing.sm,
  },
  deviceTypeButtonActive: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  deviceTypeButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  deviceTypeButtonTextActive: {
    color: Colors.accent,
  },
  // Hierarchical selector styles
  hierarchicalSelector: {
    marginBottom: Responsive.spacing.md,
  },
  selectorTier: {
    marginBottom: Responsive.spacing.lg,
  },
  tierTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  tierOptions: {
    flexDirection: 'row',
    gap: Responsive.spacing.sm,
  },
  tierOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.spacing.md,
    paddingHorizontal: Responsive.spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Responsive.borderRadius.medium,
    gap: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierOptionActive: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  tierOptionText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  tierOptionTextActive: {
    color: Colors.accent,
  },
  tierOptionsList: {
    gap: Responsive.spacing.xs,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Responsive.spacing.md,
    paddingHorizontal: Responsive.spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listOptionActive: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  listOptionText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  listOptionTextActive: {
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
  customInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devicePreview: {
    marginTop: Responsive.spacing.md,
    padding: Responsive.spacing.md,
    backgroundColor: Colors.accentSoft,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  previewTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    marginBottom: Responsive.spacing.sm,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Responsive.spacing.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  previewType: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Responsive.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Responsive.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Responsive.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.medium,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  footer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  continueButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.padding.button,
    borderRadius: Responsive.borderRadius.large,
    gap: Responsive.spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  continueButtonText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  
  // Confirmation modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationModal: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    margin: Responsive.spacing.xl,
    padding: Responsive.spacing.xl,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmationTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.md,
  },
  confirmationMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.xl,
    lineHeight: 22,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: Responsive.spacing.md,
  },
  confirmationCancelButton: {
    flex: 1,
    paddingVertical: Responsive.spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  confirmationCancelText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  confirmationRemoveButton: {
    flex: 1,
    paddingVertical: Responsive.spacing.md,
    backgroundColor: Colors.error,
    borderRadius: Responsive.borderRadius.medium,
    alignItems: 'center',
  },
  confirmationRemoveText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
});

export default DeviceAuditScreen;
