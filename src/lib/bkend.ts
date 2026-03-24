import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Naming convention converters ---

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapRowFromSupabase(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key === 'id' ? '_id' : toCamelCase(key);
    result[camelKey] = value;
  }
  return result;
}

function mapBodyToSupabase(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === '_id') continue;
    const snakeKey = toSnakeCase(key);
    result[snakeKey] = value;
  }
  return result;
}

// Table name mapping: PascalCase (app) -> snake_case (Supabase)
const TABLE_MAP: Record<string, string> = {
  Pets: 'pets',
  Medications: 'medications',
  HealthRecords: 'health_records',
  ConditionLogs: 'condition_logs',
  Posts: 'posts',
  Comments: 'comments',
  Adoptions: 'adoptions',
};

// Tables that need user_id auto-injection on create
const TABLES_WITH_USER_ID = ['pets', 'posts', 'comments', 'adoptions'];

// --- Query param parser ---
function applyParams(
  query: ReturnType<ReturnType<typeof supabase.from>['select']>,
  params?: Record<string, string>,
) {
  if (!params) return query;

  let sortField: string | undefined;
  let sortAsc = true;
  let limit: number | undefined;

  for (const [key, value] of Object.entries(params)) {
    if (key === '_sort') { sortField = toSnakeCase(value); continue; }
    if (key === '_order') { sortAsc = value !== 'desc'; continue; }
    if (key === '_limit') { limit = parseInt(value, 10); continue; }

    // Range filters
    const gteMatch = key.match(/^(.+)_gte$/);
    if (gteMatch) {
      query = query.gte(toSnakeCase(gteMatch[1]), value);
      continue;
    }
    const lteMatch = key.match(/^(.+)_lte$/);
    if (lteMatch) {
      query = query.lte(toSnakeCase(lteMatch[1]), value);
      continue;
    }

    // Boolean string conversion
    const snakeKey = toSnakeCase(key);
    if (value === 'true') { query = query.eq(snakeKey, true); continue; }
    if (value === 'false') { query = query.eq(snakeKey, false); continue; }

    // Equality filter
    query = query.eq(snakeKey, value);
  }

  if (sortField) query = query.order(sortField, { ascending: sortAsc });
  if (limit) query = query.limit(limit);

  return query;
}

// --- Exported API (same interface as bkend.ai version) ---

export const bkend = {
  auth: {
    signup: async (body: { email: string; password: string; name?: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: { data: { nickname: body.name || 'User' } },
      });
      if (error) throw new Error(error.message);
      return {
        user: data.user ? {
          _id: data.user.id,
          email: data.user.email!,
          nickname: body.name || 'User',
          createdAt: data.user.created_at,
          updatedAt: data.user.created_at,
        } : null,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      };
    },

    signin: async (body: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
      if (error) throw new Error(error.message);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      return {
        user: {
          _id: data.user.id,
          email: data.user.email!,
          nickname: profile?.nickname || 'User',
          profileImage: profile?.profile_image,
          createdAt: data.user.created_at,
          updatedAt: profile?.updated_at || data.user.created_at,
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    },

    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new Error('Not authenticated');
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return {
        _id: user.id,
        email: user.email!,
        nickname: profile?.nickname || 'User',
        profileImage: profile?.profile_image,
        createdAt: user.created_at,
        updatedAt: profile?.updated_at || user.created_at,
      };
    },

    refresh: async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw new Error(error.message);
      return data;
    },

    signout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    },
  },

  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: async (table: string, params?: Record<string, string>): Promise<any[]> => {
      const t = TABLE_MAP[table] || table.toLowerCase();
      let query = supabase.from(t).select('*');
      query = applyParams(query, params);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data || []).map(mapRowFromSupabase);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: async (table: string, id: string): Promise<any> => {
      const t = TABLE_MAP[table] || table.toLowerCase();
      const { data, error } = await supabase.from(t).select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return mapRowFromSupabase(data);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async (table: string, body: unknown): Promise<any> => {
      const t = TABLE_MAP[table] || table.toLowerCase();
      const mapped = mapBodyToSupabase(body as Record<string, unknown>);

      if (TABLES_WITH_USER_ID.includes(t) && !mapped.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) mapped.user_id = user.id;
      }

      const { data, error } = await supabase.from(t).insert(mapped).select().single();
      if (error) throw new Error(error.message);
      return mapRowFromSupabase(data);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async (table: string, id: string, body: unknown): Promise<any> => {
      const t = TABLE_MAP[table] || table.toLowerCase();
      const mapped = mapBodyToSupabase(body as Record<string, unknown>);
      const { data, error } = await supabase.from(t).update(mapped).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return mapRowFromSupabase(data);
    },

    delete: async (table: string, id: string): Promise<void> => {
      const t = TABLE_MAP[table] || table.toLowerCase();
      const { error } = await supabase.from(t).delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  },
};

// Deprecated - kept for backward compatibility
export async function bkendFetch(): Promise<never> {
  throw new Error('bkendFetch is deprecated. Use supabase client directly.');
}
