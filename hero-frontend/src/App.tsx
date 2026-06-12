import { useState, useEffect } from 'react';
import { CreateEvent } from './components/CreateEvent';
import { InviteAttendees } from './components/InviteAttendees';
import { HostDashboard } from './components/HostDashboard';
import { RSVPResponse } from './components/RSVPResponse';
import './App.css';

type Page = 'home' | 'create' | 'invite' | 'dashboard' | 'rsvp';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [eventId, setEventId] = useState<number | null>(null);
  const [hostEmail, setHostEmail] = useState<string>('');
  const [rsvpToken, setRsvpToken] = useState<string>('');

  // Check URL for RSVP token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setRsvpToken(token);
      setPage('rsvp');
    }
  }, []);

  const handleEventCreated = (id: number, email: string) => {
    setEventId(id);
    setHostEmail(email);
    setPage('invite');
  };

  const handleViewDashboard = () => {
    setPage('dashboard');
  };

  const handleInviteSuccess = () => {
    // Can refresh dashboard or show success message
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Event RSVP Manager</h1>
        <nav className="app-nav">
          <button onClick={() => setPage('home')} className={page === 'home' ? 'active' : ''}>
            Home
          </button>
          {eventId && (
            <>
              <button onClick={handleViewDashboard} className={page === 'dashboard' ? 'active' : ''}>
                Dashboard
              </button>
              <button onClick={() => setPage('invite')} className={page === 'invite' ? 'active' : ''}>
                Invite
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        {page === 'home' && (
          <div className="home">
            <div className="hero">
              <h2>Welcome to Event RSVP Manager</h2>
              <p>Easily create events, invite attendees, and track RSVPs in real-time</p>
            </div>
            <button onClick={() => setPage('create')} className="btn-primary">
              Create New Event
            </button>
            {eventId && (
              <button onClick={handleViewDashboard} className="btn-secondary">
                View Dashboard
              </button>
            )}
          </div>
        )}

        {page === 'create' && (
          <CreateEvent onEventCreated={handleEventCreated} />
        )}

        {page === 'invite' && eventId && (
          <div className="page-container">
            <InviteAttendees eventId={eventId} onInviteSuccess={handleInviteSuccess} />
          </div>
        )}

        {page === 'dashboard' && eventId && hostEmail && (
          <div className="page-container">
            <HostDashboard eventId={eventId} hostEmail={hostEmail} />
          </div>
        )}

        {page === 'rsvp' && rsvpToken && (
          <div className="page-container">
            <RSVPResponse token={rsvpToken} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Event RSVP Manager. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
