import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { TournamentForm } from '@/features/tournaments/components/TournamentForm';
import { createDefaultValues, toCreatePayload } from '@/features/tournaments/tournament.schema';
import { useCreateTournament } from '@/features/tournaments/tournaments.hooks';
import type { TournamentFormValues } from '@/features/tournaments/tournament.schema';

/**
 * /freefire/tournaments/new — Create a new Free Fire Live Tournament.
 * Form is locked to the Free Fire Live section and tagged for the Free Fire mobile app view.
 */
function FreeFireTournamentCreatePage() {
  const navigate = useNavigate();
  const create = useCreateTournament();

  const handleSubmit = (values: TournamentFormValues) => {
    create.mutate(toCreatePayload(values, 'freefire'), {
      onSuccess: (t) => navigate(`/tournaments/${t.id}`),
    });
  };

  return (
    <div>
      <PageHeader
        title="🔥 Create Free Fire Tournament"
        description="Set up a new Free Fire tournament (Live or Upcoming). The tournament will appear exclusively in the Free Fire Live section of the mobile app."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Free Fire Live', to: '/freefire/tournaments' },
          { label: 'Create New' },
        ]}
      />
      <SectionCard>
        <TournamentForm
          defaultValues={createDefaultValues}
          lockSection="freefire"
          onSubmit={handleSubmit}
          submitting={create.isPending}
          submitLabel="Create Free Fire Tournament"
          onCancel={() => navigate('/freefire/tournaments')}
        />
      </SectionCard>
    </div>
  );
}

export { FreeFireTournamentCreatePage };
