import { useState, type ChangeEvent } from 'react';
import { ImagePlus, LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/apiError';
import { uploadAdminImage } from '@/lib/imageUpload';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface ImageUploadFieldProps {
  id: string;
  value: string;
  onChange: (imageUrl: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

function ImageUploadField({ id, value, onChange, onUploadingChange, disabled }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Choose a JPEG, PNG, GIF or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be 8 MB or smaller.');
      return;
    }

    setError(null);
    setUploading(true);
    onUploadingChange?.(true);
    try {
      onChange(await uploadAdminImage(file));
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        aria-describedby={error ? `${id}-upload-error` : undefined}
      />
      {uploading && (
        <p className="flex items-center gap-1.5 text-xs text-foreground-muted" role="status">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          Uploading image…
        </p>
      )}
      {error && (
        <p id={`${id}-upload-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {value ? (
        <img
          src={value}
          alt="Uploaded image preview"
          className="max-h-44 w-full rounded-lg border border-white/10 object-contain object-left"
        />
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
          <ImagePlus className="h-3.5 w-3.5" />
          JPEG, PNG, GIF or WebP. Maximum 8 MB.
        </p>
      )}
    </div>
  );
}

export { ImageUploadField };
