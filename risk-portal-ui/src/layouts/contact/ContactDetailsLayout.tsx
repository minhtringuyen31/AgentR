import { KeenIcon, ModalWarning } from '@/components';
import { useMutateContact } from '@/hooks';
import { Tabs, TabsProps } from 'antd';
import { FC, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { ContactDetailsProvider, useContactDetailsContext } from './ContactDetailsProvider';
import { useSnackbar } from 'notistack';

const ContactDetailsLayoutContent: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { contactId } = useParams();
  const { deleteContact } = useMutateContact();
  const { isLoading, isError, contactData: data } = useContactDetailsContext();
  const navigate = useNavigate();
  const [isOpenModalWarning, setIsOpenModalWarning] = useState(false);
  const pathName = window.location.pathname;
  const currentTabKey = pathName.split('/').pop();

  const tabs: TabsProps['items'] = [
    {
      id: '1',
      key: '',
      label: 'Profile'
    },
    {
      id: '2',
      key: 'booking',
      label: 'Booking'
    }
  ];

  const confirmDeleteContact = async () => {
    if (contactId) {
      try {
        await deleteContact(contactId);
        enqueueSnackbar('Contact deleted successfully', { variant: 'success' });
        navigate('/contacts');
      } catch (err) {
        console.error('Error in confirmDeleteContact', err);
        enqueueSnackbar('Failed to delete contact', { variant: 'error' });
      }
    }
  };

  if (!contactId) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Contact Not Found</h1>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 flex justify-center items-center">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Error Fetching Contact</h1>
      </div>
    );
  }

  const renderAvatar = () => {
    const firstLetters = getNameFirstLetters(data?.name);
    return (
      <div className="bg-slate-500 rounded-full p-2 w-24 h-24 flex justify-center items-center">
        <span className="text-3xl font-bold text-white">{firstLetters}</span>
      </div>
    );
  };

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <DefaultTabBar {...props} />
  );

  const operations = (
    <div className="flex gap-2 items-center text-xl">
      <Link
        to={`/inbox`}
        className="bg-blue-500 p-2 rounded-md border flex gap-1 text-white text-md items-center"
      >
        <KeenIcon icon="message-text-2" />
        <span>Chat</span>
      </Link>
      <a href={`mailto:${data?.email}`} className="p-2 rounded-md border px-4">
        <KeenIcon icon="sms" />
      </a>
      <button className="p-2 rounded-md border px-4" onClick={() => setIsOpenModalWarning(true)}>
        <KeenIcon icon="trash" />
      </button>
    </div>
  );

  const handleChangeTab = (key: string) => navigate(`/contacts/${contactId}/${key}`);

  return (
    <div>
      {/* Avatar and name */}
      <div className="flex flex-col justify-between items-center gap-2 py-4">
        {renderAvatar()}
        <h1 className="text-2xl font-semibold">{data?.name}</h1>
      </div>

      <Tabs
        defaultActiveKey="1"
        renderTabBar={renderTabBar}
        activeKey={tabs.find((tab) => tab.key === currentTabKey)?.key}
        items={tabs}
        size="large"
        className="px-6"
        tabBarExtraContent={operations}
        onChange={handleChangeTab}
      />

      {/* Content */}
      <div className="p-4">
        <Outlet />
      </div>
      <ModalWarning
        content={{
          title: 'Delete Contact',
          description: 'Are you sure you want to delete this contact?'
        }}
        action={confirmDeleteContact}
        isOpen={isOpenModalWarning}
        onClose={() => setIsOpenModalWarning(false)}
      />
    </div>
  );
};

const ContactDetailsLayout: FC = () => (
  <ContactDetailsProvider>
    <ContactDetailsLayoutContent />
  </ContactDetailsProvider>
);

export { ContactDetailsLayout };
