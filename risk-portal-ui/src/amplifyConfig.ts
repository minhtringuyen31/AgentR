// src/amplifyConfig.js
import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: 'ap-southeast-1_jZx9xp2Xo',
            userPoolClientId: '687r0rdr5dc1dhhnrocv1og20l',
        }
    }
});

export default Amplify;
