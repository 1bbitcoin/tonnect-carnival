import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import { supabase } from '@/integrations/supabase/client';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface Profile {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  referral_code: string;
  total_balance: number;
  created_at: string;
  photo_url?: string | null;
}

interface TelegramContextType {
  user: TelegramUser | null;
  profile: Profile | null;
  isLoading: boolean;
  initData: string;
  refetch: () => Promise<void>;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initData] = useState(WebApp.initData);

  const createOrGetProfile = async (telegramUser: TelegramUser, referrerId?: string) => {
    try {
      // Use edge function for secure profile creation
      const { data, error } = await supabase.functions.invoke('create-profile', {
        body: {
          telegram_user: telegramUser,
          referrer_telegram_id: referrerId
        }
      });

      if (error) throw error;
      
      return data.profile;
    } catch (error) {
      console.error('Error creating/getting profile');
      return null;
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      WebApp.ready();
      WebApp.expand();
      
      const telegramUser = WebApp.initDataUnsafe?.user;
      
      if (telegramUser) {
        setUser(telegramUser);
        
        // Extract referrer ID from start_param
        const startParam = WebApp.initDataUnsafe?.start_param;
        const referrerId = startParam?.replace('ref=', '');
        
        const userProfile = await createOrGetProfile(telegramUser, referrerId);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <TelegramContext.Provider value={{ user, profile, isLoading, initData, refetch: fetchProfile }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};
