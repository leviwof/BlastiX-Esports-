import { useSearchParams } from 'react-router-dom';
import { Flame, Radio } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { BlastixLivePanel } from '@/features/live/blastix/components/BlastixLivePanel';
import { FreeFireLivePanel } from '@/features/live/freefire/components/FreeFireLivePanel';
import { cn } from '@/lib/utils';

type LiveSource = 'blastix' | 'freefire';

/**
 * /live — Live Arena page with strict separation:
 *   - BlastiX Live: internal platform tournaments, custom rooms, matches & live scoring.
 *   - Free Fire MAX Live: official Free Fire / Garena website streams, FFWS tournaments, and official esports data.
 * The two data sources are strictly isolated and never mixed.
 */
function LiveArenaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const source = (searchParams.get('source') as LiveSource) || 'blastix';

  const setSource = (nextSource: LiveSource) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('source', nextSource);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Arena"
        description="Monitor ongoing competitions in real-time. Switch between BlastiX internal tournament rooms and official Free Fire MAX esports broadcasts."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Live Arena' }]}
      />

      {/* Segmented Source Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div
          role="tablist"
          aria-label="Live stream and tournament source"
          className="inline-flex rounded-xl border border-white/10 bg-surface/80 p-1.5 shadow-sm backdrop-blur"
        >
          <button
            type="button"
            role="tab"
            aria-selected={source === 'blastix'}
            onClick={() => setSource('blastix')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200',
              source === 'blastix'
                ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/40 shadow-glow'
                : 'text-foreground-muted hover:text-foreground hover:bg-white/5 border border-transparent',
            )}
          >
            <Radio className={cn('h-4 w-4', source === 'blastix' ? 'text-primary animate-pulse' : 'text-foreground-muted')} />
            <span>BlastiX Live</span>
            <span className={cn('text-[10px] px-1.5 py-0.2 rounded font-mono', source === 'blastix' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-foreground-muted')}>
              Internal Data
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={source === 'freefire'}
            onClick={() => setSource('freefire')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200',
              source === 'freefire'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-foreground-muted hover:text-foreground hover:bg-white/5 border border-transparent',
            )}
          >
            <Flame className={cn('h-4 w-4', source === 'freefire' ? 'text-amber-400' : 'text-foreground-muted')} />
            <span>Free Fire MAX Live</span>
            <span className={cn('text-[10px] px-1.5 py-0.2 rounded font-mono', source === 'freefire' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-foreground-muted')}>
              Official Website
            </span>
          </button>
        </div>

        <div className="text-xs text-foreground-muted">
          Active Source:{' '}
          <span className="font-semibold text-foreground">
            {source === 'blastix' ? 'BlastiX Internal Match Engine' : 'Free Fire Official / Garena Esports'}
          </span>
        </div>
      </div>

      {/* Render dedicated view based on selected tab — 100% separated */}
      {source === 'blastix' ? <BlastixLivePanel /> : <FreeFireLivePanel />}
    </div>
  );
}

export { LiveArenaPage };
