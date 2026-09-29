import { useState } from 'react';
import { Apple, Send, Sparkles } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/shared/Field';
import { useNotifyIosUsers } from '../users.hooks';

export interface NotifyIosModalProps {
  open: boolean;
  onClose: () => void;
  targetUser?: { id: string; name: string; email: string };
  waitlistCount?: number;
}

export function NotifyIosModal({
  open,
  onClose,
  targetUser,
  waitlistCount = 0,
}: NotifyIosModalProps) {
  const [subject, setSubject] = useState(
    '🚀 BlastIX Esports is now officially available on iOS!',
  );
  const [message, setMessage] = useState(
    'Great news! The wait is over. BlastIX Esports is now live for iPhone / iOS devices. You can now download the app, join scrims, participate in tournaments, and claim rewards on your iOS device.',
  );

  const { mutate: notifyUsers, isPending } = useNotifyIosUsers();

  const handleSend = () => {
    notifyUsers(
      {
        user_ids: targetUser ? [targetUser.id] : undefined,
        subject,
        message,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const recipientLabel = targetUser
    ? `${targetUser.name} (${targetUser.email})`
    : waitlistCount > 0
      ? `All ${waitlistCount} waitlisted iOS user(s)`
      : 'All waitlisted iOS users';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notify iOS Waitlist Players"
      description="Send an announcement email / push notification to iPhone users when iOS support goes live."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSend}
            disabled={isPending || !subject.trim() || !message.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            {isPending ? 'Sending Notifications…' : 'Send Launch Notification'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground-soft flex items-start gap-2.5">
          <Apple className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              Recipient: <span className="text-primary">{recipientLabel}</span>
            </p>
            <p className="mt-0.5 text-foreground-muted">
              Users who registered from an iPhone will receive this notification and their status will update to <span className="font-semibold text-emerald-400">Notified</span>.
            </p>
          </div>
        </div>

        <Field label="Notification Subject" htmlFor="ios-notify-subject">
          <Input
            id="ios-notify-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Notification subject line…"
          />
        </Field>

        <Field label="Message Content" htmlFor="ios-notify-message">
          <Textarea
            id="ios-notify-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write announcement message…"
          />
        </Field>

        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          <span>Links to App Store / TestFlight download will be appended automatically.</span>
        </div>
      </div>
    </Modal>
  );
}
