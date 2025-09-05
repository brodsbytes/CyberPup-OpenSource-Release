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

import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import ReferencesSection from '../../../components/ui/ReferencesSection';
import { getReferencesForCheck } from '../../../data/references';
import { SCREEN_NAMES } from '../../../constants';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import { SettingsGuide } from '../../../utils/settingsGuide';
import { AppStorage } from '../../../utils/storage';

import TimelineDashboard from '../../../components/ui/TimelineDashboard';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';
import { getCompletionMessage, getNextScreenName, getCompletionNavigation } from '../../../utils/completionMessages';
import { CopywritingService } from '../../../utils/copywritingService';

const Check1_5_2_PrivacySettingsScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Standard state management
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(false);

    // ✅ CRITICAL: Proper error handling for initialization
  const initializeDeviceContent = async () => {
    console.log('🔄 Initializing device content for Check 1.5.2...');
    
    // 🌐 WEB TESTING: Early detection for web platform
    const currentDevice = DeviceCapabilities.getCurrentDevice();
    console.log('🔍 Current device:', currentDevice);
    
    if (currentDevice.platform === 'web' || currentDevice.platform === 'unknown') {
      console.log('🌐 Detected web platform, using web testing content directly...');
      const { webTestDevice, webTestActions } = createWebTestingContent();
      
      console.log('🌐 Setting web test device:', webTestDevice);
      console.log('🌐 Setting web test actions:', webTestActions.length, 'actions');
      
      setUserDevices([webTestDevice]);
      setDeviceActions({
        'web-test-device': webTestActions
      });
      setIsInitializing(false);
      
      console.log('🌐 Web testing content initialized successfully');
      return;
    }
    
    try {
      const devices = await DeviceCapabilities.getUserDevices();
      console.log('📱 Retrieved devices:', devices);
      
      let allDevices = [...devices];
      const hasCurrentDevice = devices.some(d => 
        d.platform === currentDevice.platform && d.type === currentDevice.type
      );
      
      if (!hasCurrentDevice) {
        console.log('➕ Adding current device to device list');
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

      console.log('📋 Final device list:', allDevices);
      setUserDevices(allDevices);

      // Create device-specific actions using SettingsGuide
      console.log('🔧 Creating device actions...');
      const actions = {};
      for (const device of allDevices) {
        try {
          console.log(`🔧 Creating actions for device: ${device.id} (${device.platform})`);
          actions[device.id] = await createPrivacySettingsActions(device);
          console.log(`✅ Actions created for ${device.id}:`, actions[device.id].length, 'actions');
          console.log(`📋 Action details for ${device.id}:`, actions[device.id].map(a => ({ id: a.id, title: a.title, completed: a.completed })));
        } catch (actionError) {
          console.error(`❌ Error creating actions for device ${device.id}:`, actionError);
          // Create basic fallback actions for this device
          actions[device.id] = [
            {
              id: `${device.id}-basic-privacy`,
              title: 'Basic Privacy Review',
              description: 'Review basic privacy settings on your device',
              completed: false,
              priority: 'high',
              category: 'privacy',
              steps: [
                'Open device settings',
                'Navigate to privacy section',
                'Review privacy options'
              ],
              tips: [
                'Start with the most important settings',
                'Be conservative with permissions'
              ],
              deepLink: null
            }
          ];
        }
      }
      
      console.log('✅ All device actions created:', Object.keys(actions));
      setDeviceActions(actions);
      setIsInitializing(false);
    } catch (error) {
      console.error('❌ Error initializing device content:', error);
      
      // Fallback: Create basic device actions for current device
      try {
        console.log('🔄 Attempting fallback initialization...');
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
        setDeviceActions({
          'current-device': await createPrivacySettingsActions(fallbackDevice)
        });
        setIsInitializing(false);
      } catch (fallbackError) {
        console.error('❌ Fallback device initialization failed:', fallbackError);
        
        // 🌐 WEB TESTING: Smart detection for web platform
        const currentDevice = DeviceCapabilities.getCurrentDevice();
        if (currentDevice.platform === 'web' || currentDevice.platform === 'unknown') {
          console.log('🌐 Detected web platform, using web testing content...');
          const { webTestDevice, webTestActions } = createWebTestingContent();
          setUserDevices([webTestDevice]);
          setDeviceActions({
            'web-test-device': webTestActions
          });
          return;
        }
        
        // Final fallback: create minimal content to prevent empty state
        console.log('🔄 Creating minimal fallback content...');
        const minimalDevice = {
          id: 'fallback-device',
          name: 'Your Device',
          type: 'mobile',
          platform: 'unknown',
          autoDetected: true,
          supportsDeepLinks: false
        };
        
        setUserDevices([minimalDevice]);
        setDeviceActions({
          'fallback-device': [
            {
              id: 'fallback-device-basic-privacy',
              title: 'Privacy Settings Review',
              description: 'Review and configure privacy settings on your device',
              completed: false,
              priority: 'high',
              category: 'privacy',
              steps: [
                'Open your device settings',
                'Look for privacy or security section',
                'Review available privacy options',
                'Configure settings to your preference'
              ],
              tips: [
                'Start with the most sensitive settings first',
                'Consider what information you want to share',
                'Be conservative with permissions initially'
              ],
              deepLink: null
            }
          ]
        });
        setIsInitializing(false);
      }
    }
  };

  // 🌐 WEB TESTING: Smart fallback for web platform testing
  const createWebTestingContent = () => {
    console.log('🌐 Creating web testing content for development...');
    
    const webTestDevice = {
      id: 'web-test-device',
      name: 'Web Test Device',
      type: 'computer',
      platform: 'web',
      autoDetected: true,
      supportsDeepLinks: false
    };
    
    const webTestActions = [
      {
        id: 'web-test-privacy-review',
        title: 'Review Privacy Settings',
        description: 'Audit and configure privacy settings on your device',
        completed: false,
        priority: 'high',
        category: 'privacy',
        steps: [
          'Open device settings',
          'Navigate to privacy section',
          'Review all privacy options',
          'Configure settings to your preference'
        ],
        tips: [
          'Start with the most sensitive settings first',
          'Consider what information you want to share',
          'Be conservative with permissions initially',
          'You can always adjust settings later'
        ],
        deepLink: null
      },
      {
        id: 'web-test-app-permissions',
        title: 'Manage App Permissions',
        description: 'Review and control which apps can access your data',
        completed: false,
        priority: 'high',
        category: 'permissions',
        steps: [
          'Go to Settings > Privacy & Security',
          'Review each permission category',
          'Disable permissions for apps that don\'t need them',
          'Check location, camera, microphone, and contacts access'
        ],
        tips: [
          'Only grant permissions when apps actually need them',
          'Review permissions regularly',
          'Consider using "While Using" for location instead of "Always"',
          'Disable permissions for apps you rarely use'
        ],
        deepLink: null
      },
      {
        id: 'web-test-tracking-prevention',
        title: 'Enable App Tracking Prevention',
        description: 'Prevent apps from tracking you across other apps and websites',
        completed: false,
        priority: 'critical',
        category: 'tracking',
        steps: [
          'Go to Settings > Privacy & Security > Tracking',
          'Toggle off "Allow Apps to Request to Track"',
          'Review and deny tracking requests from apps',
          'Consider using "Ask App Not to Track" for new apps'
        ],
        tips: [
          'This prevents cross-app tracking',
          'Apps may still track within their own ecosystem',
          'Some apps may not work properly without tracking',
          'You can always allow tracking for specific apps later'
        ],
        deepLink: null
      },
      {
        id: 'web-test-social-media-privacy',
        title: 'Review Social Media Privacy',
        description: 'Audit and configure privacy settings on social media platforms',
        completed: false,
        priority: 'medium',
        category: 'social-media',
        steps: [
          'Review privacy settings on each platform',
          'Configure who can see your posts and information',
          'Limit data collection and ad personalization',
          'Review and clean up old posts and information'
        ],
        tips: [
          'Set accounts to private when possible',
          'Limit personal information in profiles',
          'Review third-party app connections',
          'Regularly audit your digital footprint'
        ],
        deepLink: null
      },
      {
        id: 'web-test-data-backup',
        title: 'Configure Data Backup',
        description: 'Set up secure backup for your important data',
        completed: false,
        priority: 'high',
        category: 'backup',
        steps: [
          'Choose a backup solution (cloud or local)',
          'Configure automatic backup schedules',
          'Test backup and restore functionality',
          'Verify backup encryption and security'
        ],
        tips: [
          'Use multiple backup locations for redundancy',
          'Test your backup regularly',
          'Keep backup credentials secure',
          'Consider offline backup for critical data'
        ],
        deepLink: null
      }
    ];
    
    return { webTestDevice, webTestActions };
  };

  // ✅ CRITICAL: Proper AsyncStorage usage
  const loadProgress = async () => {
    try {
      const progressKey = `check_1-5-2_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        setDeviceActions(progress.deviceActions || {});
        setDeviceCompletionStatus(progress.deviceCompletionStatus || {});
        setIsCompleted(progress.isCompleted || false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Continue with empty state
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-5-2_progress`;
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

  // ✅ PRESERVE: Standard focus effect
  useFocusEffect(
    React.useCallback(() => {
      // For web testing, don't load progress - use fresh content
      const currentDevice = DeviceCapabilities.getCurrentDevice();
      if (currentDevice.platform === 'web' || currentDevice.platform === 'unknown') {
        console.log('🌐 Web platform detected, skipping progress load...');
        initializeDeviceContent();
      } else {
        console.log('📱 Mobile/Desktop platform, loading progress...');
        loadProgress();
        initializeDeviceContent();
      }
      
      // Reset completion state when screen comes into focus
      // This ensures the completion popup doesn't stay visible after navigation
      setIsCompleted(false);
      setShowCompletionPopup(false);
    }, [])
  );

  // ✅ CRITICAL: Save progress when device actions change
  useEffect(() => {
    console.log('🔄 deviceActions changed:', {
      deviceActionsKeys: Object.keys(deviceActions),
      deviceActionsLength: Object.keys(deviceActions).length,
      userDevicesLength: userDevices.length
    });
    
    if (Object.keys(deviceActions).length > 0) {
      saveProgress();
      
      // Since showUnifiedView is true, only check completion of the first device
      let allDevicesCompleted = false;
      if (userDevices.length > 0) {
        const firstDevice = userDevices[0];
        const firstDeviceActions = deviceActions[firstDevice.id] || [];
        allDevicesCompleted = firstDeviceActions.length > 0 && firstDeviceActions.every(action => action.completed);
      } else {
        // Fallback: check all devices if no devices available
        allDevicesCompleted = Object.keys(deviceActions).every(deviceId => {
          const deviceActionsList = deviceActions[deviceId] || [];
          return deviceActionsList.length > 0 && deviceActionsList.every(action => action.completed);
        });
      }
      
      if (allDevicesCompleted && !isCompleted) {
        setIsCompleted(true);
        setShowCompletionPopup(true);
        celebrateCompletion();
      }
    }
  }, [deviceActions]);

  // 🌐 WEB TESTING: Monitor state changes for debugging
  useEffect(() => {
    console.log('🔄 userDevices changed:', {
      userDevicesLength: userDevices.length,
      userDevices: userDevices.map(d => ({ id: d.id, name: d.name, platform: d.platform }))
    });
  }, [userDevices]);

  // ✅ CRITICAL: Handle action completion
  const handleActionComplete = async (deviceId, actionId, completed) => {
    console.log(`🔄 Action completion: ${deviceId} - ${actionId} = ${completed}`);
    
    setDeviceActions(prevActions => {
      const updatedActions = { ...prevActions };
      if (updatedActions[deviceId]) {
        updatedActions[deviceId] = updatedActions[deviceId].map(action =>
          action.id === actionId ? { ...action, completed } : action
        );
        
        // Log the updated actions for this device
        console.log(`📋 Updated actions for ${deviceId}:`, updatedActions[deviceId].map(a => ({ id: a.id, title: a.title, completed: a.completed })));
      }
      
      // Update device completion status within the same callback
      setDeviceCompletionStatus(prevStatus => {
        const updatedStatus = { ...prevStatus };
        if (updatedActions[deviceId]) {
          const deviceActionsList = updatedActions[deviceId];
          const completedActions = deviceActionsList.filter(action => action.completed).length;
          const totalActions = deviceActionsList.length;
          updatedStatus[deviceId] = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
        }
        return updatedStatus;
      });
      
      return updatedActions;
    });
  };

  // Calculate progress for the header
  const getProgress = () => {
    // Since showUnifiedView is true, only count actions from the first device
    if (userDevices.length > 0) {
      const firstDevice = userDevices[0];
      const firstDeviceActions = deviceActions[firstDevice.id] || [];
      const totalActions = firstDeviceActions.length;
      const completedActions = firstDeviceActions.filter(action => action.completed).length;
      
      console.log(`📊 Progress calculation for ${firstDevice.name}:`, {
        totalActions,
        completedActions,
        progress: totalActions > 0 ? (completedActions / totalActions) * 100 : 0
      });
      
      return totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
    }
    
    // Fallback to all devices if no devices available
    const totalActions = Object.values(deviceActions).flat().length;
    const completedActions = Object.values(deviceActions).flat().filter(action => action.completed).length;
    
    console.log(`📊 Fallback progress calculation:`, {
      totalActions,
      completedActions,
      progress: totalActions > 0 ? (completedActions / totalActions) * 100 : 0
    });
    
    return totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  };

  // ✅ STANDARD: Dynamic exit handler
  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleKeepLearning = () => {
    setShowExitModal(false);
  };

  const handleExitLesson = () => {
    setShowExitModal(false);
    navigation.navigate(SCREEN_NAMES.WELCOME);
  };

  // ✅ STANDARD: Completion celebration
  const celebrateCompletion = () => {
    console.log('🎉 Celebrating completion of Check 1.5.2');
    // Always show CompletionPopup first, let user click "Continue" to go to AreaCompletionScreen
    setShowCompletionPopup(true);
  };

  // ✅ CRITICAL: Create privacy settings actions for each device
  const createPrivacySettingsActions = async (device) => {
    console.log(`🔧 Creating privacy actions for device:`, device);
    
    const platform = device.platform || device.tier2;
    const type = device.type;
    
    console.log(`📱 Device platform: ${platform}, type: ${type}`);

    const privacyActions = [];

    // Common privacy actions for all devices
    privacyActions.push(
      {
        id: `${device.id}-review-privacy-settings`,
        title: 'Review Privacy Settings',
        description: 'Audit and configure privacy settings on your device',
        completed: false,
        priority: 'high',
        category: 'privacy',
        steps: [
          'Open device settings',
          'Navigate to privacy section',
          'Review all privacy options',
          'Configure settings to your preference'
        ],
        tips: [
          'Start with the most sensitive settings first',
          'Consider what information you want to share',
          'Be conservative with permissions initially',
          'You can always adjust settings later'
        ],
        deepLink: SettingsGuide.getSettingsUrl('privacy', platform).url
      }
    );

    // Platform-specific privacy actions
    if (platform === 'ios') {
      privacyActions.push(
        {
          id: `${device.id}-ios-app-permissions`,
          title: 'Manage App Permissions',
          description: 'Review and control which apps can access your data',
          completed: false,
          priority: 'high',
          category: 'permissions',
          steps: [
            'Go to Settings > Privacy & Security',
            'Review each permission category',
            'Disable permissions for apps that don\'t need them',
            'Check location, camera, microphone, and contacts access'
          ],
          tips: [
            'Only grant permissions when apps actually need them',
            'Review permissions regularly',
            'Consider using "While Using" for location instead of "Always"',
            'Disable permissions for apps you rarely use'
          ],
          deepLink: 'App-Prefs:Privacy'
        },
        {
          id: `${device.id}-ios-tracking-prevention`,
          title: 'Enable App Tracking Prevention',
          description: 'Prevent apps from tracking you across other apps and websites',
          completed: false,
          priority: 'critical',
          category: 'tracking',
          steps: [
            'Go to Settings > Privacy & Security > Tracking',
            'Toggle off "Allow Apps to Request to Track"',
            'Review and deny tracking requests from apps',
            'Consider using "Ask App Not to Track" for new apps'
          ],
          tips: [
            'This prevents cross-app tracking',
            'Apps may still track within their own ecosystem',
            'Some apps may not work properly without tracking',
            'You can always allow tracking for specific apps later'
          ],
          deepLink: 'App-Prefs:Privacy&path=Tracking'
        }
      );
    } else if (platform === 'android') {
      privacyActions.push(
        {
          id: `${device.id}-android-app-permissions`,
          title: 'Manage App Permmissions',
          description: 'Review and control app permissions on your Android device',
          completed: false,
          priority: 'high',
          category: 'permissions',
          steps: [
            'Go to Settings > Apps & notifications',
            'Select individual apps to review permissions',
            'Disable unnecessary permissions',
            'Check location, camera, microphone, and storage access'
          ],
          tips: [
            'Use the permission manager to see all app permissions',
            'Consider using "Ask every time" for sensitive permissions',
            'Review permissions after app updates',
            'Disable permissions for apps you don\'t trust'
          ],
          deepLink: 'android.settings.APPLICATION_DETAILS_SETTINGS'
        },
        {
          id: `${device.id}-android-google-privacy`,
          title: 'Configure Google Privacy Settings',
          description: 'Manage your Google account privacy and data settings',
          completed: false,
          priority: 'high',
          category: 'google-privacy',
          steps: [
            'Go to myaccount.google.com/privacy',
            'Review data collection settings',
            'Configure ad personalization preferences',
            'Manage location history and activity controls'
          ],
          tips: [
            'Turn off location history if you don\'t need it',
            'Review and delete old activity data',
            'Configure ad personalization to your preference',
            'Consider using incognito mode for sensitive searches'
          ],
          deepLink: 'https://myaccount.google.com/privacy'
        }
      );
    } else if (platform === 'windows') {
      privacyActions.push(
        {
          id: `${device.id}-windows-privacy-settings`,
          title: 'Configure Windows Privacy',
          description: 'Review and adjust Windows privacy settings',
          completed: false,
          priority: 'high',
          category: 'windows-privacy',
          steps: [
            'Open Windows Settings > Privacy & security',
            'Review each privacy category',
            'Disable unnecessary data collection',
            'Configure app permissions and access'
          ],
          tips: [
            'Turn off telemetry and diagnostic data collection',
            'Review app permissions for camera, microphone, and location',
            'Configure advertising ID settings',
            'Consider using Windows privacy tools'
          ],
          deepLink: 'ms-settings:privacy'
        }
      );
    } else if (platform === 'macos') {
      privacyActions.push(
        {
          id: `${device.id}-macos-privacy-settings`,
          title: 'Configure macOS Privacy',
          description: 'Review and adjust macOS privacy and security settings',
          completed: false,
          priority: 'high',
          category: 'macos-privacy',
          steps: [
            'Open System Preferences > Security & Privacy',
            'Review privacy settings for each category',
            'Configure app permissions and access',
            'Enable FileVault for disk encryption'
          ],
          tips: [
            'Review camera and microphone access for apps',
            'Configure location services carefully',
            'Enable FileVault for full disk encryption',
            'Use Gatekeeper to control app installation'
          ],
          deepLink: 'x-apple.systempreferences:com.apple.preference.security'
        }
      );
    }

    // Social media privacy actions
    privacyActions.push(
      {
        id: `${device.id}-social-media-privacy`,
        title: 'Review Social Media Privacy',
        description: 'Audit and configure privacy settings on social media platforms',
        completed: false,
        priority: 'medium',
        category: 'social-media',
        steps: [
          'Review privacy settings on each platform',
          'Configure who can see your posts and information',
          'Limit data collection and ad personalization',
          'Review and clean up old posts and information'
        ],
        tips: [
          'Set accounts to private when possible',
          'Limit personal information in profiles',
          'Review third-party app connections',
          'Regularly audit your digital footprint'
        ],
        deepLink: null
      }
    );

    return privacyActions;
  };

  // ✅ CRITICAL: Get device icon helper function
  const getDeviceIcon = (device) => {
    const platform = device.platform || device.tier2;
    const type = device.type;

    if (type === 'mobile') {
      return platform === 'ios' ? 'phone-portrait' : 'phone-portrait';
    } else if (type === 'tablet') {
      return platform === 'ios' ? 'tablet-portrait' : 'tablet-portrait';
    } else if (type === 'computer') {
      if (platform === 'windows') return 'desktop';
      if (platform === 'macos') return 'laptop';
      return 'desktop';
    }
    return 'device-desktop';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* ✅ STANDARD: Dynamic exit modal header */}
      {/* ✅ UPDATED: Header with progress bar */}
      <HeaderWithProgress
        checkId="1-5-2"
        onExit={handleExit}
        isCompleted={isCompleted}
        progress={getProgress()}
        navigation={navigation}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <View style={styles.titleIconContainer}>
              <Ionicons 
                name="shield-checkmark" 
                size={Responsive.iconSizes.xxlarge} 
                color={Colors.accent} 
              />
            </View>
            <Text style={styles.title}>Privacy Settings</Text>
            <Text style={styles.description}>
              Take control of your digital privacy across all your devices and platforms. This timeline will guide you through configuring privacy settings to protect your personal information.
            </Text>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why are privacy settings important?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Privacy Control Benefits</Text>
              <Text style={styles.learnMoreBody}>
                Your devices and apps are constantly collecting information about you - where you go, what you search for, who you talk to, and even what you buy. This data creates a detailed digital profile that companies use to target ads, influence your decisions, and sometimes sell to third parties. By taking control of your privacy settings, you're essentially putting up digital curtains around your personal life. You decide what information gets shared, with whom, and for how long. It's like having a say in who gets to peek through your windows - you wouldn't let strangers look into your home, so why let companies peek into your digital life? Proper privacy settings give you the power to be selective about what you share, protecting not just your personal information but also your mental well-being from constant surveillance and manipulation.
              </Text>
            </View>
          )}
          
          {/* ✅ CRITICAL: Conditional rendering with fallback */}
          {(() => {
            console.log('🔍 Render debug:', {
              isInitializing,
              userDevicesLength: userDevices.length,
              deviceActionsKeys: Object.keys(deviceActions),
              deviceActionsLength: Object.keys(deviceActions).length,
              shouldShowTimeline: !isInitializing && userDevices.length > 0 && Object.keys(deviceActions).length > 0
            });
            
            if (isInitializing) {
              return (
                <View style={styles.fallbackContainer}>
                  <Text style={styles.fallbackTitle}>Setting Up Privacy Configuration</Text>
                  <Text style={styles.fallbackText}>
                    We're preparing your personalized privacy settings timeline...
                  </Text>
                </View>
              );
            }
            
            return userDevices.length > 0 && Object.keys(deviceActions).length > 0 ? (
              <TimelineDashboard
                userDevices={userDevices}
                deviceActions={deviceActions}
                onActionComplete={handleActionComplete}
                variant="timeline"
                checkId="1-5-2"
                navigation={navigation}
                showUnifiedView={true}
                showProgressHeader={false}
              />
            ) : (
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackTitle}>Setting Up Privacy Configuration</Text>
                <Text style={styles.fallbackText}>
                  We're preparing your personalized privacy settings timeline.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={initializeDeviceContent}
                >
                  <Text style={styles.retryButtonText}>Retry Setup</Text>
                </TouchableOpacity>
              </View>
            );
          })()}

          {/* Security Best Practices */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>🔒 Privacy Settings Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="location" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Limit location tracking to essential apps only</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="camera" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Review camera and microphone permissions regularly</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="analytics" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Disable ad personalization and data collection</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="people" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Control who can see your activity and profile</Text>
            </View>
          </View>

          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-5-2')} />

        </View>
      </ScrollView>

      {/* ✅ STANDARDIZED: Exit Modal using common component */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="🔐"
        title="Wait, don't go!"
        message="You're taking control of your digital privacy across all platforms. This knowledge will protect your personal information!"
      />
      
      {/* ✅ STANDARD: Completion card */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-5-2').title}
          description={getCompletionMessage('1-5-2').description}
          nextScreenName={getNextScreenName('1-5-2')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-5-2'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-5-2"
          />
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
    alignItems: 'center',
  },
  titleIconContainer: {
    marginBottom: Responsive.spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    lineHeight: Typography.sizes.xxl * 1.3,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
    textAlign: 'center',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Responsive.spacing.xl,
  },
  fallbackTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
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
    minHeight: Responsive.buttonHeight.medium,
  },
  retryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },

  completionCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Responsive.padding.screen,
  },
  completionContent: {
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  completionDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    minHeight: Responsive.buttonHeight.medium,
  },
  continueButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.sm,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Responsive.padding.button,
    marginBottom: Responsive.spacing.md,
  },
  learnMoreText: {
    fontSize: Typography.sizes.md,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
  },
  learnMoreContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  learnMoreTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  learnMoreBody: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  tipsSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Responsive.spacing.sm,
    flex: 1,
    lineHeight: Typography.sizes.sm * 1.4,
  },
});

export default Check1_5_2_PrivacySettingsScreen;
