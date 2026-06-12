const API_BASE_URL = 'http://localhost:8280/api';

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  maxCapacity?: number;
  hostEmail: string;
  status: 'DRAFT' | 'OPEN_FOR_RSVPS' | 'LOCKED' | 'CLOSED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface Invitee {
  id: number;
  eventId: number;
  email: string;
  uniqueToken: string;
}

export interface RSVP {
  id: number;
  inviteeId: number;
  eventId: number;
  email: string;
  status: 'YES' | 'NO' | 'MAYBE' | 'WAITLISTED';
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  event: Event;
  yesCount: number;
  noCount: number;
  maybeCount: number;
  waitlistCount: number;
  attendees: RSVP[];
}

// Event API calls
export const createEvent = async (eventData: {
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  maxCapacity?: number;
  hostEmail: string;
}): Promise<Event> => {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Failed to create event');
  return response.json();
};

export const getEvent = async (eventId: number): Promise<Event> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
  if (!response.ok) throw new Error('Failed to get event');
  return response.json();
};

export const inviteAttendees = async (eventId: number, emails: string[]): Promise<Invitee[]> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  });
  if (!response.ok) throw new Error('Failed to invite attendees');
  return response.json();
};

export const getInvitees = async (eventId: number, hostEmail: string): Promise<Invitee[]> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/invitees?hostEmail=${encodeURIComponent(hostEmail)}`);
  if (!response.ok) throw new Error('Failed to get invitees');
  return response.json();
};

export const cancelEvent = async (eventId: number, hostEmail: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/cancel?hostEmail=${hostEmail}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to cancel event');
};

export const closeEvent = async (eventId: number, hostEmail: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/close?hostEmail=${hostEmail}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to close event');
};

export const getDashboard = async (eventId: number, hostEmail: string): Promise<Dashboard> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/dashboard?hostEmail=${hostEmail}`);
  if (!response.ok) throw new Error('Failed to get dashboard');
  return response.json();
};

// RSVP API calls
export const respondToRSVP = async (
  token: string,
  status: 'YES' | 'NO' | 'MAYBE'
): Promise<RSVP> => {
  const response = await fetch(`${API_BASE_URL}/rsvp/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to respond to RSVP');
  return response.json();
};

export const getRSVP = async (token: string): Promise<RSVP> => {
  const response = await fetch(`${API_BASE_URL}/rsvp/${token}`);
  if (!response.ok) throw new Error('Failed to get RSVP');
  return response.json();
};

export const updateRSVP = async (
  token: string,
  status: 'YES' | 'NO' | 'MAYBE'
): Promise<RSVP> => {
  const response = await fetch(`${API_BASE_URL}/rsvp/${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update RSVP');
  return response.json();
};
