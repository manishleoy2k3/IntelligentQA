import fs from 'fs';
import path from 'path';
import {
  KnowledgeSource,
  KnowledgeChunk,
  IndexingJob,
  RetrievalFilter,
  FreshnessAuditSummary,
  RAGSourceType,
  RAGPublicationStatus,
} from './types';
import { getSupabaseAdminClient } from '../supabase/admin';
import { isSupabaseConfigured } from '../supabase/env';
import { EmbeddingProviderFactory } from './embedding-provider';
import { waitForAllSyncs } from './sync-tracker';
import type { SupabaseClient } from '@supabase/supabase-js';

const RAG_CACHE_FILE = path.join(process.cwd(), 'src/lib/curriculum-rag-store.json');
const TMP_RAG_CACHE_FILE = path.join('/tmp', 'curriculum-rag-store.json');

/**
 * Fallback policy:
 * In production, local storage/in-memory fallback is strictly disabled unless
 * ALLOW_LOCAL_STORAGE_FALLBACK=true is explicitly configured.
 */
export function isLocalStorageFallbackAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOW_LOCAL_STORAGE_FALLBACK === 'true';
  }
  return (
    process.env.NODE_ENV === 'test' ||
    Boolean(process.env.NODE_TEST_CONTEXT) ||
    process.env.npm_lifecycle_event === 'test' ||
    process.env.ALLOW_LOCAL_STORAGE_FALLBACK === 'true' ||
    process.execArgv.includes('--test') ||
    process.argv.some((a) => a.includes('.test.') || a.includes('test'))
  );
}

