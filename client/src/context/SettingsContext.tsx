import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { PublicSettings } from '../types';
import {
  buildGeneralContactLink,
  buildProductEnquiryLink,
  buildPartyBagsEnquiryLink,
  buildOrderEnquiryLink,
  buildReferralShareMessage,
} from '../utils/whatsapp';

interface SettingsContextType {
  settings: PublicSettings;
  loading: boolean;
  getSetting: <T = any>(key: string, defaultValue: T) => T;
  buildWhatsAppUrl: (message?: string) => string;
  buildProductWhatsAppUrl: (options: {
    productName: string;
    variants?: Record<string, string>;
    pageUrl?: string;
    isCustom?: boolean;
  }) => string;
  buildPartyBagsWhatsAppUrl: (options?: {
    guestCount?: number | string;
    eventDate?: string;
    theme?: string;
  }) => string;
  buildOrderWhatsAppUrl: (options: { orderNumber: string; customerName?: string }) => string;
  buildReferralShareText: (options: { referralCode: string; inviteUrl: string }) => string;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings>({
    store_name: 'SoulTalk Pastry',
    store_address: '123 Baker Street, Bangsar, 59100 Kuala Lumpur, Malaysia',
    store_phone: '+60123456789',
    store_opening_hours: 'Tuesday - Sunday: 9:00 AM - 8:00 PM (Closed Mondays)',
    whatsapp_number: '60123456789',
    brand_primary_color: '#D4708F',
    brand_secondary_color: '#F5E6CC',
    currency_symbol: 'RM',
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/public/settings');
      if (res.data?.success && res.data?.data?.settings) {
        setSettings(res.data.data.settings);

        if (res.data.data.settings.brand_primary_color) {
          document.documentElement.style.setProperty(
            '--brand-primary',
            res.data.data.settings.brand_primary_color
          );
        }
      }
    } catch (err) {
      console.warn('Failed to fetch public settings, using fallback defaults', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSetting = <T = any,>(key: string, defaultValue: T): T => {
    if (settings && settings[key] !== undefined && settings[key] !== null) {
      return settings[key] as T;
    }
    return defaultValue;
  };

  const getPhone = () => getSetting<string>('whatsapp_number', '60123456789');
  const getStoreName = () => getSetting<string>('store_name', 'SoulTalk Pastry');

  const buildWhatsAppUrl = (message?: string): string => {
    if (!message) {
      return buildGeneralContactLink(getPhone(), getStoreName());
    }
    const cleanNumber = getPhone().replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const buildProductWhatsAppUrl = (options: {
    productName: string;
    variants?: Record<string, string>;
    pageUrl?: string;
    isCustom?: boolean;
  }) => {
    return buildProductEnquiryLink(getPhone(), options);
  };

  const buildPartyBagsWhatsAppUrl = (options?: {
    guestCount?: number | string;
    eventDate?: string;
    theme?: string;
  }) => {
    return buildPartyBagsEnquiryLink(getPhone(), options);
  };

  const buildOrderWhatsAppUrl = (options: { orderNumber: string; customerName?: string }) => {
    return buildOrderEnquiryLink(getPhone(), options);
  };

  const buildReferralShareText = (options: { referralCode: string; inviteUrl: string }) => {
    return buildReferralShareMessage({
      storeName: getStoreName(),
      referralCode: options.referralCode,
      inviteUrl: options.inviteUrl,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        getSetting,
        buildWhatsAppUrl,
        buildProductWhatsAppUrl,
        buildPartyBagsWhatsAppUrl,
        buildOrderWhatsAppUrl,
        buildReferralShareText,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
