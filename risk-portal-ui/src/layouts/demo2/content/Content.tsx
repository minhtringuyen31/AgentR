import { Outlet } from 'react-router';

const Content = () => {
  return (
    <main className="grow" role="content">
      <Outlet />
    </main>
  );
};

export { Content };
