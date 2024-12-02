import { toast } from 'react-toastify';

import axios from 'axios';
import { create } from 'zustand';
import { ENV } from '~/app_config/app.config';
import { FacebookTokenStatus } from '~/emuns/faceBookTokenStatus';
import { ZustandDefaultStore } from '~/types/general/zustand.default.store';

interface IFacebookStore extends ZustandDefaultStore {
  facebookTokenStatus: FacebookTokenStatus;
  fbTokenExpiresSoon: boolean;
  validateFBAccessToken: (token: string | null) => Promise<void>;
  refreshFBLongLiveToken: (token: string | null) => Promise<void>;
}

const facebookAppSecret = ENV.FACEBOOK_APP_SECRET;
const facebookAppId = ENV.FACEBOOK_APP_ID;

export const useFacebookStore = create<IFacebookStore>((set, get) => ({
  facebookTokenStatus: FacebookTokenStatus.unchecked,
  fbTokenExpiresSoon: false,
  loading: false,
  error: null,

  refreshFBLongLiveToken: async (token: string | null) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/v16.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: facebookAppId,
          client_secret: facebookAppSecret,
          fb_exchange_token: token,
        },
      });

      const { access_token: newToken } = response.data;

      if (newToken) {
        localStorage.setItem('facebook_token', newToken);

        set({ fbTokenExpiresSoon: false });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        'Unknown error updating Facebook token';
      toast.error(errorMessage);

      set({
        facebookTokenStatus: FacebookTokenStatus.expired,
        error: errorMessage,
      });
    }
  },

  validateFBAccessToken: async (token: string | null) => {
    try {
      set({ loading: true });

      const response = await axios.get(`https://graph.facebook.com/debug_token`, {
        params: {
          input_token: token,
          access_token: token,
        },
      });

      const tokenData = response.data.data;
      const expirationTime = tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : null;

      if (tokenData.is_valid) {
        // do refresh if 1 day was left to token expiration
        if (expirationTime && expirationTime.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
          await get().refreshFBLongLiveToken(token);
        }

        // set expires token soon flag if its 5 days to token expiration
        if (expirationTime && expirationTime.getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000) {
          set({ fbTokenExpiresSoon: true });
        }

        set({
          facebookTokenStatus: FacebookTokenStatus.live,
          loading: false,
        });
      } else {
        set({
          facebookTokenStatus: FacebookTokenStatus.expired,
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      set({
        loading: false,
        error: errorMessage,
        facebookTokenStatus: FacebookTokenStatus.expired,
      });
    }
  },
}));
