import { FC, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ContactProvider } from './ContactPageProvider';
import { fetchAuthSession, signIn } from 'aws-amplify/auth';

const ContactLayout: FC = () => {
  // test login
  // useEffect(() => {
  //   (async () => {
  //     const username = 'admin111';
  //     const password = 'Leomintofris@10';
  //     await signIn({ username, password });

  //     const session = await fetchAuthSession();

  //     // Retrieve tokens
  //     const accessToken = session.tokens?.accessToken.toString() ?? '';
  //     const idToken = session.tokens?.idToken?.toString() ?? '';

  //     localStorage.setItem('idToken', idToken);
  //     localStorage.setItem('accessToken', accessToken);
  //     localStorage.setItem('username', 'admin111');
  //   })();
  // }, []);

  return (
    <ContactProvider>
      <Outlet />
    </ContactProvider>
  );
};

export { ContactLayout };
