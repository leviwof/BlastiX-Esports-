import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { TournamentForm } from '@/features/tournaments/components/TournamentForm';
import { createDefaultValues, toCreatePayload } from '@/features/tournaments/tournament.schema';
import { useCreateTournament } from '@/features/tournaments/tournaments.hooks';
import type { TournamentFormValues } from '@/features/tournaments/tournament.schema';

/** /tournaments/new — create a tournament (RHF + Zod, mirrors CreateTournamentDto). */
function TournamentCreatePage() {
  const navigate = useNavigate();
  const create = useCreateTournament();

  const handleSubmit = (values: TournamentFormValues) => {
    create.mutate(toCreatePayload(values), {
      onSuccess: (t) => navigate(`/tournaments/${t.id}`),
    });
  };

  return (
    <div>
      <PageHeader
        title="New tournament"
        description="Define the format, schedule and slots. Fields mirror the backend validation."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Tournaments', to: '/tournaments' },
          { label: 'New' },
        ]}
      />
      <SectionCard>
        <TournamentForm
          defaultValues={createDefaultValues}
          onSubmit={handleSubmit}
          submitting={create.isPending}
          submitLabel="Create tournament"
          onCancel={() => navigate('/tournaments')}
        />
      </SectionCard>
    </div>
  );
}

export { TournamentCreatePage };
