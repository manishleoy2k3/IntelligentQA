import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Safe client localStorage -> Supabase PostgreSQL synchronization endpoint.
 * Upserts recoverable profile and lesson progress without overwriting newer server records.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { profile, progress, bookmarks } = body;

    if (!profile || !profile.id) {
      return NextResponse.json({ error: 'Missing profile or profile.id' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        synced: false,
        message: 'Supabase not configured; operating in local mode',
      });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        synced: false,
        message: 'Supabase admin client unavailable',
      });
    }

    const now = new Date().toISOString();

    // 1. Sync User Profile (preserve newer server record if updated recently)
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('updated_at')
      .eq('id', profile.id)
      .single();

    const shouldUpdateProfile =
      !existingProfile ||
      !existingProfile.updated_at ||
      new Date(profile.updatedAt || now) >= new Date(existingProfile.updated_at);

    if (shouldUpdateProfile) {
      await supabase.from('user_profiles').upsert(
        {
          id: profile.id,
          email: profile.email || null,
          display_name: profile.displayName || null,
          phone_number: profile.phoneNumber || null,
          target_role: profile.targetRole || 'Manual QA',
          primary_track: profile.primaryTrack || 'playwright-ts',
          experience_years: profile.experienceYears || null,
          role: profile.role || 'user',
          profile_completed: Boolean(profile.profileCompleted),
          updated_at: profile.updatedAt || now,
        },
        { onConflict: 'id' }
      );
    }

    // 2. Sync Lesson Progress Array (if provided)
    if (Array.isArray(progress) && progress.length > 0) {
      const progressRows = progress.map((p: any) => ({
        user_id: profile.id,
        course_id: p.courseId || p.trackId || 'course-playwright-mastery',
        lesson_id: p.lessonId,
        completion_status: p.completionStatus || p.status || 'completed',
        last_accessed_at: p.lastAccessedAt || now,
        completed_at: p.completedAt || now,
      }));

      await supabase.from('user_lesson_progress').upsert(progressRows, {
        onConflict: 'user_id,lesson_id',
      });
    }

    return NextResponse.json({
      success: true,
      synced: true,
      userId: profile.id,
      progressCount: Array.isArray(progress) ? progress.length : 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
