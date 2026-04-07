'use server'

/**
 * Server Actions for video management.
 */

import { revalidatePath, updateTag } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'

export interface DeleteVideoResult {
  error?: string
}

/**
 * Permanently deletes a video and all associated data (video_sections,
 * intelligence_reports) via the ON DELETE CASCADE FK constraint.
 *
 * Validates that the authenticated user owns the video before deletion.
 */
export async function deleteVideo(videoId: string): Promise<DeleteVideoResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'No autenticado.' }

  const supabase = await createClient()

  // Verify ownership before delete (defence-in-depth alongside RLS)
  const { data: video, error: fetchError } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) return { error: 'Error al verificar el video.' }
  if (!video) return { error: 'Video no encontrado.' }

  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)
    .eq('user_id', user.id)

  if (deleteError) return { error: 'No se pudo eliminar el video.' }

  revalidatePath('/dashboard/videos')
  updateTag(`dashboard-${user.id}`)

  return {}
}
