import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { TradingAccount, AccountInput } from '@/types/account';
import { createAccount as supabaseCreateAccount, fetchAccounts } from '@/lib/supabase/accounts';

type AccountContextValue = {
  accounts: TradingAccount[];
  selectedAccount: TradingAccount | null;
  selectAccount: (accountId: string) => void;
  createAccount: (input: AccountInput) => Promise<TradingAccount>;
  refreshAccounts: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
};

const AccountContext = createContext<AccountContextValue | undefined>(undefined);
const STORAGE_KEY = 'tradejournal:selectedAccount';

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAccounts(user.id);
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError(err instanceof Error ? err : new Error('Failed to load accounts'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Track if accounts have been loaded for current user to prevent refetches
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAccounts([]);
      setSelectedAccountId(null);
      setLoadedUserId(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsLoading(false);
      return;
    }
    // Only load accounts if user has changed
    if (user.id !== loadedUserId) {
      setLoadedUserId(user.id);
      void loadAccounts();
    }
  }, [authLoading, user, loadAccounts, loadedUserId]);

  useEffect(() => {
    if (!accounts.length) return;
    const exists = accounts.some((account) => account.id === selectedAccountId);
    if (!exists) {
      const fallbackId = accounts[0].id;
      setSelectedAccountId(fallbackId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, fallbackId);
      }
    }
  }, [accounts, selectedAccountId]);

  const selectAccount = useCallback((accountId: string) => {
    setSelectedAccountId(accountId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, accountId);
    }
  }, []);

  const createAccount = useCallback(
    async (input: AccountInput) => {
      if (!user) throw new Error('User not authenticated');
      const newAccount = await supabaseCreateAccount(user.id, input);
      setAccounts((prev) => [...prev, newAccount]);
      selectAccount(newAccount.id);
      return newAccount;
    },
    [selectAccount, user],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      accounts,
      selectedAccount: accounts.find((account) => account.id === selectedAccountId) ?? null,
      selectAccount,
      createAccount,
      refreshAccounts: loadAccounts,
      isLoading: isLoading || authLoading,
      error,
    }),
    [accounts, selectedAccountId, selectAccount, createAccount, loadAccounts, isLoading, authLoading, error],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

