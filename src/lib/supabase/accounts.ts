import { supabase } from '@/integrations/supabase/client';
import type { TradingAccount, AccountInput } from '@/types/account';

type AccountRow = {
  id: string;
  user_id: string;
  name: string;
  broker: string;
  initial_balance: number;
  created_at: string;
  updated_at: string;
};

const mapAccount = (row: AccountRow): TradingAccount => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  broker: row.broker,
  initialBalance: Number(row.initial_balance ?? 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const tableNotFound = (error: any) =>
  error?.code === '42P01'
    ? Object.assign(new Error('Supabase table "accounts" was not found.'), { code: 'TABLE_NOT_FOUND' })
    : error;

export const fetchAccounts = async (userId: string): Promise<TradingAccount[]> => {
  const { data, error } = await supabase
    .from<AccountRow>('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw tableNotFound(error);

  return (data ?? []).map(mapAccount);
};

export const createAccount = async (userId: string, input: AccountInput): Promise<TradingAccount> => {
  const { data, error } = await supabase
    .from<AccountRow>('accounts')
    .insert({
      user_id: userId,
      name: input.name,
      broker: input.broker,
      initial_balance: input.initialBalance,
    })
    .select()
    .single();

  if (error) throw tableNotFound(error);
  if (!data) throw new Error('Unable to create account.');

  return mapAccount(data);
};

export const updateAccount = async (
  userId: string,
  accountId: string,
  updates: Partial<AccountInput>,
): Promise<TradingAccount> => {
  const { data, error } = await supabase
    .from<AccountRow>('accounts')
    .update({
      name: updates.name,
      broker: updates.broker,
      initial_balance: updates.initialBalance,
    })
    .eq('id', accountId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw tableNotFound(error);
  if (!data) throw new Error('Unable to update account.');

  return mapAccount(data);
};

export const deleteAccount = async (userId: string, accountId: string) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId);

  if (error) throw tableNotFound(error);
};

