import type {
  AppNotification,
  Booking,
  BookingDraft,
  NotificationKind,
  Passenger,
  SearchHistoryEntry,
  UserProfile,
} from "@/lib/domain/types";

/**
 * Typed local-storage repository.
 *
 * Browser-only persistence for this demo build. Each collection has an
 * isolated read/write API so it can be replaced by database-backed calls
 * without touching UI code.
 */

const KEYS = {
  bookings: "journyx.bookings.v1",
  notifications: "journyx.notifications.v1",
  profile: "journyx.profile.v1",
  draft: "journyx.draft.v1",
  history: "journyx.history.v1",
  session: "journyx.session.v1",
} as const;

type Key = (typeof KEYS)[keyof typeof KEYS];

const listeners = new Set<() => void>();

export function subscribeRepo(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

function read<T>(key: Key, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: Key, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the app keeps working in-memory for this session */
  }
  emit();
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/* ------------------------------- bookings -------------------------------- */

export const bookingsRepo = {
  list(): Booking[] {
    return read<Booking[]>(KEYS.bookings, []);
  },
  get(id: string): Booking | undefined {
    return bookingsRepo.list().find((b) => b.id === id || b.reference === id);
  },
  save(booking: Booking) {
    const all = bookingsRepo.list();
    const idx = all.findIndex((b) => b.id === booking.id);
    if (idx >= 0) all[idx] = booking;
    else all.unshift(booking);
    write(KEYS.bookings, all);
    return booking;
  },
  remove(id: string) {
    write(
      KEYS.bookings,
      bookingsRepo.list().filter((b) => b.id !== id),
    );
  },
};

/* ----------------------------- notifications ----------------------------- */

export const notificationsRepo = {
  list(): AppNotification[] {
    return read<AppNotification[]>(KEYS.notifications, []);
  },
  push(input: {
    kind: NotificationKind;
    title: string;
    body: string;
    bookingId?: string;
  }) {
    const item: AppNotification = {
      id: newId("ntf"),
      createdAtISO: new Date().toISOString(),
      read: false,
      ...input,
    };
    write(KEYS.notifications, [item, ...notificationsRepo.list()].slice(0, 60));
    return item;
  },
  markAllRead() {
    write(
      KEYS.notifications,
      notificationsRepo.list().map((n) => ({ ...n, read: true })),
    );
  },
  clear() {
    write(KEYS.notifications, []);
  },
  unreadCount() {
    return notificationsRepo.list().filter((n) => !n.read).length;
  },
};

/* -------------------------------- profile -------------------------------- */

export function defaultProfile(input: {
  fullName: string;
  email: string;
  phone: string;
  role?: "user" | "admin";
}): UserProfile {
  return {
    id: newId("usr"),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    role: input.role ?? "user",
    preferences: {
      preferredTransport: "bus",
      preferredSeat: "window",
      preferAC: true,
    },
    notificationSettings: {
      bookingUpdates: true,
      tripReminders: true,
      offers: false,
    },
    savedPassengers: [],
  };
}

export const profileRepo = {
  get(): UserProfile | null {
    return read<UserProfile | null>(KEYS.profile, null);
  },
  save(profile: UserProfile) {
    write(KEYS.profile, profile);
    return profile;
  },
  signOut() {
    write(KEYS.session, { signedIn: false });
  },
  signIn() {
    write(KEYS.session, { signedIn: true });
  },
  isSignedIn(): boolean {
    return read<{ signedIn: boolean }>(KEYS.session, { signedIn: false }).signedIn;
  },
  addPassenger(passenger: Passenger) {
    const profile = profileRepo.get();
    if (!profile) return null;
    const existing = profile.savedPassengers.filter((p) => p.id !== passenger.id);
    return profileRepo.save({
      ...profile,
      savedPassengers: [...existing, passenger].slice(0, 10),
    });
  },
  removePassenger(id: string) {
    const profile = profileRepo.get();
    if (!profile) return null;
    return profileRepo.save({
      ...profile,
      savedPassengers: profile.savedPassengers.filter((p) => p.id !== id),
    });
  },
};

/* --------------------------------- draft --------------------------------- */

export const draftRepo = {
  get(): BookingDraft | null {
    return read<BookingDraft | null>(KEYS.draft, null);
  },
  save(draft: BookingDraft) {
    write(KEYS.draft, draft);
    return draft;
  },
  patch(patch: Partial<BookingDraft>): BookingDraft | null {
    const current = draftRepo.get();
    if (!current) return null;
    return draftRepo.save({ ...current, ...patch });
  },
  clear() {
    write<BookingDraft | null>(KEYS.draft, null);
  },
};

/* ----------------------------- search history ---------------------------- */

export const historyRepo = {
  list(): SearchHistoryEntry[] {
    return read<SearchHistoryEntry[]>(KEYS.history, []);
  },
  push(entry: Omit<SearchHistoryEntry, "id" | "createdAtISO">) {
    const item: SearchHistoryEntry = {
      ...entry,
      id: newId("sh"),
      createdAtISO: new Date().toISOString(),
    };
    const deduped = historyRepo
      .list()
      .filter(
        (e) =>
          !(
            e.from === item.from &&
            e.to === item.to &&
            e.date === item.date &&
            e.transportType === item.transportType
          ),
      );
    write(KEYS.history, [item, ...deduped].slice(0, 8));
  },
};
