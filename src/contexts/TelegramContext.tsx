import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import { supabase } from '@/integrations/supabase/client';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
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
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .maybeSingle();

      if (existingProfile) {
        return existingProfile;
      }

      // Create new profile
      const referralCode = `REF${telegramUser.id}`;
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          telegram_id: telegramUser.id,
          username: telegramUser.username || null,
          first_name: telegramUser.first_name || null,
          last_name: telegramUser.last_name || null,
          referral_code: referralCode,
          total_balance: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Handle referral if exists
      if (referrerId && newProfile) {
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', parseInt(referrerId))
          .maybeSingle();

        if (referrerProfile) {
          // Create referral record
          await supabase
            .from('referrals')
            .insert({
              referrer_id: referrerProfile.id,
              referred_id: newProfile.id,
              bonus_awarded: 100
            });

          // Update referrer balance
          await supabase
            .from('profiles')
            .update({ total_balance: referrerProfile.total_balance + 100 })
            .eq('id', referrerProfile.id);
        }
      }

      return newProfile;
    } catch (error) {
      console.error('Error creating/getting profile:', error);
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