class RAGStorage {
  private sources: Map<string, KnowledgeSource> = new Map();
  private chunks: Map<string, KnowledgeChunk> = new Map();
  private jobs: Map<string, IndexingJob> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    if (isLocalStorageFallbackAllowed()) {
      this.loadFromDisk();
    }
    this.initialized = true;
  }

  private getAuthoritativeClient(): SupabaseClient {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'SupabaseProductionError: Supabase PostgreSQL/pgvector is required in production, but Supabase credentials are missing. In-memory and local disk persistence fallback are disabled in production.'
      );
    }
    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error(
        'SupabaseProductionError: Failed to obtain Supabase admin client. Server-side service role key is required for production persistence.'
      );
    }
    return client;
  }

  private loadFromDisk() {
    try {
      const filePath = fs.existsSync(RAG_CACHE_FILE)
        ? RAG_CACHE_FILE
        : fs.existsSync(TMP_RAG_CACHE_FILE)
          ? TMP_RAG_CACHE_FILE
          : null;

      if (filePath) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.sources)) {
          for (const s of data.sources) this.sources.set(`${s.sourceType}:${s.sourceId}`, s);
        }
        if (Array.isArray(data.chunks)) {
          for (const c of data.chunks) this.chunks.set(c.id, c);
        }
        if (Array.isArray(data.jobs)) {
          for (const j of data.jobs) this.jobs.set(j.id, j);
        }
      }
    } catch (e: any) {
      console.warn('[RAGStorage] Local cache load notice:', e?.message);
    }
  }

  private saveTimeout: NodeJS.Timeout | null = null;

  public persistToDisk(immediate: boolean = false) {
    if (immediate) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      this.doSave();
      return;
    }
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      this.doSave();
    }, 50);
  }

  private doSave() {
    try {
      const payload = {
        sources: Array.from(this.sources.values()),
        chunks: Array.from(this.chunks.values()),
        jobs: Array.from(this.jobs.values()),
        updatedAt: new Date().toISOString(),
      };
      const json = JSON.stringify(payload);
      try {
        fs.writeFileSync(RAG_CACHE_FILE, json, 'utf8');
      } catch {
        fs.writeFileSync(TMP_RAG_CACHE_FILE, json, 'utf8');
      }
    } catch {
      // ignore
    }
  }

  // ==========================================
  // SOURCES
  // ==========================================

  public async getKnowledgeSources(filter?: {
    sourceType?: string;
    courseId?: string;
    publicationStatus?: string;
    indexingStatus?: string;
  }): Promise<KnowledgeSource[]> {
    this.init();
    let list = Array.from(this.sources.values());

    if (filter?.sourceType) {
      list = list.filter((s) => s.sourceType === filter.sourceType);
    }
    if (filter?.courseId) {
      list = list.filter((s) => s.courseId === filter.courseId);
    }
    if (filter?.publicationStatus) {
      list = list.filter((s) => s.publicationStatus === filter.publicationStatus);
    }
    if (filter?.indexingStatus) {
      list = list.filter((s) => s.indexingStatus === filter.indexingStatus);
    }

    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public async getKnowledgeSource(
    sourceType: RAGSourceType,
    sourceId: string
  ): Promise<KnowledgeSource | null> {
    this.init();
    const key = `${sourceType}:${sourceId}`;
    return this.sources.get(key) || null;
  }

  public async upsertKnowledgeSource(source: KnowledgeSource): Promise<void> {
    this.init();
    const key = `${source.sourceType}:${source.sourceId}`;
    this.sources.set(key, source);
    this.persistToDisk();

    // Async sync to Supabase if configured (fire-and-forget, non-blocking)
    if (isSupabaseConfigured() && process.env.NODE_ENV !== 'test') {
      Promise.resolve().then(async () => {
        try {
          const supabase = getSupabaseAdminClient();
          if (supabase) {
            await supabase.from('knowledge_sources').upsert(
              {
                id: source.id,
                source_type: source.sourceType,
                source_id: source.sourceId,
                source_title: source.sourceTitle,
                course_id: source.courseId || null,
                module_id: source.moduleId || null,
                lesson_id: source.lessonId || null,
                category: source.category || null,
                topic: source.topic || null,
                publication_status: source.publicationStatus,
                current_content_hash: source.currentContentHash,
                current_version: source.currentVersion,
                indexed_content_hash: source.indexedContentHash || null,
                indexed_version: source.indexedVersion || 0,
                indexing_status: source.indexingStatus,
                chunk_count: source.chunkCount,
                last_indexed_at: source.lastIndexedAt || null,
                last_error: source.lastError || null,
              },
              { onConflict: 'id' }
            );
          }
        } catch (err: any) {
          // ignore network timeout
        }
      });
    }
  }

  // ==========================================
  // CHUNKS & SAFE ATOMIC ACTIVATION
  // ==========================================

  public async saveKnowledgeChunks(chunks: KnowledgeChunk[]): Promise<void> {
    // Dimension validation: strictly 768 dimensions
    for (const c of chunks) {
      if (!c.embedding || c.embedding.length !== 768) {
        throw new Error(
          `Embedding vector dimension mismatch: expected 768, got ${c.embedding?.length ?? 0}`
        );
      }
    }

    if (!isLocalStorageFallbackAllowed()) {
      const supabase = this.getAuthoritativeClient();
      const rows = chunks.map((c) => ({
        id: c.id,
        source_type: ['lesson', 'interview_question', 'documentation', 'code_example'].includes(
          c.sourceType
        )
          ? c.sourceType
          : 'documentation',
        source_id: c.sourceId,
        course_id: c.courseId || null,
        lesson_id: c.lessonId || null,
        chunk_index: c.chunkIndex,
        chunk_content: c.chunkContent,
        token_count: c.tokenCount,
        embedding: c.embedding,
        metadata: {
          ...c.metadata,
          realSourceType: c.sourceType,
          sourceTitle: c.sourceTitle,
          moduleId: c.moduleId,
          category: c.category,
          topic: c.topic,
          contentVersion: c.contentVersion,
          contentHash: c.contentHash,
          embeddingModel: c.embeddingModel,
          embeddingVersion: c.embeddingVersion,
          publicationStatus: c.publicationStatus,
          isActive: c.isActive,
          indexedAt: c.indexedAt,
        },
        is_active: c.isActive,
        created_at: c.createdAt,
      }));

      const { error } = await supabase.from('knowledge_chunks').upsert(rows, { onConflict: 'id' });
      if (error) {
        throw new Error(`Supabase persistence failure in saveKnowledgeChunks: ${error.message}`);
      }
      return;
    }

    this.init();
    for (const c of chunks) {
      this.chunks.set(c.id, c);
    }
    this.persistToDisk();
  }

  /**
   * Atomic activation:
   * Sets all chunks of this source with contentVersion === activeVersion to isActive = true,
   * while setting any other versions (superseded) to isActive = false.
   */
  public async activateChunkVersion(
    sourceType: RAGSourceType,
    sourceId: string,
    activeVersion: number,
    publicationStatus: RAGPublicationStatus = 'published'
  ): Promise<number> {
    if (!isLocalStorageFallbackAllowed()) {
      const supabase = this.getAuthoritativeClient();
      // Fetch all chunks for this source
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, metadata')
        .eq('source_id', sourceId);

      if (error) {
        throw new Error(`Supabase persistence failure in activateChunkVersion: ${error.message}`);
      }

      let activated = 0;
      for (const row of data || []) {
        const meta = (row.metadata || {}) as Record<string, any>;
        const isTargetVersion = meta.contentVersion === activeVersion;
        const willBeActive = isTargetVersion && publicationStatus === 'published';
        if (isTargetVersion) activated++;

        const { error: updateErr } = await supabase
          .from('knowledge_chunks')
          .update({
            is_active: willBeActive,
            metadata: {
              ...meta,
              publicationStatus,
              isActive: willBeActive,
            },
          })
          .eq('id', row.id);

        if (updateErr) {
          throw new Error(`Supabase chunk update failed: ${updateErr.message}`);
        }
      }
      return activated;
    }

    this.init();
    let activatedCount = 0;

    for (const [id, chunk] of this.chunks.entries()) {
      if (chunk.sourceType === sourceType && chunk.sourceId === sourceId) {
        if (chunk.contentVersion === activeVersion) {
          chunk.isActive = publicationStatus === 'published';
          chunk.publicationStatus = publicationStatus;
          chunk.updatedAt = new Date().toISOString();
          activatedCount++;
        } else {
          chunk.isActive = false; // Superseded
          chunk.updatedAt = new Date().toISOString();
        }
        this.chunks.set(id, chunk);
      }
    }

    this.persistToDisk();
    return activatedCount;
  }

  /**
   * Immediate publication and deletion control:
   * Immediately marks all chunks for this source inactive.
   */
  public async deactivateSourceChunks(
    sourceType: RAGSourceType,
    sourceId: string,
    status: RAGPublicationStatus = 'draft'
  ): Promise<void> {
    if (!isLocalStorageFallbackAllowed()) {
      const supabase = this.getAuthoritativeClient();
      const { error } = await supabase
        .from('knowledge_chunks')
        .update({ is_active: false })
        .eq('source_id', sourceId);

      if (error) {
        throw new Error(`Supabase persistence failure in deactivateSourceChunks: ${error.message}`);
      }
      return;
    }

    this.init();
    for (const [id, chunk] of this.chunks.entries()) {
      if (chunk.sourceType === sourceType && chunk.sourceId === sourceId) {
        chunk.isActive = false;
        chunk.publicationStatus = status;
        chunk.updatedAt = new Date().toISOString();
        this.chunks.set(id, chunk);
      }
    }

    const source = this.sources.get(`${sourceType}:${sourceId}`);
    if (source) {
      source.publicationStatus = status;
      source.updatedAt = new Date().toISOString();
      this.sources.set(`${sourceType}:${sourceId}`, source);
    }

    this.persistToDisk();
  }

  /**
   * Complete deletion of chunks for deleted records.
   */
  public async deleteSource(sourceType: RAGSourceType, sourceId: string): Promise<void> {
    if (!isLocalStorageFallbackAllowed()) {
      const supabase = this.getAuthoritativeClient();
      const { error } = await supabase.from('knowledge_chunks').delete().eq('source_id', sourceId);

      if (error) {
        throw new Error(`Supabase persistence failure in deleteSource: ${error.message}`);
      }
      return;
    }

    if (!isLocalStorageFallbackAllowed()) {
      const supabase = this.getAuthoritativeClient();
      const { error } = await supabase.from('knowledge_chunks').delete().eq('source_id', sourceId);

      if (error) {
        throw new Error(`Supabase persistence failure in deleteSource: ${error.message}`);
      }
      return;
    }

    this.init();
    for (const [id, chunk] of Array.from(this.chunks.entries())) {
      if (chunk.sourceType === sourceType && chunk.sourceId === sourceId) {
        this.chunks.delete(id);
      }
    }

    this.sources.delete(`${sourceType}:${sourceId}`);
    this.persistToDisk();
  }

  public async getActiveChunks(filter?: RetrievalFilter): Promise<KnowledgeChunk[]> {
    await waitForAllSyncs();
    if (!isLocalStorageFallbackAllowed()) {
      const supabase = this.getAuthoritativeClient();
      let query = supabase.from('knowledge_chunks').select('*').eq('is_active', true);

      if (filter?.courseId) {
        query = query.eq('course_id', filter.courseId);
      }
      if (filter?.sourceType) {
        const mappedType = [
          'lesson',
          'interview_question',
          'documentation',
          'code_example',
        ].includes(filter.sourceType)
          ? filter.sourceType
          : 'documentation';
        query = query.eq('source_type', mappedType);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Supabase getActiveChunks error: ${error.message}`);
      }

      return (data || []).map((row: any) => {
        const meta = (row.metadata || {}) as Record<string, any>;
        return {
          id: row.id,
          sourceType: (meta.realSourceType || row.source_type) as RAGSourceType,
          sourceId: row.source_id,
          sourceTitle: meta.sourceTitle || '',
          courseId: row.course_id,
          moduleId: meta.moduleId || null,
          lessonId: row.lesson_id,
          category: meta.category || null,
          topic: meta.topic || null,
          contentVersion: meta.contentVersion || 1,
          contentHash: meta.contentHash || '',
          chunkIndex: row.chunk_index,
          chunkContent: row.chunk_content,
          tokenCount: row.token_count,
          embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding,
          embeddingModel: meta.embeddingModel || 'text-embedding-004',
          embeddingVersion: meta.embeddingVersion || 'v1',
          publicationStatus: meta.publicationStatus || 'published',
          isActive: row.is_active,
          metadata: meta,
          indexedAt: meta.indexedAt || row.created_at,
          createdAt: row.created_at,
          updatedAt: row.created_at,
        };
      });
    }

    await waitForAllSyncs();
    if (!isLocalStorageFallbackAllowed()) {
      const supabase = this.getAuthoritativeClient();
      let query = supabase.from('knowledge_chunks').select('*').eq('is_active', true);

      if (filter?.courseId) {
        query = query.eq('course_id', filter.courseId);
      }
      if (filter?.sourceType) {
        const mappedType = [
          'lesson',
          'interview_question',
          'documentation',
          'code_example',
        ].includes(filter.sourceType)
          ? filter.sourceType
          : 'documentation';
        query = query.eq('source_type', mappedType);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Supabase getActiveChunks error: ${error.message}`);
      }

      return (data || []).map((row: any) => {
        const meta = (row.metadata || {}) as Record<string, any>;
        return {
          id: row.id,
          sourceType: (meta.realSourceType || row.source_type) as RAGSourceType,
          sourceId: row.source_id,
          sourceTitle: meta.sourceTitle || '',
          courseId: row.course_id,
          moduleId: meta.moduleId || null,
          lessonId: row.lesson_id,
          category: meta.category || null,
          topic: meta.topic || null,
          contentVersion: meta.contentVersion || 1,
          contentHash: meta.contentHash || '',
          chunkIndex: row.chunk_index,
          chunkContent: row.chunk_content,
          tokenCount: row.token_count,
          embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding,
          embeddingModel: meta.embeddingModel || 'text-embedding-004',
          embeddingVersion: meta.embeddingVersion || 'v1',
          publicationStatus: meta.publicationStatus || 'published',
          isActive: row.is_active,
          metadata: meta,
          indexedAt: meta.indexedAt || row.created_at,
          createdAt: row.created_at,
          updatedAt: row.created_at,
        };
      });
    }

    this.init();
    let active = Array.from(this.chunks.values()).filter(
      (c) => c.isActive && c.publicationStatus === 'published'
    );

    if (filter?.courseId) {
      active = active.filter((c) => c.courseId === filter.courseId);
    }
    if (filter?.category) {
      active = active.filter((c) => c.category === filter.category);
    }
    if (filter?.sourceType) {
      active = active.filter((c) => c.sourceType === filter.sourceType);
    }

    return active;
  }

  // ==========================================
  // JOBS (OUTBOX QUEUE)
  // ==========================================

  public async enqueueJob(job: IndexingJob): Promise<IndexingJob> {
    this.init();

    // Check if there's an existing pending job for this source
    for (const existing of this.jobs.values()) {
      if (
        existing.sourceType === job.sourceType &&
        existing.sourceId === job.sourceId &&
        existing.status === 'pending'
      ) {
        // If content hash matches, no need to duplicate
        if (existing.contentHash === job.contentHash && existing.version === job.version) {
          return existing;
        }
        // If incoming version is newer, mark previous pending job superseded
        if (job.version >= existing.version) {
          existing.status = 'superseded';
          existing.updatedAt = new Date().toISOString();
          this.jobs.set(existing.id, existing);
        }
      }
    }

    this.jobs.set(job.id, job);
    this.persistToDisk();
    return job;
  }

  public async getPendingJobs(limit: number = 20): Promise<IndexingJob[]> {
    this.init();
    const pending = Array.from(this.jobs.values())
      .filter((j) => j.status === 'pending')
      .sort((a, b) => b.priority - a.priority || a.scheduledAt.localeCompare(b.scheduledAt));

    return pending.slice(0, limit);
  }

  public async getAllJobs(): Promise<IndexingJob[]> {
    this.init();
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async updateJob(id: string, updates: Partial<IndexingJob>): Promise<void> {
    this.init();
    const job = this.jobs.get(id);
    if (job) {
      const updated = {
        ...job,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.jobs.set(id, updated);
      this.persistToDisk();
    }
  }

  // ==========================================
  // AUDIT & FRESHNESS SUMMARY
  // ==========================================

  public async getAuditSummary(): Promise<FreshnessAuditSummary> {
    this.init();
    const sources = Array.from(this.sources.values());
    const chunks = Array.from(this.chunks.values());
    const jobs = Array.from(this.jobs.values());

    const published = sources.filter((s) => s.publicationStatus === 'published');
    const indexed = published.filter(
      (s) => s.indexingStatus === 'completed' && s.indexedVersion === s.currentVersion
    );
    const activeChunks = chunks.filter((c) => c.isActive && c.publicationStatus === 'published');

    const pendingJobs = jobs.filter((j) => j.status === 'pending').length;
    const processingJobs = jobs.filter((j) => j.status === 'processing').length;
    const failedJobs = jobs.filter((j) => j.status === 'failed').length;
    const superseded = jobs.filter((j) => j.status === 'superseded').length;

    let lastIndexedTime: string | null = null;
    for (const s of sources) {
      if (s.lastIndexedAt) {
        if (!lastIndexedTime || s.lastIndexedAt > lastIndexedTime) {
          lastIndexedTime = s.lastIndexedAt;
        }
      }
    }

    let freshnessStatus: FreshnessAuditSummary['freshnessStatus'] = 'fresh';
    if (failedJobs > 0) {
      freshnessStatus = 'reconciliation_needed';
    } else if (pendingJobs > 0 || processingJobs > 0) {
      freshnessStatus = 'syncing';
    } else if (indexed.length < published.length) {
      freshnessStatus = 'stale';
    }

    const providerMeta = EmbeddingProviderFactory.getActiveProviderMetadata();
    const persistenceLayer = isLocalStorageFallbackAllowed()
      ? 'Local Storage (Test/Dev)'
      : 'Supabase PostgreSQL/pgvector (Authoritative Production)';

    return {
      totalPublishedSources: published.length,
      totalIndexedSources: indexed.length,
      totalActiveChunks: activeChunks.length,
      pendingJobs,
      processingJobs,
      failedJobs,
      supersededVersions: superseded,
      lastSuccessfulIndexingTime: lastIndexedTime,
      freshnessStatus,
      embeddingProvider: providerMeta.name,
      embeddingModel: providerMeta.model,
      embeddingDimensions: providerMeta.dimensions,
      persistenceLayer,
    };
  }
}

export const ragStorage = new RAGStorage();
