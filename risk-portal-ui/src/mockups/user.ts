import { IUser } from '@/types/User';

export const mockUsers: IUser[] = [
  {
    id: 'u1',
    role: {
      id: 'r1',
      roleName: 'Admin'
    },
    vendor: 'VendorA',
    email: 'admin.vendorA@example.com',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '+123456789',
    dateOfBirth: '1985-06-01',
    gender: 'Male',
    countryCode: '+1',
    avatar: 'avatar1.png',
    whatappId: 'whatsapp001',
    subjectId: 'subj001',
    username: 'adminUser',
    position: 'Administrator',
    teams: [
      {
        id: 't1',
        name: 'Engineering',
        vendor: 'VendorA',
        user_count: 10
      },
      {
        id: 't2',
        name: 'Support',
        vendor: 'VendorA',
        user_count: 5
      }
    ]
  },
  {
    id: 'u2',
    role: {
      id: 'r2',
      roleName: 'Manager'
    },
    vendor: 'VendorB',
    email: 'manager.vendorB@example.com',
    firstName: 'Alex',
    lastName: 'Manager',
    phoneNumber: '+987654321',
    dateOfBirth: '1980-04-20',
    gender: 'Female',
    countryCode: '+44',
    avatar: 'avatar2.png',
    whatappId: 'whatsapp002',
    subjectId: 'subj002',
    username: 'managerAlex',
    position: 'Team Manager',
    teams: [
      {
        id: 't3',
        name: 'Marketing',
        vendor: 'VendorB',
        user_count: 8
      }
    ]
  },
  {
    id: 'u3',
    role: {
      id: 'r3',
      roleName: 'Support'
    },
    vendor: 'VendorC',
    email: 'support.vendorC@example.com',
    firstName: 'Support',
    lastName: 'Agent',
    phoneNumber: '+8001234567',
    dateOfBirth: '1995-08-15',
    gender: 'Non-Binary',
    countryCode: '+91',
    avatar: 'avatar3.png',
    whatappId: 'whatsapp003',
    subjectId: 'subj003',
    username: 'supportAgent',
    position: 'Customer Support',
    teams: [
      {
        id: 't4',
        name: 'Customer Care',
        vendor: 'VendorC',
        user_count: 20
      }
    ]
  },
  {
    id: 'u4',
    role: {
      id: 'r4',
      roleName: 'Developer'
    },
    vendor: 'VendorD',
    email: 'dev.vendorD@example.com',
    firstName: 'Chris',
    lastName: 'Dev',
    phoneNumber: '+1122334455',
    dateOfBirth: '1992-01-15',
    gender: 'Male',
    countryCode: '+33',
    avatar: 'avatar4.png',
    whatappId: 'whatsapp004',
    subjectId: 'subj004',
    username: 'devChris',
    position: 'Backend Developer',
    teams: [
      {
        id: 't5',
        name: 'Development',
        vendor: 'VendorD',
        user_count: 15
      },
      {
        id: 't6',
        name: 'QA',
        vendor: 'VendorD',
        user_count: 6
      }
    ]
  },
  {
    id: 'u5',
    role: {
      id: 'r5',
      roleName: 'QA Engineer'
    },
    vendor: 'VendorE',
    email: 'qa.vendorE@example.com',
    firstName: 'QA',
    lastName: 'Engineer',
    phoneNumber: '+1122334455',
    dateOfBirth: '1992-01-15',
    gender: 'Male',
    countryCode: '+33',
    avatar: 'avatar5.png',
    whatappId: 'whatsapp005',
    subjectId: 'subj005',
    username: 'qaEngineer',
    position: 'QA Engineer',
    teams: [
      {
        id: 't7',
        name: 'QA',
        vendor: 'VendorE',
        user_count: 6
      }
    ]
  },
  {
    id: 'u6',
    role: {
      id: 'r6',
      roleName: 'QA Engineer'
    },
    vendor: 'VendorE',
    email: 'qa.vendorE@example.com',
    firstName: 'QA',
    lastName: 'Engineer',
    phoneNumber: '+1122334455',
    dateOfBirth: '1992-01-15',
    gender: 'Male',
    countryCode: '+33',
    avatar: 'avatar5.png',
    whatappId: 'whatsapp005',
    subjectId: 'subj005',
    username: 'qaEngineer',
    position: 'QA Engineer',
    teams: [
      {
        id: 't7',
        name: 'QA',
        vendor: 'VendorE',
        user_count: 6
      }
    ]
  }
];
