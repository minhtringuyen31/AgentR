import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { getContactBookings, getContactDetails } from '@/services/apis/Contact/contactService';
import { IContact } from '@/types/Contact';
import { useParams } from 'react-router-dom';
import { Booking } from '@/types/BookingData';
import { PaginationState } from '@tanstack/react-table';

interface IContactDetailsContext {
  isLoading: boolean;
  isError: boolean;
  contactData: IContact | null;
  bookingData: Booking[] | null;
  bookingPagination: PaginationState;
  setBookingPagination: Dispatch<SetStateAction<PaginationState>>;
  bookingSearchKw: string;
  setBookingSearchKw: Dispatch<SetStateAction<string>>;
}

const defaultBookingPagination = { pageIndex: 0, pageSize: 10 };

const ContactDetailsContext = createContext<IContactDetailsContext>({
  isLoading: false,
  isError: false,
  contactData: null,
  bookingData: null,
  bookingPagination: defaultBookingPagination,
  setBookingPagination: () => {},
  bookingSearchKw: '',
  setBookingSearchKw: () => {}
});

const ContactDetailsProvider = ({ children }: { children: ReactNode }) => {
  const { contactId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [contactData, setContactData] = useState<IContact | null>(null);
  const [bookingData, setBookingData] = useState<Booking[] | null>(null);
  const [bookingPagination, setBookingPagination] =
    useState<PaginationState>(defaultBookingPagination);
  const [bookingSearchKw, setBookingSearchKw] = useState('');

  const contactFetcher = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      if (!contactId) throw new Error('Contact ID not found');

      const response = await getContactDetails(contactId);
      setContactData(response.data);
    } catch (error) {
      console.error('Error in fetcher', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  const bookingFetcher = useCallback(async () => {
    try {
      if (!contactData?.id) return;

      const response = await getContactBookings({
        contactId: contactData.id,
        page: bookingPagination.pageIndex + 1,
        limit: bookingPagination.pageSize,
        search: bookingSearchKw
      });
      setBookingData(response.data.results);
    } catch (error) {
      console.error('Error in fetcher', error);
    }
  }, [bookingPagination.pageIndex, bookingPagination.pageSize, bookingSearchKw, contactData?.id]);

  useEffect(() => {
    bookingFetcher();
  }, [bookingFetcher]);

  useEffect(() => {
    contactFetcher();
  }, [contactFetcher]);

  return (
    <ContactDetailsContext.Provider
      value={{
        isLoading,
        isError,
        contactData,
        bookingData,
        setBookingSearchKw,
        bookingSearchKw,
        bookingPagination,
        setBookingPagination
      }}
    >
      {children}
    </ContactDetailsContext.Provider>
  );
};

const useContactDetailsContext = () => {
  const context = useContext(ContactDetailsContext);
  if (!context) {
    throw new Error('useContactDetails must be used within a ContactDetailsProvider');
  }
  return context;
};

export { ContactDetailsProvider, useContactDetailsContext };
