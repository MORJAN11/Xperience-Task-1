import { useState, useEffect } from 'react';
import { getDashboard, cancelEvent, closeEvent, getInvitees, Dashboard, Invitee } from '../services/eventApi';
import '../styles/Dashboard.css';

interface HostDashboardProps {
  eventId: number;
  hostEmail: string;
}

export const HostDashboard = ({ eventId, hostEmail }: HostDashboardProps) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'close' | null>(null);
  const [showLinks, setShowLinks] = useState(false);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [eventId, hostEmail]);

  const fetchDashboard = async () => {
    try {
      const [data, inviteeData] = await Promise.all([
        getDashboard(eventId, hostEmail),
        getInvitees(eventId, hostEmail),
      ]);
      setDashboard(data);
      setInvitees(inviteeData);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelEvent(eventId, hostEmail);
      setConfirmAction(null);
      await fetchDashboard();
    } catch (err) {
      setError('Failed to cancel event');
    }
  };

  const handleClose = async () => {
    try {
      await closeEvent(eventId, hostEmail);
      setConfirmAction(null);
      await fetchDashboard();
    } catch (err) {
      setError('Failed to close event');
    }
  };

  const getRsvpLink = (token: string) =>
    `${window.location.origin}${window.location.pathname}?token=${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getRsvpLink(token));
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!dashboard) return <div>No dashboard data</div>;

  const event = dashboard.event;
  const totalResponses = dashboard.yesCount + dashboard.noCount + dashboard.maybeCount + dashboard.waitlistCount;

  return (
    <div className="dashboard-container">
      <h2>{event.title}</h2>
      
      <div className="event-info">
        <p><strong>Status:</strong> {event.status}</p>
        <p><strong>Date:</strong> {new Date(event.startDateTime).toLocaleString()}</p>
        <p><strong>Location:</strong> {event.location}</p>
        {event.maxCapacity && <p><strong>Capacity:</strong> {event.maxCapacity}</p>}
      </div>

      <div className="attendance-counts">
        <div className="count-box yes">
          <div className="number">{dashboard.yesCount}</div>
          <div className="label">Confirmed</div>
        </div>
        <div className="count-box maybe">
          <div className="number">{dashboard.maybeCount}</div>
          <div className="label">Maybe</div>
        </div>
        <div className="count-box no">
          <div className="number">{dashboard.noCount}</div>
          <div className="label">Declined</div>
        </div>
        {dashboard.waitlistCount > 0 && (
          <div className="count-box waitlist">
            <div className="number">{dashboard.waitlistCount}</div>
            <div className="label">Waitlisted</div>
          </div>
        )}
      </div>

      <div className="attendees-section">
        <h3>Attendee List ({totalResponses} responses)</h3>
        <div className="attendees-list">
          {dashboard.attendees.length === 0 ? (
            <p>No responses yet</p>
          ) : (
            dashboard.attendees.map((rsvp) => (
              <div key={rsvp.id} className={`attendee-item ${rsvp.status.toLowerCase()}`}>
                <span className="email">{rsvp.email}</span>
                <span className={`status ${rsvp.status.toLowerCase()}`}>{rsvp.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {invitees.length > 0 && (
        <div className="rsvp-links-section">
          <div className="rsvp-links-header">
            <h3>RSVP Links ({invitees.length} invited)</h3>
            <button className="btn-toggle-links" onClick={() => setShowLinks((v) => !v)}>
              {showLinks ? 'Hide Links' : 'Show Links'}
            </button>
          </div>
          {showLinks && (
            <table className="rsvp-links-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>RSVP Link</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invitees.map((invitee) => (
                  <tr key={invitee.uniqueToken}>
                    <td>{invitee.email}</td>
                    <td>
                      <input
                        readOnly
                        value={getRsvpLink(invitee.uniqueToken)}
                        className="rsvp-link-input"
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-copy"
                        onClick={() => copyLink(invitee.uniqueToken)}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="actions">
        {event.status === 'OPEN_FOR_RSVPS' && (
          <>
            <button 
              onClick={() => setConfirmAction('close')}
              className="btn-close"
            >
              Close to Responses
            </button>
            <button 
              onClick={() => setConfirmAction('cancel')}
              className="btn-cancel"
            >
              Cancel Event
            </button>
          </>
        )}
      </div>

      {confirmAction && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to {confirmAction} this event?</p>
            <button onClick={confirmAction === 'cancel' ? handleCancel : handleClose}>
              Yes, {confirmAction}
            </button>
            <button onClick={() => setConfirmAction(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <button onClick={fetchDashboard} className="btn-refresh">
        Refresh
      </button>
    </div>
  );
};
