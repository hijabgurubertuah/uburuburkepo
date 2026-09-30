// Firebase integration disconnected per user request.
// All app layout and preferences run 100% locally in browser memory and localStorage.

import { LockedLayoutConfig } from './config/lockedLayout';

export async function testFirestoreConnection(): Promise<void> {
  // Disconnected
}

export async function fetchRemoteTextLayout(): Promise<LockedLayoutConfig | null> {
  return null;
}

export async function saveRemoteTextLayout(_layout: LockedLayoutConfig): Promise<void> {
  // Disconnected
}
