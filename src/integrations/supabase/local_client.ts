// STANDALONE MOCK SUPABASE CLIENT ADAPTER
// Offline data reader with LocalStorage persistence 

import fallbackData from '../../../data_dump.json';

// Initialize LocalStorage with data_dump if empty
function initializeDB() {
  const CURRENT_DB_VERSION = 'v1.0.1'; // Increment this to force seed again
  const isSetup = localStorage.getItem('local_db_loaded');
  const storedVersion = localStorage.getItem('local_db_version');

  if (!isSetup || storedVersion !== CURRENT_DB_VERSION) {
    console.log('📦 Seeding Local Database from data_dump.json...');
    const tables = Object.keys(fallbackData);
    for (const table of tables) {
      localStorage.setItem(`db_${table}`, JSON.stringify(fallbackData[table as keyof typeof fallbackData]));
    }
    localStorage.setItem('local_db_loaded', 'true');
    localStorage.setItem('local_db_version', CURRENT_DB_VERSION);
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
    this.action = 'select';
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
    let data = getTableData(this.tableName);
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
      return { data: this.payload, error: null };
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
      let updatedData = [...data];
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
const MOCK_USER_ID = "9ec4e865-939b-4431-a16f-0611665798eb"; 
const MOCK_EMAIL = "djbabbly@gmail.com";

export const supabaseMock = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },
  auth: {
    getSession: () => {
      const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
      if (!isLoggedIn) return Promise.resolve({ data: { session: null }, error: null });
      return Promise.resolve({ data: { session: { user: { id: MOCK_USER_ID, email: MOCK_EMAIL } } }, error: null });
    },
    getUser: () => {
      const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
      if (!isLoggedIn) return Promise.resolve({ data: { user: null }, error: null });
      return Promise.resolve({ data: { user: { id: MOCK_USER_ID, email: MOCK_EMAIL } }, error: null });
    },
    onAuthStateChange: (cb: any) => {
      const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
      if (isLoggedIn) {
        cb("SIGNED_IN", { user: { id: MOCK_USER_ID, email: MOCK_EMAIL } });
      } else {
        cb("SIGNED_OUT", null);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: () => {
      localStorage.setItem('is_logged_in', 'true');
      return Promise.resolve({ data: { user: { id: MOCK_USER_ID, email: MOCK_EMAIL } }, error: null });
    },
    signInWithPassword: () => {
      localStorage.setItem('is_logged_in', 'true');
      return Promise.resolve({ data: { session: { user: { id: MOCK_USER_ID, email: MOCK_EMAIL } } }, error: null });
    },
    signOut: () => {
      localStorage.removeItem('is_logged_in');
      localStorage.removeItem('local_db_loaded');
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
  removeChannel: (channel: any) => {
    if (channel?.unsubscribe) channel.unsubscribe();
  },
};


