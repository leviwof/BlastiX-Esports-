import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TournamentForm } from '@/features/tournaments/components/TournamentForm';
import { toUpdatePayload, tournamentToFormValues } from '@/features/tournaments/tournament.schema';
import { useTournament, useUpdateTournament } from '@/features/tournaments/tournaments.hooks';
import type { TournamentFormValues } from '@/features/tournaments/tournament.schema';

/** /tournaments/:id/edit — edit an existing tournament (PATCH, all fields optional). */
function TournamentEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useTournament(id);
  const update = useUpdateTournament(id);

  const handleSubmit = (values: TournamentFormValues) => {
    update.mutate(toUpdatePayload(values), {
      onSuccess: () => navigate(`/tournaments/${id}`),
    });
  };

  return (
    <div>
      <PageHeader
        title="Edit tournament"
        description="Update the tournament configuration."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Tournaments', to: '/tournaments' },
          { label: data?.title ?? 'Tournament', to: id ? `/tournaments/${id}` : undefined },
          { label: 'Edit' },
        ]}
      />
      <SectionCard>
        {isPending ? (
          <LoadingState label="Loading tournament…" />
        ) : isError ? (
          <ErrorState title="Couldn't load tournament" error={error} onRetry={() => void refetch()} />
        ) : (
          <TournamentForm
            defaultValues={tournamentToFormValues(data)}
            onSubmit={handleSubmit}
            submitting={update.isPending}
            submitLabel="Save changes"
            onCancel={() => navigate(`/tournaments/${id}`)}
          />
        )}
      </SectionCard>
    </div>
  );
}

export { TournamentEditPage };
