import { IEvent } from '@/types/Event';

export const mockEvents: IEvent[] = [
  {
    id: 'event1',
    user: {
      id: 'user1',
      role: { id: 'role1', roleName: 'Admin' },
      vendor: { id: 'vendor1', name: 'Vendor A' },
      email: 'admin@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      avatar: 'https://example.com/avatar1.png'
    },
    contact: 'contact1',
    team: {
      id: 'team1',
      name: 'Team Alpha',
      vendor: 'Vendor A'
    },
    category: { id: 'category1', title: 'Meeting' },
    title: 'Project Kickoff',
    description: 'Initial project kickoff meeting with stakeholders.',
    status: 'done',
    start_at: '2024-12-12T10:00:00Z',
    end_at: '2024-12-12T12:00:00Z'
  },
  {
    id: 'event2',
    user: {
      id: 'user2',
      role: { id: 'role2', roleName: 'Editor' },
      vendor: { id: 'vendor2', name: 'Vendor B' },
      email: 'editor@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      avatar: 'https://example.com/avatar2.png'
    },
    contact: 'contact2',
    team: {
      id: 'team2',
      name: 'Team Beta',
      vendor: 'Vendor B'
    },
    category: { id: 'category2', title: 'Workshop' },
    title: 'Skill Development Workshop',
    description: 'Interactive workshop on improving team skills.',
    status: 'pending',
    start_at: '2024-12-13T14:00:00Z',
    end_at: '2024-12-13T16:00:00Z'
  },
  {
    id: 'event3',
    user: {
      id: 'user3',
      role: { id: 'role3', roleName: 'Viewer' },
      vendor: { id: 'vendor1', name: 'Vendor A' },
      email: 'viewer@example.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      avatar: 'https://example.com/avatar3.png'
    },
    contact: 'contact3',
    team: {
      id: 'team1',
      name: 'Team Alpha',
      vendor: 'Vendor A'
    },
    category: { id: 'category3', title: 'Webinar' },
    title: 'Monthly Webinar',
    description: 'Monthly webinar on market trends and updates.',
    status: 'cancel',
    start_at: '2024-11-10T09:00:00Z',
    end_at: '2024-11-10T11:00:00Z'
  },
  {
    id: 'event4',
    user: {
      id: 'user4',
      role: { id: 'role1', roleName: 'Admin' },
      vendor: { id: 'vendor3', name: 'Vendor C' },
      email: 'admin2@example.com',
      firstName: 'Dana',
      lastName: 'Hill',
      avatar: 'https://example.com/avatar4.png'
    },
    contact: 'contact4',
    team: {
      id: 'team3',
      name: 'Team Gamma',
      vendor: 'Vendor C'
    },
    category: { id: 'category1', title: 'Meeting' },
    title: 'Client Discussion',
    description: 'Discussion with clients about project progress.',
    status: 'in process',
    start_at: '2024-12-15T15:00:00Z',
    end_at: '2024-12-15T17:00:00Z'
  },
  {
    id: 'event5',
    user: {
      id: 'user5',
      role: { id: 'role2', roleName: 'Editor' },
      vendor: { id: 'vendor2', name: 'Vendor B' },
      email: 'editor2@example.com',
      firstName: 'Eve',
      lastName: 'Miller',
      avatar: 'https://example.com/avatar5.png'
    },
    contact: 'contact5',
    team: {
      id: 'team2',
      name: 'Team Beta',
      vendor: 'Vendor B'
    },
    category: { id: 'category2', title: 'Workshop' },
    title: 'Product Training',
    description: 'Training on new product features and usage.',
    status: 'confirmed',
    start_at: '2024-12-20T10:00:00Z',
    end_at: '2024-12-20T12:00:00Z'
  },
  {
    id: 'event6',
    user: {
      id: 'user6',
      role: { id: 'role3', roleName: 'Viewer' },
      vendor: { id: 'vendor1', name: 'Vendor A' },
      email: 'viewer2@example.com',
      firstName: 'Frank',
      lastName: 'White',
      avatar: 'https://example.com/avatar6.png'
    },
    contact: 'contact6',
    team: {
      id: 'team1',
      name: 'Team Alpha',
      vendor: 'Vendor A'
    },
    category: { id: 'category3', title: 'Webinar' },
    title: 'Year-End Summary',
    description: 'Webinar summarizing yearly achievements and plans.',
    status: 'pending',
    start_at: '2024-12-31T18:00:00Z',
    end_at: '2024-12-31T20:00:00Z'
  }
];
