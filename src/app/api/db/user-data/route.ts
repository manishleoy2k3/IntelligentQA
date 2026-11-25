import { NextRequest, NextResponse } from 'next/server';
import { UserExerciseProgressRecord, UserCodingProjectRecord } from '@/types/qa';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

// In-Memory server store fallback for local development & offline testing
const serverUserExercises = new Map<string, UserExerciseProgressRecord[]>();
const serverUserProjects = new Map<string, UserCodingProjectRecord[]>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'exercises' | 'project' | 'all'
    const language = searchParams.get('language') as 'python' | 'javascript' | 'java' | null;
    const projectId = searchParams.get('projectId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // 1. Supabase PostgreSQL Persistence (if configured)
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        if (type === 'exercises') {
          let query = supabase.from('user_exercise_records').select('*').eq('user_id', userId);
          if (language) {
            query = query.eq('language', language);
          }
          const { data, error } = await query;
          if (!error && data) {
            const mapped: UserExerciseProgressRecord[] = data.map((d: any) => ({
              id: d.id,
              userId: d.user_id,
              language: d.language,
              userAnswers: d.user_answers || {},
              score: d.score || 0,
              totalAnswered: d.total_answered || 0,
              updatedAt: d.updated_at,
            }));
            if (language) {
              return NextResponse.json({ success: true, record: mapped[0] || null });
            }
            return NextResponse.json({ success: true, records: mapped });
          }
        }

        if (type === 'project') {
          let query = supabase.from('user_coding_projects').select('*').eq('user_id', userId);
          if (language) {
            query = query.eq('language', language);
          }
          if (projectId) {
            query = query.eq('project_id', projectId);
          }
          const { data, error } = await query;
          if (!error && data) {
            const mapped: UserCodingProjectRecord[] = data.map((d: any) => ({
              id: d.id,
              userId: d.user_id,
              language: d.language,
              projectId: d.project_id,
              code: d.code || '',
              updatedAt: d.updated_at,
            }));
            if (language && projectId) {
              return NextResponse.json({ success: true, record: mapped[0] || null });
            }
            return NextResponse.json({ success: true, records: mapped });
          }
        }

        if (type === 'all' || !type) {
          const { data: exercises } = await supabase
            .from('user_exercise_records')
            .select('*')
            .eq('user_id', userId);
          const { data: projects } = await supabase
            .from('user_coding_projects')
            .select('*')
            .eq('user_id', userId);

          return NextResponse.json({
            success: true,
            data: {
              userId,
              exercises: (exercises || []).map((d: any) => ({
                id: d.id,
                userId: d.user_id,
                language: d.language,
                userAnswers: d.user_answers || {},
                score: d.score || 0,
                totalAnswered: d.total_answered || 0,
                updatedAt: d.updated_at,
              })),
              projects: (projects || []).map((d: any) => ({
                id: d.id,
                userId: d.user_id,
                language: d.language,
                projectId: d.project_id,
                code: d.code || '',
                updatedAt: d.updated_at,
              })),
            },
          });
        }
      }
    }

    // 2. In-Memory Fallback
    if (type === 'exercises') {
      const records = serverUserExercises.get(userId) || [];
      const userRecords = records.filter((r) => r.userId === userId);
      if (language) {
        const matched = userRecords.find((r) => r.language === language);
        return NextResponse.json({ success: true, record: matched || null });
      }
      return NextResponse.json({ success: true, records: userRecords });
    }

    if (type === 'project') {
      const records = serverUserProjects.get(userId) || [];
      const userRecords = records.filter((p) => p.userId === userId);
      if (language && projectId) {
        const matched = userRecords.find(
          (p) => p.language === language && p.projectId === projectId
        );
        return NextResponse.json({ success: true, record: matched || null });
      }
      if (language) {
        return NextResponse.json({
          success: true,
          records: userRecords.filter((p) => p.language === language),
        });
      }
      return NextResponse.json({ success: true, records: userRecords });
    }

    const exercises = (serverUserExercises.get(userId) || []).filter((r) => r.userId === userId);
    const projects = (serverUserProjects.get(userId) || []).filter((p) => p.userId === userId);
    return NextResponse.json({
      success: true,
      data: {
        userId,
        exercises,
        projects,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, type, language, projectId, userAnswers, score, totalAnswered, code } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // 1. Supabase PostgreSQL Persistence (if configured)
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        // Ensure user profile exists to satisfy foreign key
        await supabase.from('user_profiles').upsert(
          {
            id: userId,
            updated_at: now,
          },
          { onConflict: 'id' }
        );

        if (type === 'exercises') {
          if (!language) {
            return NextResponse.json({ error: 'Missing language' }, { status: 400 });
          }
          const recordId = `uexp_${userId}_${language}`;
          const newRecord: UserExerciseProgressRecord = {
            id: recordId,
            userId,
            language,
            userAnswers: userAnswers || {},
            score: typeof score === 'number' ? score : 0,
            totalAnswered:
              typeof totalAnswered === 'number'
                ? totalAnswered
                : Object.keys(userAnswers || {}).length,
            updatedAt: now,
          };

          const { error } = await supabase.from('user_exercise_records').upsert(
            {
              id: recordId,
              user_id: userId,
              language,
              user_answers: newRecord.userAnswers,
              score: newRecord.score,
              total_answered: newRecord.totalAnswered,
              updated_at: now,
            },
            { onConflict: 'id' }
          );

          if (!error) {
            return NextResponse.json({ success: true, record: newRecord });
          }
        }

        if (type === 'project') {
          if (!language || !projectId) {
            return NextResponse.json({ error: 'Missing language or projectId' }, { status: 400 });
          }
          const recordId = `uproj_${userId}_${language}_${projectId}`;
          const newRecord: UserCodingProjectRecord = {
            id: recordId,
            userId,
            language,
            projectId,
            code: typeof code === 'string' ? code : '',
            updatedAt: now,
          };

          const { error } = await supabase.from('user_coding_projects').upsert(
            {
              id: recordId,
              user_id: userId,
              language,
              project_id: projectId,
              code: newRecord.code,
              updated_at: now,
            },
            { onConflict: 'id' }
          );

          if (!error) {
            return NextResponse.json({ success: true, record: newRecord });
          }
        }
      }
    }

    // 2. In-Memory Fallback
    if (type === 'exercises') {
      if (!language) {
        return NextResponse.json({ error: 'Missing language' }, { status: 400 });
      }
      const existing = serverUserExercises.get(userId) || [];
      const updatedList = existing.filter((r) => r.userId === userId && r.language !== language);
      const newRecord: UserExerciseProgressRecord = {
        id: `uexp_${userId}_${language}`,
        userId,
        language,
        userAnswers: userAnswers || {},
        score: typeof score === 'number' ? score : 0,
        totalAnswered:
          typeof totalAnswered === 'number' ? totalAnswered : Object.keys(userAnswers || {}).length,
        updatedAt: now,
      };
      updatedList.push(newRecord);
      serverUserExercises.set(userId, updatedList);

      return NextResponse.json({ success: true, record: newRecord });
    }

    if (type === 'project') {
      if (!language || !projectId) {
        return NextResponse.json({ error: 'Missing language or projectId' }, { status: 400 });
      }
      const existing = serverUserProjects.get(userId) || [];
      const updatedList = existing.filter(
        (p) => !(p.userId === userId && p.language === language && p.projectId === projectId)
      );
      const newRecord: UserCodingProjectRecord = {
        id: `uproj_${userId}_${language}_${projectId}`,
        userId,
        language,
        projectId,
        code: typeof code === 'string' ? code : '',
        updatedAt: now,
      };
      updatedList.push(newRecord);
      serverUserProjects.set(userId, updatedList);

      return NextResponse.json({ success: true, record: newRecord });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const language = searchParams.get('language') as 'python' | 'javascript' | 'java' | null;
    const projectId = searchParams.get('projectId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // 1. Supabase PostgreSQL Persistence (if configured)
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        if (type === 'exercises') {
          let query = supabase.from('user_exercise_records').delete().eq('user_id', userId);
          if (language) query = query.eq('language', language);
          await query;
          return NextResponse.json({
            success: true,
            message: 'Exercise progress reset in database',
          });
        }
        if (type === 'project') {
          let query = supabase.from('user_coding_projects').delete().eq('user_id', userId);
          if (language) query = query.eq('language', language);
          if (projectId) query = query.eq('project_id', projectId);
          await query;
          return NextResponse.json({ success: true, message: 'Project code reset in database' });
        }
      }
    }

    // 2. In-Memory Fallback
    if (type === 'exercises') {
      const existing = serverUserExercises.get(userId) || [];
      if (language) {
        serverUserExercises.set(
          userId,
          existing.filter((r) => !(r.userId === userId && r.language === language))
        );
      } else {
        serverUserExercises.delete(userId);
      }
      return NextResponse.json({ success: true, message: 'Exercise progress reset in database' });
    }

    if (type === 'project') {
      const existing = serverUserProjects.get(userId) || [];
      if (language && projectId) {
        serverUserProjects.set(
          userId,
          existing.filter(
            (p) => !(p.userId === userId && p.language === language && p.projectId === projectId)
          )
        );
      } else if (language) {
        serverUserProjects.set(
          userId,
          existing.filter((p) => !(p.userId === userId && p.language === language))
        );
      } else {
        serverUserProjects.delete(userId);
      }
      return NextResponse.json({ success: true, message: 'Project code reset in database' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
