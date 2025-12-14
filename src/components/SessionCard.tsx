import type { Session } from '../lib/database.types';
import { Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';

interface SessionCardProps {
  session: Session;
  onEdit?: (session: Session) => void;
  onDelete?: (sessionId: string) => void;
  isAdmin: boolean;
}

export default function SessionCard({ session, onEdit, onDelete, isAdmin }: SessionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
        {isAdmin && onEdit && onDelete && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(session)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit session"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(session.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2 text-gray-600">
          <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{formatDate(session.date)}</span>
        </div>
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{session.venue}</span>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Team 1</span>
            <span className="text-xs text-gray-500">({session.team1_players.length})</span>
          </div>
          {session.team1_players.length > 0 ? (
            <div className="pl-6 space-y-1">
              {session.team1_players.map((email, index) => (
                <div key={index} className="text-sm text-gray-600">{email}</div>
              ))}
            </div>
          ) : (
            <div className="pl-6 text-sm text-gray-400">No players yet</div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Team 2</span>
            <span className="text-xs text-gray-500">({session.team2_players.length})</span>
          </div>
          {session.team2_players.length > 0 ? (
            <div className="pl-6 space-y-1">
              {session.team2_players.map((email, index) => (
                <div key={index} className="text-sm text-gray-600">{email}</div>
              ))}
            </div>
          ) : (
            <div className="pl-6 text-sm text-gray-400">No players yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
