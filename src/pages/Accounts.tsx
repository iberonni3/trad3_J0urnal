import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAccount } from '@/context/AccountContext';
import { useTrades } from '@/hooks/useTrades';
import { formatCurrency } from '@/lib/calculations';
import { PlusCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function Accounts() {
  const navigate = useNavigate();
  const { accounts, selectedAccount, selectAccount, createAccount, deleteAccount, isLoading, error } = useAccount();
  const { data: trades = [] } = useTrades();
  const [formState, setFormState] = useState({
    name: '',
    broker: '',
    initialBalance: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null);

  // Calculate current balance for each account
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};

    accounts.forEach(account => {
      // Get all closed trades for this account
      const accountTrades = trades.filter(
        trade => trade.accountId === account.id && trade.status === 'closed'
      );

      // Sum up P&L
      const totalPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

      // Current balance = initial balance + total P&L
      balances[account.id] = account.initialBalance + totalPnL;
    });

    return balances;
  }, [accounts, trades]);

  const resetForm = () => {
    setFormState({ name: '', broker: '', initialBalance: '' });
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const { name, broker, initialBalance } = formState;

    if (!name.trim()) {
      setFormError('Account name is required.');
      return;
    }

    const parsedBalance = Number(initialBalance);
    if (Number.isNaN(parsedBalance) || parsedBalance < 0) {
      setFormError('Initial balance must be a valid non-negative number.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createAccount({
        name: name.trim(),
        broker: broker.trim(),
        initialBalance: parsedBalance,
      });
      resetForm();
      // Redirect to dashboard after creating the first account
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating account:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (accountId: string, accountName: string) => {
    setAccountToDelete({ id: accountId, name: accountName });
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      setDeletingAccountId(accountToDelete.id);
      await deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    } catch (err) {
      console.error('Error deleting account:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete account.');
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <div className="content-spacing max-w-4xl">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Trading Accounts</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your trading accounts. Select an account to make it the default across the dashboard and analytics
          pages.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
            <CardDescription>Enter the broker details and starting balance for a new trading account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  placeholder="e.g. Primary Forex Account"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-broker">Broker</Label>
                <Input
                  id="account-broker"
                  placeholder="e.g. IC Markets"
                  value={formState.broker}
                  onChange={(event) => setFormState((prev) => ({ ...prev, broker: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-balance">Initial Balance</Label>
                <Input
                  id="account-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formState.initialBalance}
                  onChange={(event) => setFormState((prev) => ({ ...prev, initialBalance: event.target.value }))}
                  required
                />
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <PlusCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Accounts</CardTitle>
            <CardDescription>Select the account you wish to work with.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading accounts…</p>
            ) : error && error.message.includes('accounts') ? (
              <div className="text-sm text-destructive">
                {error.message}
                <br />
                Ensure the Supabase accounts table migration has been applied.
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No accounts yet. Create your first account to get started.</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => {
                  const isActive = selectedAccount?.id === account.id;
                  return (
                    <div
                      key={account.id}
                      className={`border rounded-lg p-4 flex flex-col gap-2 ${isActive ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{account.name}</h3>
                          {account.broker && (
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">{account.broker}</p>
                          )}
                        </div>
                        {isActive ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : null}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-between">
                        <span>Initial Balance</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(account.initialBalance).replace('+', '')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-between">
                        <span>Current Balance</span>
                        <span className={`font-semibold ${accountBalances[account.id] > account.initialBalance
                          ? 'text-green-600 dark:text-green-500'
                          : accountBalances[account.id] < account.initialBalance
                            ? 'text-red-600 dark:text-red-500'
                            : 'text-foreground'
                          }`}>
                          {formatCurrency(accountBalances[account.id] || account.initialBalance).replace('+', '')}
                          <span className="text-xs ml-1 opacity-70">
                            ({formatCurrency(accountBalances[account.id] - account.initialBalance)})
                          </span>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!isActive && (
                          <Button size="sm" variant="outline" onClick={() => selectAccount(account.id)} className="flex-1">
                            Set as Active
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(account.id, account.name)}
                          disabled={deletingAccountId === account.id}
                          className={isActive ? 'w-full' : ''}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingAccountId === account.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{accountToDelete?.name}"</span>?
              This action cannot be undone and will permanently remove this account from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

