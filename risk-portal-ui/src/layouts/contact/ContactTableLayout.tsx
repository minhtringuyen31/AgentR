import { Card, CardBody, KeenIcon } from '@/components';
import { FC, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useContactContext } from './ContactPageProvider';
import { ModalCreateList } from '@/partials/modals/contact';
import { mockContactLists } from '@/mockups/contactList';
import clsx from 'clsx';
import { SearchInput } from '@/components/forms';
import { routes } from '@/constants';

const contactPages = [
  {
    name: 'All Contacts',
    path: '/contacts'
  },
  {
    name: 'My Contacts',
    path: '/contacts/my-contacts'
  }
];

const ContactTableLayout: FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="w-full flex gap-4 p-4">
      <div className="w-1/5 flex flex-col text-gray-600 gap-4">
        <Card>
          <Card.Body>
            <div className="p-4">
              <h4 className="font-semibold text-3sm text-dark">Contacts</h4>

              <ul className="mt-2">
                {contactPages.map((page) => (
                  <li className="p-2" key={page.path}>
                    <Link
                      key={page.path}
                      to={page.path}
                      className={`hover:text-blue-400 font-medium ${
                        page.path === pathname ? 'text-blue-400' : ''
                      }`}
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card.Body>
        </Card>
        <ContactLists />
      </div>
      <div className="w-4/5 flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

const ContactLists: FC = () => {
  const { pathname } = useLocation();
  const [searchKeyword, setSearchKeyword] = useState('');
  const {
    contactListsData,
    isCreateListModalOpen,
    setIsCreateListModalOpen,
    revalidateContactLists
  } = useContactContext();
  const contactLists = useMemo(() => {
    const data = contactListsData?.results || [];
    // const data = mockContactLists;
    if (searchKeyword) {
      return data.filter((list) => list.name.toLowerCase().includes(searchKeyword.toLowerCase()));
    }
    return data;
  }, [contactListsData?.results, searchKeyword]);
  // const contactLists = contactListsData?.results || [];

  const openCreateListModal = () => {
    setIsCreateListModalOpen(true);
  };

  const closeCreateListModal = () => {
    setIsCreateListModalOpen(false);
  };

  return (
    <Card>
      <CardBody>
        <div className="p-4">
          <div className="flex flex-col justify-center items-center">
            <button
              onClick={openCreateListModal}
              className="flex items-center text-2sm mb-2 text-blue-500 rounded hover:bg-gray-200"
            >
              <KeenIcon className="mr-2" icon="plus" />
              <span className="font-semibold text-3sm">Create List</span>
            </button>
            <div className="w-full mt-2">
              <SearchInput onChange={(e) => setSearchKeyword(e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <h4 className="font-semibold text-3sm text-dark">Lists</h4>
            {/* <button
          className="text-blue-400 flex items-center font-medium"
          onClick={openCreateListModal}
        >
          <KeenIcon icon="plus" />
          <span>Create</span>
        </button> */}
            <Link
              to={routes.contactList}
              className={clsx('hover:text-blue-400 font-medium text-xs', {
                'text-blue-400': pathname === '/contacts/lists'
              })}
            >
              View all
            </Link>
          </div>
          <h5 className="mt-3 text-sm font-normal">Total {contactLists.length} lists</h5>
          <ul className="mt-2 px-2 space-y-2">
            {contactLists.map((list) => (
              <li key={list.id}>
                <Link
                  key={list.id}
                  to={`/contacts/lists/${list.id}`}
                  className={clsx('hover:text-blue-400 font-medium', {
                    'text-blue-400': pathname === `/contacts/lists/${list.id}`
                  })}
                >
                  {list.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
      <ModalCreateList
        isOpen={isCreateListModalOpen}
        onClose={closeCreateListModal}
        onCreateSuccess={revalidateContactLists}
      />
    </Card>
  );
};

export { ContactTableLayout };
