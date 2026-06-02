'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseAdminClient, getCurrentUserAndProfile } from '@/lib/supabase-server';

const templateTypes = ['wa', 'link', 'script'] as const;

const promoTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(templateTypes),
  title: z.string().trim().min(3, 'Nama template minimal 3 karakter.').max(80, 'Nama template maksimal 80 karakter.'),
  content: z.string().trim().min(10, 'Isi template minimal 10 karakter.').max(5000, 'Isi template maksimal 5.000 karakter.'),
});

type PromoTemplate = z.infer<typeof promoTemplateSchema> & {
  id: string;
  created_at: string;
  updated_at: string;
};

function normalizeTemplates(value: unknown): PromoTemplate[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is PromoTemplate => {
    const parsed = promoTemplateSchema.extend({
      id: z.string().uuid(),
      created_at: z.string(),
      updated_at: z.string(),
    }).safeParse(item);

    return parsed.success;
  });
}

export async function savePromoTemplate(rawInput: unknown) {
  const parsed = promoTemplateSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || profile?.role !== 'partner') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);

  if (authUserError || !authUser.user) {
    return { error: authUserError?.message || 'Profil auth tidak ditemukan.' };
  }

  const currentMetadata = authUser.user.user_metadata || {};
  const currentTemplates = normalizeTemplates(currentMetadata.promo_templates);
  const now = new Date().toISOString();
  const template: PromoTemplate = {
    id: parsed.data.id || crypto.randomUUID(),
    type: parsed.data.type,
    title: parsed.data.title,
    content: parsed.data.content,
    created_at: currentTemplates.find((item) => item.id === parsed.data.id)?.created_at || now,
    updated_at: now,
  };

  const nextTemplates = currentTemplates.some((item) => item.id === template.id)
    ? currentTemplates.map((item) => (item.id === template.id ? template : item))
    : [template, ...currentTemplates];

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...currentMetadata,
      promo_templates: nextTemplates,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/partner');
  return { success: true, template };
}

export async function deletePromoTemplate(templateId: string) {
  const parsed = z.string().uuid('ID template tidak valid.').safeParse(templateId);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || profile?.role !== 'partner') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);

  if (authUserError || !authUser.user) {
    return { error: authUserError?.message || 'Profil auth tidak ditemukan.' };
  }

  const currentMetadata = authUser.user.user_metadata || {};
  const currentTemplates = normalizeTemplates(currentMetadata.promo_templates);
  const nextTemplates = currentTemplates.filter((item) => item.id !== parsed.data);

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...currentMetadata,
      promo_templates: nextTemplates,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/partner');
  return { success: true };
}
