import { useState } from 'react';
import { createEvent } from '../services/eventApi';
import '../styles/CreateEvent.css';

interface CreateEventProps {
  onEventCreated: (eventId: number, hostEmail: string) => void;
}

export const CreateEvent = ({ onEventCreated }: CreateEventProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const event = await createEvent({
        title,
        description,
        location,
        startDateTime,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        hostEmail,
      });
      onEventCreated(event.id, hostEmail);
    } catch (err) {
      setError('Failed to create event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <h2>Create New Event</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Team Dinner"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event details..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g., Conference Room A"
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDateTime">Event Start Date/Time *</label>
          <input
            id="startDateTime"
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxCapacity">Max Capacity (optional)</label>
          <input
            id="maxCapacity"
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="hostEmail">Your Email (Host) *</label>
          <input
            id="hostEmail"
            type="email"
            value={hostEmail}
            onChange={(e) => setHostEmail(e.target.value)}
            required
            placeholder="host@example.com"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};
