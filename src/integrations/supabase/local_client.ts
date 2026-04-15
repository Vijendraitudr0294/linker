// STANDALONE MOCK SUPABASE CLIENT ADAPTER
// Offline data reader with LocalStorage persistence 

import fallbackData from '../../../data_dump.json';

// Initialize LocalStorage with data_dump if empty
function initializeDB() {
  const CURRENT_DB_VERSION = 'v1.0.4'; // Forced increment for Blog & FAQ seeding
  const isSetup = localStorage.getItem('local_db_loaded');
  const storedVersion = localStorage.getItem('local_db_version');

  if (!isSetup || storedVersion !== CURRENT_DB_VERSION) {
    const rawData = (fallbackData as any).default || fallbackData;
    console.log('📦 Seeding Local Database from data_dump.json (Version ' + CURRENT_DB_VERSION + ')...');
    const tables = Object.keys(rawData);
    for (const table of tables) {
      const records = rawData[table];
      localStorage.setItem(`db_${table}`, JSON.stringify(records));
      if (table === 'profiles') {
        console.log(`✅ Loaded ${records?.length || 0} profiles into local storage.`);
      }
    }
    localStorage.setItem('local_db_loaded', 'true');
    localStorage.setItem('local_db_version', CURRENT_DB_VERSION);
  } else {
    const profiles = JSON.parse(localStorage.getItem('db_profiles') || '[]');
    console.log(`ℹ️ Local DB already initialized with ${profiles.length} profiles.`);
  }
}

initializeDB();

// Helper to fetch/save from LocalStorage
const getTableData = (tableName: string): any[] => {
  const data = localStorage.getItem(`db_${tableName}`);
  return data ? JSON.parse(data) : [];
};

const saveTableData = (tableName: string, data: any[]) => {
  localStorage.setItem(`db_${tableName}`, JSON.stringify(data));
};

// BroadcastChannel for cross-tab sync in local development
const dbChannel = new BroadcastChannel('local_db_sync');

// Mock Query Chain Builder
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(r: any) => boolean> = [];
  private action: string = 'select'; // Use string to allow 'upsert' and other extensions
  private payload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(query: string = '*') {
    // If we already have a mutation action, select just means we want data back
    if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'upsert' && this.action !== 'delete') {
      this.action = 'select';
    }
    return this; 
  }

  insert(record: any) {
    this.action = 'insert';
    this.payload = record;
    return this;
  }

  update(record: any) {
    this.action = 'update';
    this.payload = record;
    return this;
  }

  upsert(record: any, options?: { onConflict?: string }) {
    this.action = 'upsert';
    this.payload = record;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(key: string, value: any) {
    this.filters.push(r => r[key] === value);
    return this;
  }

  neq(key: string, value: any) {
    this.filters.push(r => r[key] !== value);
    return this;
  }

  in(key: string, values: any[]) {
    this.filters.push(r => Array.isArray(values) && values.includes(r[key]));
    return this;
  }

  gte(key: string, value: any) {
    this.filters.push(r => r[key] >= value);
    return this;
  }

  lte(key: string, value: any) {
    this.filters.push(r => r[key] <= value);
    return this;
  }

  match(filters: any) {
    this.filters.push(r => {
      for (const k in filters) {
        if (r[k] !== filters[k]) return false;
      }
      return true;
    });
    return this;
  }

  order(key: string, { ascending = true } = {}) {
    return this;
  }

  limit(count: number) {
    return this;
  }

  private async execute() {
    const data = getTableData(this.tableName);
    const matches = (r: any) => this.filters.length === 0 || this.filters.every(f => f(r));

    if (this.action === 'select') {
      let filtered = data.filter(matches);
      
      // Simulate relational counts for analytics (e.g., qr_scans(count))
      if (this.tableName === 'qr_codes') {
         const allScans = getTableData('qr_scans');
         filtered = filtered.map(qr => {
            const scans = allScans.filter(s => s.qr_code_id === qr.id);
            return {
               ...qr,
               qr_scans: [{ count: scans.length }]
            };
         });
      }
      
      return { data: filtered, error: null };
    }

    if (this.action === 'insert') {
      const records = Array.isArray(this.payload) ? this.payload : [this.payload];
      const newRecords = records.map(r => ({
        id: r.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...r
      }));
      const updatedData = [...data, ...newRecords];
      saveTableData(this.tableName, updatedData);
      dbChannel.postMessage({ table: this.tableName, event: 'INSERT', new: newRecords[0] });
      // Return the newly created record with its ID
      return { data: newRecords, error: null };
    }

    if (this.action === 'update') {
      let updated = false;
      const results: any[] = [];
      const newData = data.map(r => {
        if (matches(r)) {
          updated = true;
          const updatedRecord = { ...r, ...this.payload, updated_at: new Date().toISOString() };
          results.push(updatedRecord);
          return updatedRecord;
        }
        return r;
      });

      if (updated) {
        saveTableData(this.tableName, newData);
        dbChannel.postMessage({ 
          table: this.tableName, 
          event: 'UPDATE', 
          new: results[0]
        });
      }
      return { data: results[0] || null, error: null };
    }

    if (this.action === 'upsert') {
      const records = Array.isArray(this.payload) ? this.payload : [this.payload];
      const updatedData = [...data];
      const finalResults: any[] = [];

      for (const rec of records) {
        // Try to find a match. Upsert implies match by ID or unique key before filters.
        const matchIdx = updatedData.findIndex(r => {
          // Prioritize matching by ID if present in the record
          if (rec.id && r.id === rec.id) return true;
          // Then match by user_id if present (common for user-specific data)
          if (rec.user_id && r.user_id === rec.user_id) return true;
          // Finally, apply general filters if no specific ID/user_id match
          return this.filters.length > 0 && this.filters.every(f => f(r));
        });

        if (matchIdx !== -1) {
           const updated = { ...updatedData[matchIdx], ...rec, updated_at: new Date().toISOString() };
           updatedData[matchIdx] = updated;
           finalResults.push(updated);
        } else {
           const inserted = { 
             id: rec.id || crypto.randomUUID(), 
             created_at: new Date().toISOString(), 
             ...rec 
           };
           updatedData.push(inserted);
           finalResults.push(inserted);
        }
      }
      
      saveTableData(this.tableName, updatedData);
      dbChannel.postMessage({ 
        table: this.tableName, 
        event: 'UPDATE', // Use UPDATE as event type because most listeners expect UPDATE/INSERT/DELETE 
        new: finalResults[0]
      });
      return { data: finalResults[0], error: null };
    }

    if (this.action === 'delete') {
      const newData = data.filter(r => !matches(r));
      saveTableData(this.tableName, newData);
      dbChannel.postMessage({ table: this.tableName, event: 'DELETE' });
      return { data: null, error: null };
    }

    return { data: null, error: null };
  }

  async single() {
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    const result = Array.isArray(data) ? data[0] : data;
    return { data: result || null, error: result ? null : { message: 'Not found' } };
  }

  async maybeSingle() {
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    const result = Array.isArray(data) ? data[0] : data;
    return { data: result || null, error: null };
  }

  then(onfulfilled?: (value: any) => any) {
    return this.execute().then(onfulfilled);
  }
}

