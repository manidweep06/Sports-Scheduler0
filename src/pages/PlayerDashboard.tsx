import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Session } from '../lib/database.types';
import SessionCard from '../components/SessionCard';
import { LogOut, Calendar, TrendingUp } from 'lucide-react';

export default function PlayerDashboard() {
  const { profile, user, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchPlayerSessions();
    }
  }, [user]);

  const fetchPlayerSessions = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const playerSessions = (data || []).filter(
        (session) =>
          session.team1_players.includes(user.email!) ||
          session.team2_players.includes(user.email!)
      );

      setSessions(playerSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerTeam = (session: Session): 'team1' | 'team2' | null => {
    if (!user?.email) return null;
    if (session.team1_players.includes(user.email)) return 'team1';
    if (session.team2_players.includes(user.email)) return 'team2';
    return null;
  };

  const upcomingSessions = sessions.filter(s => new Date(s.date) >= new Date());
  const pastSessions = sessions.filter(s => new Date(s.date) < new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Player Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {profile?.name}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{pastSessions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {upcomingSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="relative">
                  <SessionCard
                    session={session}
                    isAdmin={false}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getPlayerTeam(session) === 'team1'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getPlayerTeam(session) === 'team1' ? 'Team 1' : 'Team 2'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pastSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Sessions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastSessions.map((session) => (
                <div key={session.id} className="relative opacity-75">
                  <SessionCard
                    session={session}
                    isAdmin={false}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600">You haven't been added to any sessions yet. Check back later!</p>
          </div>
        )}
      </main>
    </div>
  );
}
