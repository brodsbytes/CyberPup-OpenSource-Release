// Location and Localization Utilities
import * as Localization from 'expo-localization';
import { StorageUtils } from './storage';

const USER_COUNTRY_KEY = 'user_country_preference';

export class LocationUtils {
  // Get user's country with multiple detection methods
  static async getUserCountry() {
    try {
      // First, check if user has manually set their country
      const userPreference = await StorageUtils.getItem(USER_COUNTRY_KEY);
      if (userPreference) {
        return userPreference;
      }

      // Then try to detect from device locale
      const deviceCountry = this.getCountryFromLocale();
      if (deviceCountry) {
        // Save as preference for future use
        await this.setUserCountry(deviceCountry);
        return deviceCountry;
      }

      // Default fallback
      return 'US';
    } catch (error) {
      console.log('Error detecting user country:', error);
      return 'US'; // Safe fallback
    }
  }

  // Detect country from device locale
  static getCountryFromLocale() {
    try {
      // First try expo-localization (works on mobile)
      const locales = Localization.locales;
      if (locales && locales.length > 0) {
        const locale = locales[0]; // Primary locale
        
        if (locale?.regionCode) {
          return this.mapRegionCodeToCountry(locale.regionCode);
        }

        // Fallback: parse from locale identifier (e.g., "en-AU" -> "AU")
        if (locale?.languageTag) {
          const parts = locale.languageTag.split('-');
          if (parts.length > 1) {
            return this.mapRegionCodeToCountry(parts[1]);
          }
        }
      }

      // Web fallback: use browser's navigator.language
      if (typeof navigator !== 'undefined' && navigator.language) {
        return this.getCountryFromBrowserLocale();
      }

      return null;
    } catch (error) {
      console.log('Error parsing locale:', error);
      return null;
    }
  }

  // Extract country from browser locale (web fallback)
  static getCountryFromBrowserLocale() {
    try {
      // Get primary language
      const language = navigator.language || navigator.languages?.[0];
      
      if (!language) return null;

      // Parse locale string (e.g., "en-AU", "en-US", "fr-CA")
      const parts = language.split('-');
      if (parts.length > 1) {
        const regionCode = parts[1].toUpperCase();
        return this.mapRegionCodeToCountry(regionCode);
      }

      // Try to detect from timezone (less reliable but better than nothing)
      if (Intl && Intl.DateTimeFormat) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return this.getCountryFromTimezone(timezone);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Map timezone to country (rough approximation)
  static getCountryFromTimezone(timezone) {
    const timezoneMap = {
      // Australia
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Australia/Brisbane': 'AU',
      'Australia/Perth': 'AU',
      'Australia/Adelaide': 'AU',
      'Australia/Darwin': 'AU',
      'Australia/Hobart': 'AU',
      
      // United States
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Phoenix': 'US',
      'America/Anchorage': 'US',
      'America/Honolulu': 'US',
      
      // United Kingdom
      'Europe/London': 'UK',
      
      // Canada
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'America/Montreal': 'CA',
      'America/Halifax': 'CA',
      'America/Winnipeg': 'CA',
      'America/Calgary': 'CA',
      'America/Edmonton': 'CA',
      
      // Default fallback for other timezones
    };

    const country = timezoneMap[timezone];
    if (country) {
      return country;
    }

    // Rough continent-based fallback
    if (timezone?.startsWith('Australia/')) return 'AU';
    if (timezone?.startsWith('America/')) return 'US';
    if (timezone?.startsWith('Europe/')) return 'global';
    if (timezone?.startsWith('Asia/')) return 'global';
    
    return null;
  }

  // Map ISO region codes to our supported countries
  static mapRegionCodeToCountry(regionCode) {
    const countryMap = {
      // Australia
      'AU': 'AU',
      
      // United States
      'US': 'US',
      
      // United Kingdom
      'GB': 'UK',
      'UK': 'UK',
      
      // Canada
      'CA': 'CA',
      
      // New Zealand (use AU alerts)
      'NZ': 'AU',
      
      // European countries (use global for now)
      'DE': 'global',
      'FR': 'global',
      'IT': 'global',
      'ES': 'global',
      'NL': 'global',
      'BE': 'global',
      'CH': 'global',
      'AT': 'global',
      'SE': 'global',
      'NO': 'global',
      'DK': 'global',
      'FI': 'global',
      
      // Default for unsupported regions
    };

    const mappedCountry = countryMap[regionCode?.toUpperCase()];
    return mappedCountry || 'global';
  }

  // Save user's country preference
  static async setUserCountry(country) {
    try {
      await StorageUtils.setItem(USER_COUNTRY_KEY, country);
    } catch (error) {
      console.log('Error saving country preference:', error);
    }
  }

  // Get list of supported countries for user selection
  static getSupportedCountries() {
    return [
      { code: 'AU', name: 'Australia', flag: '🇦🇺', source: 'ACSC' },
      { code: 'US', name: 'United States', flag: '🇺🇸', source: 'CISA' },
      { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', source: 'NCSC' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', source: 'CCCS' },
      { code: 'global', name: 'Global/Other', flag: '🌍', source: 'Multiple Sources' },
    ];
  }

  // Get country display info
  static getCountryInfo(countryCode) {
    const countries = this.getSupportedCountries();
    return countries.find(c => c.code === countryCode) || countries.find(c => c.code === 'global');
  }

  // Debug method to show current locale info
  static getLocaleDebugInfo() {
    try {
      return {
        locales: Localization.locales,
        timezone: Localization.timezone,
        isoCurrencyCodes: Localization.isoCurrencyCodes,
        region: Localization.region,
        isRTL: Localization.isRTL,
        decimalSeparator: Localization.decimalSeparator,
        digitGroupingSeparator: Localization.digitGroupingSeparator,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}
