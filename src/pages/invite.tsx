import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '../auth/useAuth';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

// Determine backend URL based on env vars (same logic as dashboard-data.ts)
const BACKEND_BASE_URL =
  (import.meta as any).env?.VITE_ENV_MODE === 'production'
    ? (import.meta as any).env?.VITE_PROD_BACKEND_URL
    : (import.meta as any).env?.VITE_DEV_BACKEND_URL;

const Invite: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { getAuthToken } = useAuth();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const token = await getAuthToken();
      const response = await fetch(`${BACKEND_BASE_URL}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex flex-1 flex-col gap-4">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Invite</h3>
              <div className="flex items-center justify-center p-4">
                <form
                onSubmit={handleInvite}
                className="p-8 bg-secondary rounded-xl shadow-md w-full max-w-sm space-y-4"
                >
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Invite User</h3>
                    <Input
                        className="border-white"
                        type="email"
                        placeholder="Enter user email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Inviting...' : 'Send Invite'}
                    </Button>
                    {status === 'success' && <p className="text-green-500">Invitation sent!</p>}
                    {status === 'error' && <p className="text-red-500">Failed to send invitation.</p>}
                </form> 
            </div>
            </div>
          </div>

          {/* <div className="flex items-center justify-center p-4">
            <form
              onSubmit={handleInvite}
              className="p-8 bg-secondary rounded-xl shadow-md w-full max-w-sm space-y-4"
            >
              <Input
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Inviting...' : 'Send Invite'}
              </Button>
              {status === 'success' && <p className="text-green-500">Invitation sent!</p>}
              {status === 'error' && <p className="text-red-500">Failed to send invitation.</p>}
            </form>
          </div> */}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Invite;
