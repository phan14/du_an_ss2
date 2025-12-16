
import { User } from '../types';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'arden_user_session';

// --- SUPABASE AUTH IMPLEMENTATION ---

export const getUsers = async (): Promise<User[]> => {
  // In a real app, you shouldn't fetch passwords, but for this simple port we will
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error(error);
    return [];
  }
  return data.map((u: any) => ({
    username: u.username,
    password: u.password,
    name: u.name,
    role: u.role
  }));
};

// Note: getUsers above is async now, but the Staff component expects sync or promise.
// We will rely on the components waiting for promises.

export const saveUser = async (user: User): Promise<void> => {
  const { error } = await supabase.from('users').upsert({
    username: user.username,
    password: user.password,
    name: user.name,
    role: user.role
  });
  if (error) throw error;
};

export const deleteUser = async (username: string): Promise<void> => {
  const { error } = await supabase.from('users').delete().eq('username', username);
  if (error) throw error;
};

export const login = async (username: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    return null;
  }

  const sessionUser: User = { 
    username: data.username, 
    name: data.name, 
    role: data.role 
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};
