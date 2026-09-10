import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { FormField, FormActions, FormSection, FormRow } from '../components/forms';
import { PageHeader } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import { api } from '../api/client';
import { formatDate, classNames, getRoleColor } from '../utils/helpers';

const roleOptions: { value: Role; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
];

export function SettingsPage() {
  const { user, token, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'api'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<Partial<User>>({
    full_name: '',
    email: '',
    bio: '',
    timezone: 'UTC',
    language: 'en',
  });

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    theme: 'system',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name,
        email: user.email,
        bio: user.bio || '',
        timezone: user.timezone,
        language: user.language,
      });
    }
  }, [user]);

  const fetchApiKey = async () => {
    try {
      // In a real app, this would call an API endpoint
      setApiKey('elp_live_' + Math.random().toString(36).substring(2, 34));
    } catch {
      setError('Failed to load API key');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Profile updated successfully');
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Preferences saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateApiKey = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setApiKey('elp_live_' + Math.random().toString(36).substring(2, 34));
      setSuccess('New API key generated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate API key');
    } finally {
      setIsLoading(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setSuccess('API key copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings and preferences" />

      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Settings tabs">
          {(['profile', 'preferences', 'security', 'api'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700" role="alert">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1">
          <Card padding="md">
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatar_url} name={user?.full_name} size="xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.full_name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <Badge variant="status" status={user?.role || 'student'} className="mt-1">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
              <p className="text-gray-500">Member since: <span className="text-gray-900 font-medium">{user ? formatDate(user.created_at) : '—'}</span></p>
              <p className="text-gray-500">Last login: <span className="text-gray-900 font-medium">{user?.last_login ? formatDate(user.last_login) : 'Never'}</span></p>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={logout}>
              Sign Out
            </Button>
          </Card>
        </aside>

        <main className="lg:col-span-2">
          <Card padding="lg">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <FormSection title="Profile Information">
                  <FormField label="Full Name" required>
                    <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required />
                  </FormField>
                  <FormField label="Email" required>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required disabled />
                  </FormField>
                  <FormRow>
                    <FormField label="Timezone">
                      <Select
                        options={[
                          { value: 'UTC', label: 'UTC' },
                          { value: 'America/New_York', label: 'Eastern Time' },
                          { value: 'America/Chicago', label: 'Central Time' },
                          { value: 'America/Denver', label: 'Mountain Time' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time' },
                          { value: 'Europe/London', label: 'London' },
                          { value: 'Europe/Paris', label: 'Paris' },
                          { value: 'Asia/Tokyo', label: 'Tokyo' },
                          { value: 'Asia/Shanghai', label: 'Shanghai' },
                        ]}
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      />
                    </FormField>
                    <FormField label="Language">
                      <Select
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Spanish' },
                          { value: 'fr', label: 'French' },
                          { value: 'de', label: 'German' },
                          { value: 'zh', label: 'Chinese' },
                          { value: 'ja', label: 'Japanese' },
                        ]}
                        value={profile.language}
                        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      />
                    </FormField>
                  </FormRow>
                  <FormField label="Bio">
                    <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={4} placeholder="Tell us about yourself..." />
                  </FormField>
                </FormSection>

                <FormActions onSubmit={handleProfileSubmit} isSubmitting={isLoading} submitLabel="Save Profile" />
              </form>
            )}

            {activeTab === 'preferences' && (
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <FormSection title="Notifications">
                  <FormField>
                    <Input type="checkbox" checked={preferences.email_notifications} onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })} id="email_notifications" />
                    <label htmlFor="email_notifications" className="text-sm font-medium text-gray-700">Email notifications</label>
                  </FormField>
                  <FormField>
                    <Input type="checkbox" checked={preferences.push_notifications} onChange={(e) => setPreferences({ ...preferences, push_notifications: e.target.checked })} id="push_notifications" />
                    <label htmlFor="push_notifications" className="text-sm font-medium text-gray-700">Push notifications</label>
                  </FormField>
                  <FormField>
                    <Input type="checkbox" checked={preferences.marketing_emails} onChange={(e) => setPreferences({ ...preferences, marketing_emails: e.target.checked })} id="marketing_emails" />
                    <label htmlFor="marketing_emails" className="text-sm font-medium text-gray-700">Marketing emails</label>
                  </FormField>
                </FormSection>

                <FormSection title="Appearance">
                  <FormField label="Theme">
                    <Select
                      options={[
                        { value: 'system', label: 'System' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                      ]}
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    />
                  </FormField>
                </FormSection>

                <FormActions onSubmit={handlePreferencesSubmit} isSubmitting={isLoading} submitLabel="Save Preferences" />
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <FormSection title="Change Password">
                  <FormField label="Current Password" required>
                    <Input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} required autoComplete="current-password" />
                  </FormField>
                  <FormField label="New Password" required>
                    <Input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} required autoComplete="new-password" minLength={8} />
                    <p className="text-sm text-gray-500">Must be at least 8 characters</p>
                  </FormField>
                  <FormField label="Confirm New Password" required>
                    <Input type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} required autoComplete="new-password" />
                  </FormField>
                </FormSection>

                <FormSection title="Two-Factor Authentication">
                  <p className="text-gray-600">Add an extra layer of security to your account.</p>
                  <Button variant="outline" type="button">Enable 2FA</Button>
                </FormSection>

                <FormSection title="Active Sessions">
                  <p className="text-gray-600">Manage your active login sessions.</p>
                  <Button variant="outline" type="button">View Sessions</Button>
                </FormSection>

                <FormActions onSubmit={handlePasswordSubmit} isSubmitting={isLoading} submitLabel="Change Password" />
              </form>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <FormSection title="API Access">
                  <p className="text-gray-600">Use API keys to authenticate requests to the E-Learning Platform API.</p>
                </FormSection>

                <FormSection title="Your API Keys">
                  {apiKey ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border border-gray-200 rounded-lg font-mono text-sm text-gray-900 flex-1 max-w-md">
                          {apiKey}
                        </div>
                        <Badge variant="success" size="sm">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyApiKey}>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2v0M8 5a2 2 0 002 2h2a2 2 0 002-2V5m0 0v1m0-1h-2M8 5h2a2 2 0 012 2v2M8 5h2a2 2 0 002-2V5" /></svg>
                          Copy
                        </Button>
                        <Button variant="danger" size="sm" onClick={regenerateApiKey} isLoading={isLoading}>
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-500">No API key generated yet</p>
                      <Button variant="primary" className="mt-3" onClick={regenerateApiKey} isLoading={isLoading}>
                        Generate API Key
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">Keep your API key secure. It will only be shown once.</p>
                </FormSection>

                <FormSection title="API Documentation">
                  <p className="text-gray-600">Base URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">{import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}</code></p>
                  <p className="text-gray-600 mt-2">Include the API key in the Authorization header: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">{"Authorization: Bearer <your_api_key>"}</code></p>
                </FormSection>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}