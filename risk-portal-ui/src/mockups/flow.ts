import { FlowDesign } from '@/types/FlowData';
import { mockUsers } from './user';

export const mockFlowDesigns: FlowDesign[] = [
  {
    id: 'fd1',
    name: 'Welcome Flow',
    flow_data: {
      id: 'ft1',
      vendor: { id: 'v1', name: 'Vendor A' },
      title: 'New User Signup',
      desc: 'Triggers when a new user signs up',
      type: 'signup'
    },
    status: 'published',
    creator: {
      id: 'u1',
      role: { id: 'r1', roleName: 'Admin' },
      vendor: 'Vendor A',
      email: 'creator1@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      phoneNumber: '+123456789',
      dateOfBirth: '1990-01-01',
      gender: 'female',
      countryCode: 'US',
      avatar: 'https://example.com/avatar1.png',
      whatappId: 'wa1',
      subjectId: 'sub1',
      username: 'alice',
      position: 'Manager',
      teams: []
    },
    updated_by_user: mockUsers[0],
    updated_at: '2024-01-01T10:00:00Z',
    flow_enrollments: 120,
    last_enrollment: '2024-01-05T12:00:00Z'
  },
  {
    id: 'fd2',
    name: 'Abandoned Cart Reminder',
    flow_data: {
      id: 'ft2',
      vendor: { id: 'v2', name: 'Vendor B' },
      title: 'Cart Abandonment',
      desc: 'Sends a reminder for abandoned carts',
      type: 'cart'
    },
    status: 'draft',
    creator: {
      id: 'u2',
      role: { id: 'r2', roleName: 'Editor' },
      vendor: 'Vendor B',
      email: 'creator2@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      phoneNumber: '+987654321',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      countryCode: 'CA',
      avatar: 'https://example.com/avatar2.png',
      whatappId: 'wa2',
      subjectId: 'sub2',
      username: 'bob',
      position: 'Developer',
      teams: []
    },
    updated_by_user: mockUsers[1],
    updated_at: '2024-02-01T11:00:00Z',
    flow_enrollments: 250,
    last_enrollment: '2024-02-10T15:00:00Z'
  },
  {
    id: 'fd3',
    name: 'Birthday Greetings',
    flow_data: {
      id: 'ft3',
      vendor: { id: 'v1', name: 'Vendor A' },
      title: 'Birthday Campaign',
      desc: 'Sends birthday greetings to users',
      type: 'birthday'
    },
    status: 'active',
    creator: {
      id: 'u3',
      role: { id: 'r3', roleName: 'Viewer' },
      vendor: 'Vendor A',
      email: 'creator3@example.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      phoneNumber: '+1122334455',
      dateOfBirth: '1992-03-10',
      gender: 'non-binary',
      countryCode: 'UK',
      avatar: 'https://example.com/avatar3.png',
      whatappId: 'wa3',
      subjectId: 'sub3',
      username: 'charlie',
      position: 'Designer',
      teams: []
    },
    updated_by_user: mockUsers[1],
    updated_at: '2024-03-01T14:00:00Z',
    flow_enrollments: 300,
    last_enrollment: '2024-03-15T18:00:00Z'
  },
  {
    id: 'fd4',
    name: 'Feedback Request',
    flow_data: {
      id: 'ft4',
      vendor: { id: 'v3', name: 'Vendor C' },
      title: 'Post-Purchase Survey',
      desc: 'Triggers a feedback request after purchase',
      type: 'feedback'
    },
    status: 'active',
    creator: {
      id: 'u4',
      role: { id: 'r1', roleName: 'Admin' },
      vendor: 'Vendor C',
      email: 'creator4@example.com',
      firstName: 'Dana',
      lastName: 'Hill',
      phoneNumber: '+9988776655',
      dateOfBirth: '1988-11-20',
      gender: 'female',
      countryCode: 'AU',
      avatar: 'https://example.com/avatar4.png',
      whatappId: 'wa4',
      subjectId: 'sub4',
      username: 'dana',
      position: 'Analyst',
      teams: []
    },
    updated_by_user: mockUsers[1],
    updated_at: '2024-04-01T09:00:00Z',
    flow_enrollments: 500,
    last_enrollment: '2024-04-20T20:00:00Z'
  },
  {
    id: 'fd5',
    name: 'Re-Engagement Campaign',
    flow_data: {
      id: 'ft5',
      vendor: { id: 'v2', name: 'Vendor B' },
      title: 'Inactive Users',
      desc: 'Sends emails to re-engage inactive users',
      type: 'engagement'
    },
    status: 'inactive',
    creator: {
      id: 'u5',
      role: { id: 'r2', roleName: 'Editor' },
      vendor: 'Vendor B',
      email: 'creator5@example.com',
      firstName: 'Eve',
      lastName: 'Miller',
      phoneNumber: '+4433221100',
      dateOfBirth: '1995-07-30',
      gender: 'female',
      countryCode: 'NZ',
      avatar: 'https://example.com/avatar5.png',
      whatappId: 'wa5',
      subjectId: 'sub5',
      username: 'eve',
      position: 'Marketer',
      teams: []
    },
    updated_by_user: mockUsers[1],
    updated_at: '2024-05-01T13:00:00Z',
    flow_enrollments: 100,
    last_enrollment: '2024-05-10T19:00:00Z'
  },
  {
    id: 'fd6',
    name: 'Product Launch',
    flow_data: {
      id: 'ft6',
      vendor: { id: 'v3', name: 'Vendor C' },
      title: 'New Product Announcement',
      desc: 'Informs users about a new product launch',
      type: 'product'
    },
    status: 'active',
    creator: {
      id: 'u6',
      role: { id: 'r3', roleName: 'Viewer' },
      vendor: 'Vendor C',
      email: 'creator6@example.com',
      firstName: 'Frank',
      lastName: 'White',
      phoneNumber: '+5544332211',
      dateOfBirth: '1993-09-25',
      gender: 'male',
      countryCode: 'IN',
      avatar: 'https://example.com/avatar6.png',
      whatappId: 'wa6',
      subjectId: 'sub6',
      username: 'frank',
      position: 'Developer',
      teams: []
    },
    updated_by_user: mockUsers[1],
    updated_at: '2024-06-01T16:00:00Z',
    flow_enrollments: 700,
    last_enrollment: '2024-06-15T22:00:00Z'
  }
];
