export const routes = {
  signin: '/signin',
  signup: '/signup',
  onboardingTour: '/onboarding-tour',
  home: '/',
  userManagement: '/user-management',
  teamList: '/user-management/team-list',
  masterCalendar: '/master-calendar',
  eventOverview: '/master-calendar/event-overview',
  dateEvent: (date: string) => `/master-calendar/date-event/${date}`,
  inbox: '/inbox',
  customFlow: '/custom-flow',
  flowBuilder: (flowName: string) => `/custom-flow/${flowName}`,
  contact: '/contacts',
  myContacts: '/contacts/my-contacts',
  contactDetail: (contactId: string) => `/contacts/${contactId}`,
  contactList: '/contacts/lists',
  contactListDetail: (listId: string) => `/contacts/lists/${listId}`
};
