import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfigForm } from '@/features/config/components/ConfigForm';
import { useConfig } from '@/features/config/config.hooks';

/**
 * App settings — maintenance mode and version gating. Reads the public
 * `/config/init` endpoint (there is no admin GET) and writes via
 * `PATCH /admin/config`.
 */
function SettingsPage() {
  const { data: config, isPending, isError, error, refetch } = useConfig();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Maintenance mode and client version gating."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Settings' }]}
      />

      <div className="max-w-3xl">
        {isPending ? (
          <LoadingState label="Loading settings…" />
        ) : isError ? (
          <ErrorState
            title="Couldn't load settings"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : (
          <ConfigForm config={config} />
        )}
      </div>
    </div>
  );
}

export { SettingsPage };
