import { useState, useEffect } from 'react';
import { Table, Pagination, Loading, EmptyState, ErrorState } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PageHeader } from '../components/layout/MainLayout';
import { analyticsApi } from '../api/client';
import { Event, Metric, Report, PaginatedResponse } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, classNames } from '../utils/helpers';
import { FormField, FormActions } from '../components/forms';

const eventTypeOptions = [
  { value: '', label: 'All Events' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'course_view', label: 'Course View' },
  { value: 'lesson_start', label: 'Lesson Start' },
  { value: 'lesson_complete', label: 'Lesson Complete' },
  { value: 'video_play', label: 'Video Play' },
  { value: 'video_pause', label: 'Video Pause' },
  { value: 'video_complete', label: 'Video Complete' },
  { value: 'quiz_start', label: 'Quiz Start' },
  { value: 'quiz_submit', label: 'Quiz Submit' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'certificate_download', label: 'Certificate Download' },
  { value: 'search', label: 'Search' },
];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'metrics' | 'reports'>('events');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const { page: eventsPage, pageSize: eventsPageSize, totalPages: eventsTotalPages, totalItems: eventsTotalItems, setPage: setEventsPage, setPageSize: setEventsPageSize, updateFromResponse: updateEventsResponse, reset: resetEvents } = usePagination();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricSearch, setMetricSearch] = useState('');
  const { page: metricsPage, pageSize: metricsPageSize, totalPages: metricsTotalPages, totalItems: metricsTotalItems, setPage: setMetricsPage, setPageSize: setMetricsPageSize, updateFromResponse: updateMetricsResponse, reset: resetMetrics } = usePagination();

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const { page: reportsPage, pageSize: reportsPageSize, totalPages: reportsTotalPages, totalItems: reportsTotalItems, setPage: setReportsPage, setPageSize: setReportsPageSize, updateFromResponse: updateReportsResponse, reset: resetReports } = usePagination();

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const response = await analyticsApi.events.list(eventsPage, eventsPageSize);
      setEvents(response.items);
      updateEventsResponse(response);
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const response = await analyticsApi.metrics.list(metricsPage, metricsPageSize);
      setMetrics(response.items);
      updateMetricsResponse(response);
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const response = await analyticsApi.reports.list(reportsPage, reportsPageSize);
      setReports(response.items);
      updateReportsResponse(response);
    } catch (err) {
      setReportsError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'events') fetchEvents();
    else if (activeTab === 'metrics') fetchMetrics();
    else fetchReports();
  }, [activeTab, eventsPage, eventsPageSize, metricsPage, metricsPageSize, reportsPage, reportsPageSize, eventSearch, eventTypeFilter, metricSearch]);

  const handleEventSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventSearch(e.target.value);
    resetEvents();
  };

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEventTypeFilter(e.target.value);
    resetEvents();
  };

  const handleEventPageSizeChange = (size: number) => {
    setEventsPageSize(size);
    resetEvents();
  };

  const handleMetricSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetricSearch(e.target.value);
    resetMetrics();
  };

  const handleMetricPageSizeChange = (size: number) => {
    setMetricsPageSize(size);
    resetMetrics();
  };

  const handleReportPageSizeChange = (size: number) => {
    setReportsPageSize(size);
    resetReports();
  };

  const eventColumns = [
    { key: 'event_type', header: 'Event Type', render: (e: Event) => <Badge variant="default" size="sm">{e.event_type}</Badge> },
    { key: 'user_id', header: 'User', render: (e: Event) => e.user_id || 'Anonymous' },
    { key: 'session_id', header: 'Session', render: (e: Event) => e.session_id || '—' },
    { key: 'entity_type', header: 'Entity', render: (e: Event) => e.entity_type || '—' },
    { key: 'entity_id', header: 'Entity ID', render: (e: Event) => e.entity_id ? <span className="font-mono text-sm">{e.entity_id.slice(0, 8)}...</span> : '—' },
    { key: 'ip_address', header: 'IP', render: (e: Event) => e.ip_address || '—' },
    { key: 'created_at', header: 'Timestamp', render: (e: Event) => formatDate(e.created_at) },
  ];

  const metricColumns = [
    { key: 'name', header: 'Metric', render: (m: Metric) => <span className="font-medium">{m.name}</span> },
    { key: 'value', header: 'Value', render: (m: Metric) => m.value.toLocaleString() },
    { key: 'aggregation', header: 'Aggregation', render: (m: Metric) => <Badge variant="default" size="sm">{m.aggregation}</Badge> },
    { key: 'period_start', header: 'Period Start', render: (m: Metric) => formatDate(m.period_start) },
    { key: 'period_end', header: 'Period End', render: (m: Metric) => formatDate(m.period_end) },
  ];

  const reportColumns = [
    { key: 'name', header: 'Name', render: (r: Report) => <span className="font-medium">{r.name}</span> },
    { key: 'report_type', header: 'Type', render: (r: Report) => <Badge variant="default" size="sm">{r.report_type}</Badge> },
    { key: 'generated_by', header: 'Generated By', render: (r: Report) => r.generated_by },
    { key: 'generated_at', header: 'Generated', render: (r: Report) => formatDate(r.generated_at) },
    { key: 'file_url', header: 'File', render: (r: Report) => r.file_url ? <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">Download</a> : '—' },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (r: Report) => (
        <Button variant="ghost" size="sm" onClick={() => {}} disabled={!r.file_url}>
          {r.file_url ? 'Download' : 'Generate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track events, metrics, and generate reports"
        action={activeTab === 'reports' && (
          <Button onClick={() => setIsReportModalOpen(true)}>Generate Report</Button>
        )}
      />

      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Analytics tabs">
          {(['events', 'metrics', 'reports'] as const).map((tab) => (
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

      <Card padding="none">
        <CardContent className="p-0">
          {activeTab === 'events' && (
            <EventsTab
              events={events}
              isLoading={eventsLoading}
              error={eventsError}
              onRetry={fetchEvents}
              search={eventSearch}
              onSearchChange={handleEventSearch}
              typeFilter={eventTypeFilter}
              onTypeChange={handleEventTypeChange}
              columns={eventColumns}
              page={eventsPage}
              totalPages={eventsTotalPages}
              totalItems={eventsTotalItems}
              pageSize={eventsPageSize}
              onPageChange={setEventsPage}
              onPageSizeChange={handleEventPageSizeChange}
            />
          )}
          {activeTab === 'metrics' && (
            <MetricsTab
              metrics={metrics}
              isLoading={metricsLoading}
              error={metricsError}
              onRetry={fetchMetrics}
              search={metricSearch}
              onSearchChange={handleMetricSearch}
              columns={metricColumns}
              page={metricsPage}
              totalPages={metricsTotalPages}
              totalItems={metricsTotalItems}
              pageSize={metricsPageSize}
              onPageChange={setMetricsPage}
              onPageSizeChange={handleMetricPageSizeChange}
            />
          )}
          {activeTab === 'reports' && (
            <ReportsTab
              reports={reports}
              isLoading={reportsLoading}
              error={reportsError}
              onRetry={fetchReports}
              columns={reportColumns}
              page={reportsPage}
              totalPages={reportsTotalPages}
              totalItems={reportsTotalItems}
              pageSize={reportsPageSize}
              onPageChange={setReportsPage}
              onPageSizeChange={handleReportPageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={async (formData) => {
          setIsSubmittingReport(true);
          try {
            await analyticsApi.reports.create(formData);
            setIsReportModalOpen(false);
            fetchReports();
          } catch (err) {
            setReportsError(err instanceof Error ? err.message : 'Failed to generate report');
          } finally {
            setIsSubmittingReport(false);
          }
        }}
        isSubmitting={isSubmittingReport}
      />
    </div>
  );
}

function EventsTab({ events, isLoading, error, onRetry, search, onSearchChange, typeFilter, onTypeChange, columns, page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }: any) {
  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input placeholder="Search events..." value={search} onChange={onSearchChange} className="flex-1 max-w-md" />
        <Select options={eventTypeOptions} value={typeFilter} onChange={onTypeChange} className="w-56" />
      </div>
      {isLoading ? <Loading /> : error ? <ErrorState message={error} onRetry={onRetry} /> : events.length === 0 ? <EmptyState title="No events found" /> : (
        <>
          <Table columns={columns} data={events} keyExtractor={(e: any) => e.id} isLoading={isLoading} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} showPageSize pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
        </>
      )}
    </div>
  );
}

function MetricsTab({ metrics, isLoading, error, onRetry, search, onSearchChange, columns, page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }: any) {
  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input placeholder="Search metrics..." value={search} onChange={onSearchChange} className="flex-1 max-w-md" />
      </div>
      {isLoading ? <Loading /> : error ? <ErrorState message={error} onRetry={onRetry} /> : metrics.length === 0 ? <EmptyState title="No metrics found" /> : (
        <>
          <Table columns={columns} data={metrics} keyExtractor={(m: any) => m.id} isLoading={isLoading} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} showPageSize pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
        </>
      )}
    </div>
  );
}

function ReportsTab({ reports, isLoading, error, onRetry, columns, page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }: any) {
  return (
    <div className="p-4">
      {isLoading ? <Loading /> : error ? <ErrorState message={error} onRetry={onRetry} /> : reports.length === 0 ? <EmptyState title="No reports found" description="Generate your first report" /> : (
        <>
          <Table columns={columns} data={reports} keyExtractor={(r: any) => r.id} isLoading={isLoading} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} showPageSize pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
        </>
      )}
    </div>
  );
}

function ReportModal({ isOpen, onClose, onSubmit, isSubmitting }: { isOpen: boolean; onClose: () => void; onSubmit: (data: Partial<Report>) => Promise<void>; isSubmitting: boolean }) {
  const [formData, setFormData] = useState<Partial<Report>>({
    name: '',
    report_type: 'user_activity',
    parameters: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Report" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <FormField label="Report Name" required>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Monthly User Activity" />
          </FormField>
          <FormField label="Report Type" required>
            <Select
              options={[
                { value: 'user_activity', label: 'User Activity' },
                { value: 'course_performance', label: 'Course Performance' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'engagement', label: 'Engagement' },
                { value: 'completion_rates', label: 'Completion Rates' },
              ]}
              value={formData.report_type}
              onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
            />
          </FormField>
        </div>
        <FormActions onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} submitLabel="Generate" />
      </form>
    </Modal>
  );
}