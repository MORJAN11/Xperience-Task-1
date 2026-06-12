import { useState } from 'react';
import { inviteAttendees } from '../services/eventApi';
import '../styles/InviteAttendees.css';

interface InviteAttendeesProps {
  eventId: number;
  onInviteSuccess: () => void;
}

export const InviteAttendees = ({ eventId, onInviteSuccess }: InviteAttendeesProps) => {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

      await inviteAttendees(eventId, emailList);
      setSuccess(`Invited ${emailList.length} attendee(s)`);
      setEmails('');
      onInviteSuccess();
    } catch (err) {
      setError('Failed to invite attendees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-attendees-container">
      <h3>Invite Attendees</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

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
    </div>
  );
};
