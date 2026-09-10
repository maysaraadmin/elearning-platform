import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { ErrorState } from '../components/ui/ErrorState';
import { formatNumber } from '../utils/helpers';
import { healthApi } from '../api/client';
import { ServiceHealth } from '../types';

const statCards = [
  { title: 'Total Users', key: 'users', icon: UsersIcon, color: 'indigo' },
  { title: 'Courses', key: 'courses', icon: BookIcon, color: 'green' },
  { title: 'Videos', key: 'videos', icon: VideoIcon, color: 'purple' },
  { title: 'Enrollments', key: 'enrollments', icon: EnrollmentIcon, color: 'orange' },
  { title: 'Revenue', key: 'revenue', icon: DollarIcon, color: 'emerald' },
  { title: 'Active Now', key: 'active', icon: ActivityIcon, color: 'red' },
];

function UsersIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function BookIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
}
function VideoIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
}
function EnrollmentIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
}
function DollarIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ActivityIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}

const colorClasses = {
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-500',
};

const colorBgClasses = {
  indigo: 'bg-indigo-100 text-indigo-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
};

export function DashboardPage() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({
    users: 1234,
    courses: 89,
    videos: 456,
    enrollments: 5678,
    revenue: 125000,
    active: 234,
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await healthApi.checkAll();
        setServices(data);
      } catch (err) {
        setServicesError(err instanceof Error ? err.message : 'Failed to load service health');
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of platform metrics and service health</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.key} padding="md" hover>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats[stat.key])}
                </p>
              </div>
              <div className={classNames('p-3 rounded-xl', colorBgClasses[stat.color as keyof typeof colorBgClasses])}>
                <stat.icon className={classNames('w-6 h-6', colorClasses[stat.color as keyof typeof colorClasses])} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingServices ? (
              <Loading text="Checking service health..." />
            ) : servicesError ? (
              <ErrorState message={servicesError} onRetry={() => window.location.reload()} />
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.service} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <Badge variant="status" status={service.status} size="sm">
                        {service.status}
                      </Badge>
                      <span className="font-medium text-gray-900">{service.service}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {service.latency_ms ? `${service.latency_ms}ms` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400">Last checked: {new Date(service.last_check).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/courses/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <BookIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-900">Create Course</span>
              </a>
              <a href="/users/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-900">Add User</span>
              </a>
              <a href="/videos/upload" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-900">Upload Video</span>
              </a>
              <a href="/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-900">View Analytics</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}