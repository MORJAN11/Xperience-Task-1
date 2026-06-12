import { useState, useEffect } from 'react';
import { getRSVP, respondToRSVP, updateRSVP, RSVP } from '../services/eventApi';
import '../styles/RSVPResponse.css';

interface RSVPResponseProps {
  token: string;
}

export const RSVPResponse = ({ token }: RSVPResponseProps) => {
  const [rsvp, setRsvp] = useState<RSVP | null>(null);
  const [status, setStatus] = useState<'YES' | 'NO' | 'MAYBE' | 'WAITLISTED' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchRSVP();
  }, [token]);

  const fetchRSVP = async () => {
    try {
      const data = await getRSVP(token);
      setRsvp(data);
      setStatus(data.status as 'YES' | 'NO' | 'MAYBE' | 'WAITLISTED');
    } catch (err) {
      setError('Invalid or expired invitation link');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (selectedStatus: 'YES' | 'NO' | 'MAYBE') => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let result;
      if (rsvp?.status && rsvp.status !== 'MAYBE') {
        // Already responded, update
        result = await updateRSVP(token, selectedStatus);
      } else {
        // First response
        result = await respondToRSVP(token, selectedStatus);
      }
      
      setRsvp(result);
      setStatus(result.status as 'YES' | 'NO' | 'MAYBE' | 'WAITLISTED');
      setSuccess(`Your response has been recorded: ${result.status}`);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit response');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !rsvp) {
    return <div className="rsvp-response-container"><p>Loading...</p></div>;
  }

  if (error && !rsvp) {
    return <div className="rsvp-response-container error"><p>{error}</p></div>;
  }

  return (
    <div className="rsvp-response-container">
      <h2>Event Invitation Response</h2>
      
      {rsvp && (
        <div className="event-details">
          <p><strong>Email:</strong> {rsvp.email}</p>
          <p><strong>Current Status:</strong> <span className={`status ${rsvp.status?.toLowerCase()}`}>{rsvp.status}</span></p>
          {rsvp.status === 'WAITLISTED' && (
            <p className="waitlist-note">You are on the waitlist. You will be notified if a spot becomes available.</p>
          )}
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="response-buttons">
        <button
          onClick={() => handleSubmit('YES')}
          disabled={loading}
          className={`btn-response ${status === 'YES' ? 'selected' : ''}`}
        >
          ✓ I'm Coming
        </button>
        <button
          onClick={() => handleSubmit('MAYBE')}
          disabled={loading}
          className={`btn-response ${status === 'MAYBE' ? 'selected' : ''}`}
        >
          ? Maybe
        </button>
        <button
          onClick={() => handleSubmit('NO')}
          disabled={loading}
          className={`btn-response ${status === 'NO' ? 'selected' : ''}`}
        >
          ✗ Can't Make It
        </button>
      </div>

      {submitted && (
        <div className="thank-you">
          <p>Thank you for responding! You can change your response anytime.</p>
        </div>
      )}
    </div>
  );
};
