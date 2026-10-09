import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { TournamentForm } from '@/features/tournaments/components/TournamentForm';
import { createDefaultValues, toCreatePayload } from '@/features/tournaments/tournament.schema';
import { useCreateTournament } from '@/features/tournaments/tournaments.hooks';
import type { TournamentFormValues } from '@/features/tournaments/tournament.schema';

/**
 * /blastx/tournaments/new — Create a new BlastX E-Sports Tournament.
 * Form is locked to the BlastX section and tagged for the BlastX mobile app view.
 */
function BlastXTournamentCreatePage() {
  const navigate = useNavigate();
  const create = useCreateTournament();

  const handleSubmit = (values: TournamentFormValues) => {
    create.mutate(toCreatePayload(values, 'blastx'), {
      onSuccess: (t) => navigate(`/tournaments/${t.id}`),
    });
  };

  return (
    <div>
      <PageHeader
        title="⚡ Create BLASTiX Tournament"
        description="Set up a new BLASTiX E-Sports tournament (Live or Upcoming). The tournament will appear exclusively in the BLASTiX section of the mobile app."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'BLASTiX E-Sports', to: '/blastx/tournaments' },
          { label: 'Create New' },
        ]}
      />
      <SectionCard>
        <TournamentForm
          defaultValues={createDefaultValues}
          lockSection="blastx"
          onSubmit={handleSubmit}
          submitting={create.isPending}
          submitLabel="Create BLASTiX Tournament"
          onCancel={() => navigate('/blastx/tournaments')}
        />
      </SectionCard>
    </div>
  );
}

export { BlastXTournamentCreatePage };