// Full Mock Client Export
const SUPERADMIN_USER_ID = "9ec4e865-939b-4431-a16f-0611665798eb"; 
const SUPERADMIN_EMAIL = "djbabbly@gmail.com";

// Resolve user identity from email — only djbabbly gets superadmin
const resolveUserByEmail = (email?: string): { id: string; email: string } => {
  const normalizedEmail = (email || "").trim().toLowerCase();

  // Check if this email exists in the local profiles DB
  const profiles = getTableData('profiles');
  const match = profiles.find((p: any) => p.email?.toLowerCase() === normalizedEmail);

  if (match) {
    return { id: match.user_id, email: match.email };
  }

  // Superadmin shortcut
  if (normalizedEmail === SUPERADMIN_EMAIL) {
    return { id: SUPERADMIN_USER_ID, email: SUPERADMIN_EMAIL };
  }

  // Unknown email — create a regular user profile on-the-fly
  const newUserId = crypto.randomUUID();
  const username = normalizedEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'user' + Math.floor(Math.random() * 9999);
  const newProfile = {
    id: crypto.randomUUID(),
    user_id: newUserId,
    name: username,
    email: normalizedEmail,
    username,
    bio: '',
    avatar_url: '',
    role: 'user',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    social_links: [],
    upi_id: '',
    social_stats: {},
    creator_metrics: {},
  };
  const allProfiles = [...profiles, newProfile];
  saveTableData('profiles', allProfiles);
  console.log(`✅ Created new mock user profile: ${normalizedEmail} (role: user)`);
  return { id: newUserId, email: normalizedEmail };
};

// Get currently logged-in user from localStorage
const getLoggedInUser = (): { id: string; email: string } | null => {
  const userId = localStorage.getItem('mock_user_id');
  const userEmail = localStorage.getItem('mock_user_email');
  if (!userId || !userEmail) return null;
  return { id: userId, email: userEmail };
};

const setLoggedInUser = (user: { id: string; email: string }) => {
  localStorage.setItem('is_logged_in', 'true');
  localStorage.setItem('mock_user_id', user.id);
  localStorage.setItem('mock_user_email', user.email);
};

