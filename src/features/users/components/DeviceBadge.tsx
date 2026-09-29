import { Apple, Smartphone, Laptop, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface DeviceBadgeProps {
  deviceType?: string | null;
  deviceModel?: string | null;
  iosWaitlist?: boolean | null;
  iosNotifiedAt?: string | null;
  showModel?: boolean;
}

export function DeviceBadge({
  deviceType,
  deviceModel,
  iosWaitlist,
  iosNotifiedAt,
  showModel = false,
}: DeviceBadgeProps) {
  const norm = (deviceType || '').toUpperCase().trim();

  if (norm === 'IOS' || norm === 'IPHONE' || norm === 'APPLE') {
    const isWaitlist = iosWaitlist !== false; // defaults to waitlist for iOS
    const isNotified = Boolean(iosNotifiedAt);

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-0.5 text-xs font-medium text-foreground">
          <Apple className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
          <span>iOS</span>
          {showModel && deviceModel && (
            <span className="text-foreground-muted">({deviceModel})</span>
          )}
        </span>

        {isWaitlist && (
          isNotified ? (
            <Badge variant="success" className="text-[10px] py-0 px-1.5 h-4 flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Notified
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px] py-0 px-1.5 h-4 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Waitlist (Pending)
            </Badge>
          )
        )}
      </div>
    );
  }

  if (norm === 'ANDROID') {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
          <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Android</span>
          {showModel && deviceModel && (
            <span className="text-emerald-500/80">({deviceModel})</span>
          )}
        </span>
      </div>
    );
  }

  if (norm === 'WEB') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground-muted">
        <Laptop className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Web</span>
      </span>
    );
  }

  return (
    <span className="text-xs text-foreground-muted/60">
      {deviceModel ? deviceModel : '—'}
    </span>
  );
}
