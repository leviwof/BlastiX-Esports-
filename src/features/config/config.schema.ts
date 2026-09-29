import { z } from 'zod';
import type { AppConfig, UpdateConfigPayload } from './config.types';

/**
 * Config settings form. All fields are strings/booleans in the form; blank text
 * fields map to `undefined` on submit so the PATCH omits them (leaving the stored
 * value unchanged) rather than clobbering it with an empty string.
 */
export const configFormSchema = z.object({
  is_maintenance: z.boolean(),
  maintenance_message: z.string().max(500, 'Keep the message under 500 characters.'),
  min_version: z.string().max(40, 'Version string is too long.'),
  latest_version: z.string().max(40, 'Version string is too long.'),
  update_url: z.string().url('Enter a valid URL.').or(z.literal('')),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;

/** AppConfig → form defaults (nulls become empty strings). */
export function toConfigDefaults(config: AppConfig): ConfigFormValues {
  return {
    is_maintenance: config.is_maintenance ?? false,
    maintenance_message: config.maintenance_message ?? '',
    min_version: config.min_version ?? '',
    latest_version: config.latest_version ?? '',
    update_url: config.update_url ?? '',
  };
}

/** Form values → PATCH payload (blank strings dropped so the key is omitted). */
export function toUpdatePayload(values: ConfigFormValues): UpdateConfigPayload {
  return {
    is_maintenance: values.is_maintenance,
    maintenance_message: values.maintenance_message.trim() || undefined,
    min_version: values.min_version.trim() || undefined,
    latest_version: values.latest_version.trim() || undefined,
    update_url: values.update_url.trim() || undefined,
  };
}
