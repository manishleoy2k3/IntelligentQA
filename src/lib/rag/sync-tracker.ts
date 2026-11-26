/**
 * Tracking mechanism for asynchronous content synchronization operations.
 * Ensures tests and batch processing endpoints can reliably await background
 * sync tasks without race conditions.
 */
const activeSyncPromises = new Set<Promise<any>>();

export function trackSyncPromise(p: Promise<any>): void {
  activeSyncPromises.add(p);
  p.finally(() => {
    activeSyncPromises.delete(p);
  });
}

export async function waitForAllSyncs(): Promise<void> {
  while (activeSyncPromises.size > 0) {
    const list = Array.from(activeSyncPromises);
    await Promise.all(list);
  }
}