const clearLoggedInUser = () => {
  localStorage.removeItem('is_logged_in');
  localStorage.removeItem('mock_user_id');
  localStorage.removeItem('mock_user_email');
};

export const supabaseMock = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },
  auth: {
    getSession: () => {
      const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
      const user = getLoggedInUser();
      if (!isLoggedIn || !user) return Promise.resolve({ data: { session: null }, error: null });
      return Promise.resolve({ data: { session: { user, access_token: 'mock-token' } }, error: null });
    },
    getUser: () => {
      const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
      const user = getLoggedInUser();
      if (!isLoggedIn || !user) return Promise.resolve({ data: { user: null }, error: null });
      return Promise.resolve({ data: { user }, error: null });
    },
    onAuthStateChange: (cb: any) => {
      const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
      const user = getLoggedInUser();
      if (isLoggedIn && user) {
        cb("SIGNED_IN", { user });
      } else {
        cb("SIGNED_OUT", null);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: ({ email: inputEmail }: { email?: string; password?: string } = {}) => {
      const user = resolveUserByEmail(inputEmail);
      setLoggedInUser(user);
      return Promise.resolve({ data: { user }, error: null });
    },
    signInWithPassword: ({ email: inputEmail }: { email?: string; password?: string } = {}) => {
      const user = resolveUserByEmail(inputEmail);
      setLoggedInUser(user);
      return Promise.resolve({ data: { user, session: { user, access_token: 'mock-token' } }, error: null });
    },
    signOut: () => {
      clearLoggedInUser();
      return Promise.resolve({ error: null });
    },
  },
  channel(name: string) {
    return {
      on: (event: string, config: any, callback: any) => {
        const handler = (msg: MessageEvent) => {
          if (msg.data && msg.data.table === config.table) {
             callback({ new: msg.data.new, event: msg.data.event });
          }
        };
        dbChannel.addEventListener('message', handler);
        return {
          subscribe: () => ({ 
            unsubscribe: () => dbChannel.removeEventListener('message', handler) 
          })
        };
      },
      subscribe: () => ({ unsubscribe: () => {} }),
    };
  },
  async rpc(name: string, params: any) {
    console.log(`🍦 Mock RPC Call: ${name}`, params);
    
    if (name === 'upsert_links') {
      const { p_user_id, p_links } = params;
      const data = getTableData('links');
      const results: any[] = [];
      const updatedData = [...data];

      for (const rec of (p_links || [])) {
        const matchIdx = updatedData.findIndex(r => r.id === rec.id && r.user_id === p_user_id);
        if (matchIdx !== -1) {
           const updated = { ...updatedData[matchIdx], ...rec, updated_at: new Date().toISOString() };
           updatedData[matchIdx] = updated;
           results.push(updated);
        } else {
           const inserted = { 
             id: rec.id || crypto.randomUUID(), 
             user_id: p_user_id,
             created_at: new Date().toISOString(), 
             clicks: 0,
             ...rec 
           };
           updatedData.push(inserted);
           results.push(inserted);
        }
      }
      
      saveTableData('links', updatedData);
      dbChannel.postMessage({ table: 'links', event: 'UPDATE', new: results[0] });
      return { data: results, error: null };
    }

    if (name === 'delete_links') {
      const { p_user_id, p_ids } = params;
      const data = getTableData('links');
      const newData = data.filter(r => !(r.user_id === p_user_id && p_ids.includes(r.id)));
      saveTableData('links', newData);
      dbChannel.postMessage({ table: 'links', event: 'DELETE' });
      return { data: p_ids.length, error: null };
    }

    if (name === 'reorder_links') {
      const { p_user_id, p_order } = params;
      const data = getTableData('links');
      const updatedData = [...data];
      
      for (const item of (p_order || [])) {
        const idx = updatedData.findIndex(r => r.id === item.id && r.user_id === p_user_id);
        if (idx !== -1) {
          updatedData[idx].sort_order = item.order_index;
        }
      }
      
      saveTableData('links', updatedData);
      return { data: p_order.length, error: null };
    }

    return { data: null, error: { message: `Mock RPC ${name} not implemented` } };
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        console.log(`📁 Mock Upload to ${bucket}/${path}`);
        // Simulate a delay
        await new Promise(r => setTimeout(r, 1000));
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://mock-storage.local/${bucket}/${path}` } };
      },
      list: async (path: string) => {
        return { data: [], error: null };
      },
      remove: async (paths: string[]) => {
        return { data: [], error: null };
      }
    })
  },
  removeChannel: (channel: any) => {
    if (channel?.unsubscribe) channel.unsubscribe();
  },
};



