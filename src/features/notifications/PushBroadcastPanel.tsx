import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SectionCard } from '@/components/shared/SectionCard';
import { Field } from '@/components/shared/Field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/apiError';
import { sendBroadcastNotification } from './notifications.api';

function PushBroadcastPanel() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const broadcast = useMutation({
    mutationFn: sendBroadcastNotification,
    onSuccess: (result) => {
      setConfirmOpen(false);
      setTitle('');
      setBody('');
      toast.success(`Push sent to ${result.sent} device${result.sent === 1 ? '' : 's'}.`);
      if (result.failed > 0) {
        toast.error(`${result.failed} device${result.failed === 1 ? '' : 's'} could not be reached.`);
      }
      if (result.targeted === 0) {
        toast.info('No active users have registered a push token yet.');
      }
    },
    onError: (error) => {
      setConfirmOpen(false);
      toast.error(getErrorMessage(error));
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  return (
    <>
      <SectionCard
        title="Push notification broadcast"
        description="Send a custom announcement to active app users who have push notifications enabled."
        contentClassName="p-5"
      >
        <form className="max-w-2xl space-y-5" onSubmit={submit}>
          <Field label="Notification title" htmlFor="broadcast-title" required>
            <Input
              id="broadcast-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
              placeholder="Tournament registration is open"
            />
          </Field>

          <Field label="Message" htmlFor="broadcast-body" required>
            <Textarea
              id="broadcast-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1000}
              rows={5}
              required
              placeholder="Write a short message for players."
            />
          </Field>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-foreground-muted">
              {title.length}/100 title · {body.length}/1000 message
            </p>
            <Button type="submit" disabled={broadcast.isPending}>
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              Review broadcast
            </Button>
          </div>
        </form>
      </SectionCard>

      <ConfirmDialog
        open={confirmOpen}
        title="Send push notification?"
        description={`This will send “${title}” to all active users with a registered device token.`}
        confirmLabel="Send to all users"
        loading={broadcast.isPending}
        onConfirm={() => broadcast.mutate({ title: title.trim(), body: body.trim() })}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}

export { PushBroadcastPanel };
