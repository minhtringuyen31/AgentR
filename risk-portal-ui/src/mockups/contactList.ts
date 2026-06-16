import { IContactList } from '@/types/ContactList';

export const mockContactLists: IContactList[] = [
  {
    id: 'cl1',
    name: 'Potential Clients',
    contacts_count: 150,
    user: {
      id: 'u1',
      role: { id: 'r1', roleName: 'Admin' },
      vendor: 'VendorA',
      email: 'admin1@vendora.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      dateOfBirth: '1980-05-15',
      gender: 'Male',
      countryCode: 'US',
      avatar: 'https://example.com/avatar1.png',
      whatappId: 'whatsapp-id-1',
      subjectId: 'subject-id-1',
      username: 'johndoe',
      position: 'Team Lead',
      teams: [
        { id: 't1', name: 'Engineering', vendor: 'VendorA', user_count: 10 },
        { id: 't3', name: 'Marketing', vendor: 'VendorB', user_count: 8 }
      ]
    },
    created_at: '2023-12-01T10:15:00Z'
  },
  {
    id: 'cl2',
    name: 'Newsletter Subscribers',
    contacts_count: 85,
    user: {
      id: 'u2',
      role: { id: 'r2', roleName: 'Manager' },
      vendor: 'VendorB',
      email: 'manager1@vendorb.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '9876543210',
      dateOfBirth: '1990-08-22',
      gender: 'Female',
      countryCode: 'UK',
      avatar: 'https://example.com/avatar2.png',
      whatappId: 'whatsapp-id-2',
      subjectId: 'subject-id-2',
      username: 'janesmith',
      position: 'Manager',
      teams: [
        { id: 't2', name: 'Support', vendor: 'VendorA', user_count: 5 },
        { id: 't4', name: 'Customer Care', vendor: 'VendorC', user_count: 20 }
      ]
    },
    created_at: '2023-11-15T14:45:00Z'
  },
  {
    id: 'cl3',
    name: 'Event Attendees',
    contacts_count: 200,
    user: {
      id: 'u3',
      role: { id: 'r3', roleName: 'Support' },
      vendor: 'VendorC',
      email: 'support1@vendorc.com',
      firstName: 'Alice',
      lastName: 'Brown',
      phoneNumber: '5551234567',
      dateOfBirth: '1985-03-10',
      gender: 'Female',
      countryCode: 'CA',
      avatar: 'https://example.com/avatar3.png',
      whatappId: 'whatsapp-id-3',
      subjectId: 'subject-id-3',
      username: 'alicebrown',
      position: 'Customer Support',
      teams: [
        { id: 't5', name: 'Development', vendor: 'VendorD', user_count: 15 },
        { id: 't6', name: 'QA', vendor: 'VendorD', user_count: 6 }
      ]
    },
    created_at: '2023-10-20T09:30:00Z'
  },
  {
    id: 'cl4',
    name: 'Potential Clients 2',
    contacts_count: 150,
    user: {
      id: 'u1',
      role: { id: 'r1', roleName: 'Admin' },
      vendor: 'VendorA',
      email: 'admin1@vendora.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      dateOfBirth: '1980-05-15',
      gender: 'Male',
      countryCode: 'US',
      avatar: 'https://example.com/avatar1.png',
      whatappId: 'whatsapp-id-1',
      subjectId: 'subject-id-1',
      username: 'johndoe',
      position: 'Team Lead',
      teams: [
        { id: 't1', name: 'Engineering', vendor: 'VendorA', user_count: 10 },
        { id: 't3', name: 'Marketing', vendor: 'VendorB', user_count: 8 }
      ]
    },
    created_at: '2023-12-01T10:15:00Z'
  },
  {
    id: 'cl5',
    name: 'Newsletter Subscribers 2',
    contacts_count: 85,
    user: {
      id: 'u2',
      role: { id: 'r2', roleName: 'Manager' },
      vendor: 'VendorB',
      email: 'manager1@vendorb.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '9876543210',
      dateOfBirth: '1990-08-22',
      gender: 'Female',
      countryCode: 'UK',
      avatar: 'https://example.com/avatar2.png',
      whatappId: 'whatsapp-id-2',
      subjectId: 'subject-id-2',
      username: 'janesmith',
      position: 'Manager',
      teams: [
        { id: 't2', name: 'Support', vendor: 'VendorA', user_count: 5 },
        { id: 't4', name: 'Customer Care', vendor: 'VendorC', user_count: 20 }
      ]
    },
    created_at: '2023-11-15T14:45:00Z'
  },
  {
    id: 'cl6',
    name: 'Event Attendees 2',
    contacts_count: 200,
    user: {
      id: 'u3',
      role: { id: 'r3', roleName: 'Support' },
      vendor: 'VendorC',
      email: 'support1@vendorc.com',
      firstName: 'Alice',
      lastName: 'Brown',
      phoneNumber: '5551234567',
      dateOfBirth: '1985-03-10',
      gender: 'Female',
      countryCode: 'CA',
      avatar: 'https://example.com/avatar3.png',
      whatappId: 'whatsapp-id-3',
      subjectId: 'subject-id-3',
      username: 'alicebrown',
      position: 'Customer Support',
      teams: [
        { id: 't5', name: 'Development', vendor: 'VendorD', user_count: 15 },
        { id: 't6', name: 'QA', vendor: 'VendorD', user_count: 6 }
      ]
    },
    created_at: '2023-10-20T09:30:00Z'
  }
];
