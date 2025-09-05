import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import ReferencesSection from '../../../components/ui/ReferencesSection';
import { getReferencesForCheck } from '../../../data/references';
import { SCREEN_NAMES } from '../../../constants';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import { SettingsGuide } from '../../../utils/settingsGuide';
import { AppStorage } from '../../../utils/storage';

import WizardFlow from '../../../components/validation-steps/WizardFlow';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

const Check1_2_4_BluetoothWifiScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Exact same state management as Check 1.4
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);

  // ✅ PRESERVE: Exact same initialization logic
  const initializeDeviceContent = async () => {
    try {
      const devices = await DeviceCapabilities.getUserDevices();
      const currentDevice = DeviceCapabilities.getCurrentDevice();
      
      let allDevices = [...devices];
      
      // Always ensure we have at least the current device
      if (allDevices.length === 0) {
        const currentDeviceInfo = {
          id: 'current-device',
          name: currentDevice.type || 'Your Device',
          type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
          platform: currentDevice.platform,
          tier2: currentDevice.platform,
          autoDetected: true,
          supportsDeepLinks: currentDevice.supportsDeepLinks,
          icon: getDeviceIcon(currentDevice)
        };
        allDevices = [currentDeviceInfo];
      } else {
        // Check if current device is already in the list
        const hasCurrentDevice = devices.some(d => 
          d.platform === currentDevice.platform && d.type === currentDevice.type
        );
        
        if (!hasCurrentDevice) {
          allDevices.unshift({
            id: 'current-device',
            name: currentDevice.type,
            type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
            platform: currentDevice.platform,
            tier2: currentDevice.platform,
            autoDetected: true,
            supportsDeepLinks: currentDevice.supportsDeepLinks,
            icon: getDeviceIcon(currentDevice)
          });
        }
      }

      setUserDevices(allDevices);

      // Create device-specific actions using SettingsGuide
      const actions = {};
      for (const device of allDevices) {
        const deviceActions = await createBluetoothWifiActions(device);
        actions[device.id] = deviceActions;
      }
      setDeviceActions(actions);
    } catch (error) {
      console.error('Error initializing device content:', error);
      
      // Fallback: Create basic device actions for current device
      try {
        const currentDevice = DeviceCapabilities.getCurrentDevice();
        const fallbackDevice = {
          id: 'current-device',
          name: currentDevice.type || 'Your Device',
          type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
          platform: currentDevice.platform || 'unknown',
          autoDetected: true,
          supportsDeepLinks: false
        };
        
        setUserDevices([fallbackDevice]);
        const fallbackActions = await createBluetoothWifiActions(fallbackDevice);
        setDeviceActions({
          'current-device': fallbackActions
        });
      } catch (fallbackError) {
        console.error('Fallback device initialization failed:', fallbackError);
        // Final fallback: empty state
        setUserDevices([]);
        setDeviceActions({});
      }
    }
  };

  // ✅ PRESERVE: Exact same progress management
  const loadProgress = async () => {
    try {
      const progressKey = `check_1-2-4_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        setDeviceActions(progress.deviceActions || {});
        setDeviceCompletionStatus(progress.deviceCompletionStatus || {});
        setIsCompleted(progress.isCompleted || false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-2-4_progress`;
      const progressData = {
        deviceActions,
        deviceCompletionStatus,
        isCompleted,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // ✅ FIXED: Reset completion state properly when screen loads
  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        // First initialize device content
        await initializeDeviceContent();
        
        // Then load progress but reset completion state
        try {
          const progressKey = `check_1-2-4_progress`;
          const progressData = await AsyncStorage.getItem(progressKey);
          
          if (progressData) {
            const progress = JSON.parse(progressData);
            // Reset all actions to not completed
            const resetActions = {};
            Object.keys(progress.deviceActions || {}).forEach(deviceId => {
              resetActions[deviceId] = (progress.deviceActions[deviceId] || []).map(action => ({
                ...action,
                completed: false
              }));
            });
            
            setDeviceActions(resetActions);
            setDeviceCompletionStatus({}); // Reset completion status
            setIsCompleted(false); // Reset completion state
            setShowCompletionPopup(false); // Reset popup
          }
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      };
      
      initializeScreen();
    }, [])
  );

  // ✅ PRESERVE: Save progress when actions change
  useEffect(() => {
    saveProgress();
  }, [deviceActions, deviceCompletionStatus, isCompleted]);

  // ✅ PRESERVE: Action completion handler
  const handleActionComplete = async (deviceId, actionId, completed) => {
    try {
      setDeviceActions(prev => {
        const newActions = { ...prev };
        if (newActions[deviceId]) {
          newActions[deviceId] = newActions[deviceId].map(action => 
            action.id === actionId ? { ...action, completed } : action
          );
        }
        
        // Check if all actions for this device are completed
        const currentDeviceActions = newActions[deviceId] || [];
        const allCompleted = currentDeviceActions.every(action => action.completed);
        
        if (allCompleted) {
          setDeviceCompletionStatus(prevStatus => ({
            ...prevStatus,
            [deviceId]: true
          }));
        }

        // Check if all devices are completed
        const allDevicesCompleted = userDevices.every(device => {
          const deviceActions = newActions[device.id] || [];
          return deviceActions.every(action => action.completed);
        });

        if (allDevicesCompleted && !isCompleted) {
          setIsCompleted(true);
        setShowCompletionPopup(true);
          celebrateCompletion();
        }
        
        return newActions;
      });
    } catch (error) {
      console.error('Error handling action completion:', error);
    }
  };

  // ✅ PRESERVE: Dynamic exit handler matching Check 1.4 pattern
  // Calculate progress for the header
  const getProgress = () => {
    const totalActions = Object.values(deviceActions).flat().length;
    const completedActions = Object.values(deviceActions).flat().filter(action => action.completed).length;
    return totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleKeepLearning = () => {
    setShowExitModal(false);
  };

  const handleExitLesson = () => {
    setShowExitModal(false);
    navigation.navigate('Welcome');
  };

  // ✅ PRESERVE: Completion celebration
  const celebrateCompletion = () => {
    // The completion popup will be shown automatically when isCompleted is true
    // No need to call it as a function
  };

  // Helper function to get device icon
  const getDeviceIcon = (device) => {
    const platform = device.platform || device.tier2;
    const type = device.type;
    
    if (type === 'mobile') {
      return platform === 'ios' ? 'phone-portrait' : 'phone-portrait';
    } else if (type === 'computer') {
      return platform === 'macos' ? 'laptop' : 'desktop';
    }
    
    return 'desktop';
  };

  // ✅ CRITICAL: Avoid variable name conflicts
  const createBluetoothWifiActions = async (device) => {
    const deviceActionsList = [];
    const platform = device.platform || device.tier2;
    let type = device.type;
    
    // Fallback type detection if not set
    if (!type) {
      if (platform === 'ios' || platform === 'android') {
        type = 'mobile';
      } else if (platform === 'macos' || platform === 'windows') {
        type = 'computer';
      } else {
        type = 'computer'; // Default fallback
      }
    }

    if (type === 'mobile') {
      if (platform === 'ios') {
        deviceActionsList.push(
          {
            id: 'ios-wifi-security',
            title: 'Configure Wi-Fi Security',
            description: 'Set up secure Wi-Fi connections and avoid unsecured networks.',
            completed: false,
            deepLink: 'App-Prefs:WiFi',
            steps: [
              'Open Settings app',
              'Tap Wi-Fi',
              'Tap the info icon (i) next to your current network',
              'Ensure "Auto-Join" is enabled for trusted networks',
              'Avoid connecting to networks without passwords'
            ],
            tips: [
              'Only connect to networks you trust',
              'Use cellular data when in doubt about Wi-Fi security',
              'Enable "Ask to Join Networks" to avoid auto-connecting'
            ]
          },
          {
            id: 'ios-bluetooth-security',
            title: 'Configure Bluetooth Security',
            description: 'Set up Bluetooth security to prevent unauthorized connections.',
            completed: false,
            deepLink: 'App-Prefs:Bluetooth',
            steps: [
              'Open Settings app',
              'Tap Bluetooth',
              'Ensure Bluetooth is on when needed',
              'Tap the info icon (i) next to paired devices',
              'Review and remove any unknown devices'
            ],
            tips: [
              'Turn off Bluetooth when not in use',
              'Only pair with devices you own or trust',
              'Use "Forget This Device" for unknown connections'
            ]
          },
          {
            id: 'ios-airdrop-security',
            title: 'Configure AirDrop Security',
            description: 'Set up AirDrop to only receive files from trusted contacts.',
            completed: false,
            deepLink: 'App-Prefs:General&path=AIRDROP',
            steps: [
              'Open Settings app',
              'Tap General',
              'Tap AirDrop',
              'Select "Contacts Only" for security',
              'Avoid "Everyone" setting in public places'
            ],
            tips: [
              'Use "Contacts Only" to prevent unwanted file transfers',
              'Turn off AirDrop when not needed',
              'Be cautious of unexpected file transfer requests'
            ]
          }
        );
      } else if (platform === 'android') {
        deviceActionsList.push(
          {
            id: 'android-wifi-security',
            title: 'Configure Wi-Fi Security',
            description: 'Set up secure Wi-Fi connections and network preferences.',
            completed: false,
            deepLink: 'android-app://com.android.settings/.wifi.WifiSettings',
            steps: [
              'Open Settings app',
              'Tap Network & Internet',
              'Tap Wi-Fi',
              'Tap the gear icon next to your current network',
              'Review network security settings'
            ],
            tips: [
              'Only connect to networks with WPA2 or WPA3 security',
              'Avoid open networks without passwords',
              'Use mobile data when Wi-Fi security is uncertain'
            ]
          },
          {
            id: 'android-bluetooth-security',
            title: 'Configure Bluetooth Security',
            description: 'Set up Bluetooth security and manage paired devices.',
            completed: false,
            deepLink: 'android-app://com.android.settings/.bluetooth.BluetoothSettings',
            steps: [
              'Open Settings app',
              'Tap Connected devices',
              'Tap Bluetooth',
              'Review paired devices list',
              'Remove any unknown or suspicious devices'
            ],
            tips: [
              'Turn off Bluetooth when not in use',
              'Only pair with devices you own',
              'Use "Forget" for unknown device connections'
            ]
          },
          {
            id: 'android-network-security',
            title: 'Configure Network Security',
            description: 'Set up additional network security settings.',
            completed: false,
            deepLink: 'android-app://com.android.settings/.wifi.WifiSettings',
            steps: [
              'Open Settings app',
              'Tap Network & Internet',
              'Tap Wi-Fi preferences',
              'Disable "Turn on Wi-Fi automatically" if desired',
              'Review advanced Wi-Fi settings'
            ],
            tips: [
              'Consider disabling auto-connect to open networks',
              'Use VPN when connecting to public Wi-Fi',
              'Enable "Randomized MAC" for additional privacy'
            ]
          }
        );
      }
    } else if (type === 'computer') {
      if (platform === 'macos') {
        deviceActionsList.push(
          {
            id: 'macos-wifi-security',
            title: 'Configure Wi-Fi Security',
            description: 'Set up secure Wi-Fi connections and network preferences.',
            completed: false,
            deepLink: 'x-apple.systempreferences:com.apple.preference.network',
            steps: [
              'Click the Apple menu in the top-left corner',
              'Select System Preferences',
              'Click Network',
              'Select Wi-Fi from the left sidebar',
              'Click Advanced',
              'Review and manage preferred networks'
            ],
            tips: [
              'Remove networks you no longer use',
              'Only connect to networks you trust',
              'Use VPN when connecting to public Wi-Fi'
            ]
          },
          {
            id: 'macos-bluetooth-security',
            title: 'Configure Bluetooth Security',
            description: 'Set up Bluetooth security and manage paired devices.',
            completed: false,
            deepLink: 'x-apple.systempreferences:com.apple.preference.bluetooth',
            steps: [
              'Click the Apple menu in the top-left corner',
              'Select System Preferences',
              'Click Bluetooth',
              'Review paired devices list',
              'Remove any unknown devices'
            ],
            tips: [
              'Turn off Bluetooth when not in use',
              'Only pair with devices you own',
              'Use "Remove" for suspicious device connections'
            ]
          },
          {
            id: 'macos-airdrop-security',
            title: 'Configure AirDrop Security',
            description: 'Set up AirDrop to only receive files from trusted sources.',
            completed: false,
            deepLink: 'x-apple.systempreferences:com.apple.preference.sharing',
            steps: [
              'Click the Apple menu in the top-left corner',
              'Select System Preferences',
              'Click Sharing',
              'Click AirDrop',
              'Select "Contacts Only" for security'
            ],
            tips: [
              'Use "Contacts Only" to prevent unwanted transfers',
              'Turn off AirDrop when not needed',
              'Be cautious of unexpected file transfer requests'
            ]
          }
        );
      } else if (platform === 'windows') {
        deviceActionsList.push(
          {
            id: 'windows-wifi-security',
            title: 'Configure Wi-Fi Security',
            description: 'Set up secure Wi-Fi connections and network settings.',
            completed: false,
            deepLink: 'ms-settings:network-wifi',
            steps: [
              'Press Windows key + I to open Settings',
              'Click Network & Internet',
              'Click Wi-Fi',
              'Click Manage known networks',
              'Review and remove unwanted networks'
            ],
            tips: [
              'Only connect to networks with WPA2 or WPA3 security',
              'Avoid open networks without passwords',
              'Use VPN when connecting to public Wi-Fi'
            ]
          },
          {
            id: 'windows-bluetooth-security',
            title: 'Configure Bluetooth Security',
            description: 'Set up Bluetooth security and manage paired devices.',
            completed: false,
            deepLink: 'ms-settings:bluetooth',
            steps: [
              'Press Windows key + I to open Settings',
              'Click Devices',
              'Click Bluetooth & other devices',
              'Review paired devices list',
              'Remove any unknown devices'
            ],
            tips: [
              'Turn off Bluetooth when not in use',
              'Only pair with devices you own',
              'Use "Remove device" for suspicious connections'
            ]
          },
          {
            id: 'windows-network-security',
            title: 'Configure Network Security',
            description: 'Set up additional network security settings.',
            completed: false,
            deepLink: 'ms-settings:network-wifi',
            steps: [
              'Press Windows key + I to open Settings',
              'Click Network & Internet',
              'Click Wi-Fi',
              'Click Wi-Fi preferences',
              'Disable "Connect to suggested open hotspots"'
            ],
            tips: [
              'Disable auto-connect to open networks',
              'Use VPN when connecting to public Wi-Fi',
              'Enable Windows Firewall for additional protection'
            ]
          }
        );
      }
    }
    
    // Fallback for unknown platforms or if no actions were created
    if (deviceActionsList.length === 0) {
      deviceActionsList.push(
        {
          id: 'fallback-wifi-security',
          title: 'Configure Wi-Fi Security',
          description: 'Set up secure Wi-Fi connections and avoid unsecured networks.',
          completed: false,
          deepLink: null,
          steps: [
            'Open your device settings',
            'Navigate to Wi-Fi settings',
            'Only connect to networks with passwords',
            'Avoid open/public networks when possible',
            'Use mobile data when Wi-Fi security is uncertain'
          ],
          tips: [
            'Only connect to networks you trust',
            'Look for WPA2 or WPA3 security',
            'Use VPN when connecting to public Wi-Fi'
          ]
        },
        {
          id: 'fallback-bluetooth-security',
          title: 'Configure Bluetooth Security',
          description: 'Set up Bluetooth security to prevent unauthorized connections.',
          completed: false,
          deepLink: null,
          steps: [
            'Open your device settings',
            'Navigate to Bluetooth settings',
            'Turn off Bluetooth when not in use',
            'Only pair with devices you own or trust',
            'Review and remove any unknown devices'
          ],
          tips: [
            'Turn off Bluetooth when not needed',
            'Only pair with devices you trust',
            'Be cautious of unexpected connection requests'
          ]
        }
      );
    }

    return deviceActionsList;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* ✅ UPDATED: Header with progress bar */}
      <HeaderWithProgress
        checkId="1-2-4"
        onExit={handleExit}
        isCompleted={isCompleted}
        progress={getProgress()}
        navigation={navigation}
      />
      
      {/* ✅ STANDARDIZED: Exit Modal using common component */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="📶"
        title="Wait, don't go!"
        message="You're about to secure your wireless connections from potential attacks. This knowledge will protect you in public places!"
      />
      
      {/* 🎨 REVISED: WizardFlow with device cards instead of device selector */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Bluetooth & Wi-Fi Security</Text>
        <Text style={styles.description}>
              Configure secure wireless connections on all your devices. This protects you from network attacks and unauthorized connections.
        </Text>
      </View>

          {/* Device Wizard Cards */}
          {userDevices.length > 0 && Object.keys(deviceActions).length > 0 ? (
            <WizardFlow
              userDevices={userDevices}
              deviceActions={deviceActions}
              onActionComplete={handleActionComplete}
              variant="wizard"
              checkId="1-2-4"
              navigation={navigation}
              showProgressHeader={false}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Wireless Security</Text>
              <Text style={styles.fallbackText}>
                We're preparing personalized wireless security recommendations for your devices.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeDeviceContent}
              >
                <Text style={styles.retryButtonText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Completion Status */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-2-4').title}
          description={getCompletionMessage('1-2-4').description}
          nextScreenName={getNextScreenName('1-2-4')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-2-4'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-2-4"
          />
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-2-4')} />

        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.padding.button,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuButton: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: Responsive.iconSizes.xlarge,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Responsive.padding.screen,
  },
  titleSection: {
    marginBottom: Responsive.spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    lineHeight: Typography.sizes.xxl * 1.3,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
  },
  fallbackTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
  },
  retryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },

});

export default Check1_2_4_BluetoothWifiScreen;
