import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { IPaginatedContactListsResponse } from '@/types/ContactList';
import { useMutateContactList } from '@/hooks/useMutateContactList';
import { useQueryContactList } from '@/hooks/useQueryContactList';
// import { toast } from 'react-toastify';

interface IContactContext {
  contactListsData?: IPaginatedContactListsResponse;
  revalidateContactLists: () => void;
  isCreateListModalOpen: boolean;
  setIsCreateListModalOpen: (isOpen: boolean) => void;
  createContactList: (name: string) => Promise<boolean>;
}

interface ContactProviderProps {
  children: ReactNode;
}

const ContactContext = createContext<IContactContext>({
  revalidateContactLists: () => {},
  isCreateListModalOpen: false,
  setIsCreateListModalOpen: () => {},
  createContactList: async () => false
});

const ContactProvider: FC<ContactProviderProps> = ({ children }) => {
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const { contactListsData, revalidate } = useQueryContactList({
    page: 1,
    limit: 100,
    searchKeyword: ''
  });
  const { createList } = useMutateContactList();
  const createContactList = async (name: string) => {
    try {
      await createList({ name });
      // toast.success('List created successfully');
      revalidate();
      return true;
    } catch (error) {
      // toast.error('Failed to create list');
      console.error(error);
      return false;
    }
  };

  return (
    <ContactContext.Provider
      value={{
        contactListsData,
        revalidateContactLists: revalidate,
        isCreateListModalOpen,
        setIsCreateListModalOpen,
        createContactList
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

const useContactContext = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContactContext must be used within a ContactProvider');
  }
  return context;
};

export { ContactContext, ContactProvider, useContactContext };
