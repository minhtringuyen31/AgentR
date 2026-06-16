import { useEffect, useCallback, FC } from 'react';
import { KeenIcon } from '../keenicons';
import { Button } from '../button';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

const APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID; // Replace with your app ID
const CONFIG_ID = import.meta.env.VITE_FACEBOOK_CONFIG_ID; // Replace with your config ID;

const FacebookOnboarding: FC = () => {
  // TODO: Use custom hook for api call
  const startOnboarding = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch('/api/start-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessToken })
      });
      const result = await response.json();
      alert('Onboarding started: ' + result.message);
    } catch (error) {
      console.error('Error in startOnboarding', error);
      alert('Failed to start onboarding.');
    }
  }, []);

  useEffect(() => {
    // Load the Facebook SDK script
    (function (d, s, id) {
      const fjs: any = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js: any = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');

    // Initialize the Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID, // Replace with your app ID
        xfbml: true,
        version: 'v20.0'
      });

      document.getElementById('onboard-button')?.addEventListener('click', () => {
        window.FB.login(
          (response: any) => {
            if (response.authResponse) {
              console.log('Welcome! Fetching your information...');
              window.FB.api('/me', (userInfo: any) => {
                console.log('Good to see you, ' + userInfo.name + '.');
                startOnboarding(response.authResponse.accessToken);
              });
            } else {
              console.log('User cancelled login or did not fully authorize.');
            }
          },
          { scope: 'business_management,whatsapp_business_messaging' }
        );
      });
    };
  }, [startOnboarding]);

  function launchWhatsAppSignup() {
    console.log('Launching Facebook login');
    // Conversion tracking code

    // Launch Facebook login
    window.FB?.login(
      function (response: any) {
        if (response.authResponse) {
          const code = response.authResponse.code;
          console.log('Code: ', code);
          // The returned code must be transmitted to your backend,
          // which will perform a server-to-server call from there to our servers for an access token
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      {
        config_id: CONFIG_ID, // configuration ID goes here
        response_type: 'code', // must be set to 'code' for System User access token
        override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
        extras: {
          setup: {}
        }
      }
    );
  }

  return (
    <Button
      onClick={launchWhatsAppSignup}
      className="flex flex-nowrap justify-center items-center p-2 rounded-md gap-2"
    >
      {/* <FiPlusSquare className="text-white text-lg" /> */}
      <KeenIcon icon="plus" className="text-white text-lg" />
      <p className="text-white text-3sm">Connect</p>
    </Button>
  );
};

export { FacebookOnboarding };
