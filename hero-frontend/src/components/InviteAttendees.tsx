import { useState } from 'react';
import { inviteAttendees, Invitee } from '../services/eventApi';
import '../styles/InviteAttendees.css';

interface InviteAttendeesProps {
  eventId: number;
  onInviteSuccess: () => void;
}

export const InviteAttendees = ({ eventId, onInviteSuccess }: InviteAttendeesProps) => {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitedList, setInvitedList] = useState<Invitee[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailList = emails
        .split('\n')
        .map((e) => e.trim())
        .filter((e) => e);

      if (emailList.length === 0) {
        setError('Please enter at least one email');
        setLoading(false);
        return;
      }

      const result = await inviteAttendees(eventId, emailList);
      setInvitedList((prev) => {
        const existingTokens = new Set(prev.map((i) => i.uniqueToken));
        const newOnes = result.filter((i) => !existingTokens.has(i.uniqueToken));
        return [...prev, ...newOnes];
      });
      setEmails('');
      onInviteSuccess();
    } catch (err) {
      setError('Failed to invite attendees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRsvpLink = (token: string) =>
    `${window.location.origin}${window.location.pathname}?token=${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getRsvpLink(token));
  };

  return (
    <div className="invite-attendees-container">
      <h3>Invite Attendees</h3>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emails">Email Addresses (one per line)</label>
          <textarea
            id="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="guest1@example.com&#10;guest2@example.com&#10;guest3@example.com"
            rows={5}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Inviting...' : 'Send Invitations'}
        </button>
      </form>

      {invitedList.length > 0 && (
        <div className="rsvp-links-section">
          <h4>RSVP Links — share these with your invitees</h4>
          <table className="rsvp-links-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>RSVP Link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invitedList.map((invitee) => (
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
        </div>
      )}
    </div>
  );
};
