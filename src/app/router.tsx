import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TournamentsListPage } from '@/pages/tournaments/TournamentsListPage';
import { TournamentCreatePage } from '@/pages/tournaments/TournamentCreatePage';
import { TournamentEditPage } from '@/pages/tournaments/TournamentEditPage';
import { TournamentDetailPage } from '@/pages/tournaments/TournamentDetailPage';
import { LiveArenaPage } from '@/pages/LiveArenaPage';
import { MatchesHubPage } from '@/pages/MatchesHubPage';
import { LeaderboardsHubPage } from '@/pages/LeaderboardsHubPage';
import { UsersListPage } from '@/pages/UsersListPage';
import { UserDetailPage } from '@/pages/UserDetailPage';
import { TeamsListPage } from '@/pages/TeamsListPage';
import { TeamDetailPage } from '@/pages/TeamDetailPage';
import { ChallengesListPage } from '@/pages/ChallengesListPage';
import { ProofsPage } from '@/pages/ProofsPage';
import { ContentPage } from '@/pages/ContentPage';
import { SettingsPage } from '@/pages/SettingsPage';

/**
 * App routing. Every sidebar module is now backed by real endpoints on the
 * deployed backend: tournament-centric screens (dashboard, tournaments, live,
 * matches, leaderboards) plus the admin modules (users, teams, challenges,
 * proof verification, content, settings). No screen renders mock data.
 */
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },

          // Tournaments (full CRUD-ish: create / edit / status / room / matches)
          { path: '/tournaments', element: <TournamentsListPage /> },
          { path: '/tournaments/new', element: <TournamentCreatePage /> },
          { path: '/tournaments/:id', element: <TournamentDetailPage /> },
          { path: '/tournaments/:id/edit', element: <TournamentEditPage /> },

          // Tournament-centric entry points
          { path: '/live', element: <LiveArenaPage /> },
          { path: '/matches', element: <MatchesHubPage /> },
          { path: '/leaderboards', element: <LeaderboardsHubPage /> },

          // Admin modules (backed by the /admin API)
          { path: '/users', element: <UsersListPage /> },
          { path: '/users/:id', element: <UserDetailPage /> },
          { path: '/teams', element: <TeamsListPage /> },
          { path: '/teams/:id', element: <TeamDetailPage /> },
          { path: '/challenges', element: <ChallengesListPage /> },
          { path: '/proofs', element: <ProofsPage /> },
          { path: '/content', element: <ContentPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  // Unknown paths fall back to the dashboard.
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export const router = createBrowserRouter(routes);
