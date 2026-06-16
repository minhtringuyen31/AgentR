enum BookingStatus {
  PENDING = 'pending',
  DONE = 'done',
  IN_PROCESS = 'in process',
  WAITING = 'waiting',
  CANCEL = 'cancel'
}

const bookingStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

export { BookingStatus, bookingStatusOptions };
