import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Session } from '../lib/database.types';
import { X } from 'lucide-react';

interface SessionFormProps {
  session: Session | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SessionForm({ session, onSuccess, onCancel }: SessionFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [team1Players, setTeam1Players] = useState('');
  const [team2Players, setTeam2Players] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setDate(new Date(session.date).toISOString().slice(0, 16));
      setVenue(session.venue);
      setTeam1Players(session.team1_players.join(', '));
      setTeam2Players(session.team2_players.join(', '));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in');
      setLoading(false);
      return;
    }

    const team1Array = team1Players
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const team2Array = team2Players
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    try {
      if (session) {
        const { error } = await supabase
          .from('sessions')
          .update({
            title,
            date,
            venue,
            team1_players: team1Array,
            team2_players: team2Array,
          })
          .eq('id', session.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert({
            title,
            date,
            venue,
            team1_players: team1Array,
            team2_players: team2Array,
            created_by: user.id,
          });

        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {session ? 'Edit Session' : 'Create New Session'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Session Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Saturday Football Match"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date & Time
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
            Venue
          </label>
          <input
            id="venue"
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Central Sports Arena"
          />
        </div>

        <div>
          <label htmlFor="team1" className="block text-sm font-medium text-gray-700 mb-2">
            Team 1 Players
          </label>
          <textarea
            id="team1"
            value={team1Players}
            onChange={(e) => setTeam1Players(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter player emails separated by commas (e.g., player1@email.com, player2@email.com)"
          />
          <p className="text-sm text-gray-500 mt-1">Separate emails with commas</p>
        </div>

        <div>
          <label htmlFor="team2" className="block text-sm font-medium text-gray-700 mb-2">
            Team 2 Players
          </label>
          <textarea
            id="team2"
            value={team2Players}
            onChange={(e) => setTeam2Players(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter player emails separated by commas (e.g., player3@email.com, player4@email.com)"
          />
          <p className="text-sm text-gray-500 mt-1">Separate emails with commas</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
