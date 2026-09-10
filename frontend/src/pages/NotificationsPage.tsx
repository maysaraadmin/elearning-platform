import { useState, useEffect } from 'react';
import { Table, Pagination, Loading, EmptyState, ErrorState, Card } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { PageHeader } from '../components/layout/MainLayout';
import { notificationsApi } from '../api/client';
import { Notification, User } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, formatRelativeTime, classNames } from '../utils/helpers';
import { FormField, FormRow, FormActions } from '../components/forms';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'course_completion', label: 'Course Completion' },
  { value: 'quiz_assigned', label: 'Quiz Assigned' },
  { value: 'quiz_result', label: 'Quiz Result' },
  { value: 'payment_success', label: 'Payment Success' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'instructor_reply', label: 'Instructor Reply' },
  { value: 'system', label: 'System' },
  { value: 'promotion', label: 'Promotion' },
];

const channelOptions = [
  { value: '', label: 'All Channels' },
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App' },
  { value: 'websocket', label: 'WebSocket' },
  { value: 'sms', label: 'SMS' },
];

export function NotificationsPage() {
  const [data, setData] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [userId, setUserId] = useState('');

  const { page, pageSize, totalPages, totalItems, setPage, setPageSize, updateFromResponse, reset } = usePagination();

  const fetchNotifications = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsApi.list(userId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChannelFilter(e.target.value);
  };

  const handleReadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReadFilter(e.target.value);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  const filteredData = data
    .filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()))
    .filter((n) => !typeFilter || n.type === typeFilter)
    .filter((n) => !channelFilter || n.channel === channelFilter)
    .filter((n) => !readFilter || (readFilter === 'true' ? n.is_read : !n.is_read))
    .slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'avatar', header: '', width: '50px', render: (n: Notification) => <Avatar name={`User ${n.user_id.slice(0, 4)}`} size="sm" /> },
    { key: 'type', header: 'Type', render: (n: Notification) => <Badge variant="default" size="sm">{n.type}</Badge> },
    { key: 'channel', header: 'Channel', render: (n: Notification) => <Badge variant="info" size="sm">{n.channel}</Badge> },
    { key: 'title', header: 'Title', render: (n: Notification) => <span className={classNames('font-medium', !n.is_read && 'font-semibold')}>{n.title}</span> },
    { key: 'message', header: 'Message', render: (n: Notification) => <span className="max-w-md truncate block text-gray-600">{n.message}</span> },
    { key: 'status', header: 'Status', render: (n: Notification) => (
      <Badge variant="status" status={n.is_read ? 'read' : 'unread'} size="sm">
        {n.is_read ? 'Read' : 'Unread'}
      </Badge>
    )},
    { key: 'sent_at', header: 'Sent', render: (n: Notification) => n.sent_at ? formatRelativeTime(n.sent_at) : 'Pending' },
    { key: 'created_at', header: 'Created', render: (n: Notification) => formatDate(n.created_at) },
  ];

  const unreadCount = data.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Manage and send notifications to users"
        action={<Button onClick={openCreateModal}>Send Notification</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full sm:w-64"
        />
        <Button onClick={fetchNotifications} disabled={!userId || isLoading}>
          Load Notifications
        </Button>
      </div>

      {userId && (
        <Card padding="md">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={handleSearch}
              className="flex-1 max-w-md"
            />
            <Select options={typeOptions} value={typeFilter} onChange={handleTypeChange} className="w-40" />
            <Select options={channelOptions} value={channelFilter} onChange={handleChannelChange} className="w-40" />
            <Select
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Read' },
                { value: 'false', label: 'Unread' },
              ]}
              value={readFilter}
              onChange={handleReadChange}
              className="w-32"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Total: {data.length}</span>
              <Badge variant="warning" size="sm">{unreadCount} Unread</Badge>
            </div>
          </div>

          {isLoading ? (
            <Loading />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchNotifications} />
          ) : filteredData.length === 0 ? (
            <EmptyState title="No notifications found" description="No notifications match your filters" />
          ) : (
            <>
              <Table
                columns={columns}
                data={filteredData}
                keyExtractor={(n) => n.id}
                isLoading={isLoading}
              />
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(data.length / pageSize) || 1}
                onPageChange={setPage}
                showPageSize
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </Card>
      )}

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (formData) => {
          setIsSubmitting(true);
          try {
            await notificationsApi.create({ ...formData, user_id: userId || formData.user_id });
            setIsModalOpen(false);
            if (userId) fetchNotifications();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send notification');
          } finally {
            setIsSubmitting(false);
          }
        }}
        isSubmitting={isSubmitting}
        defaultUserId={userId}
      />
    </div>
  );
}

function NotificationModal({ isOpen, onClose, onSubmit, isSubmitting, defaultUserId }: { isOpen: boolean; onClose: () => void; onSubmit: (data: Partial<Notification>) => Promise<void>; isSubmitting: boolean; defaultUserId: string }) {
  const [formData, setFormData] = useState<Partial<Notification>>({
    user_id: defaultUserId,
    type: 'system',
    channel: 'in_app',
    title: '',
    message: '',
  });

  useEffect(() => {
    setFormData({ user_id: defaultUserId, type: 'system', channel: 'in_app', title: '', message: '' });
  }, [defaultUserId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Notification" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <FormField label="User ID" required>
            <Input value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} required placeholder="User UUID" />
          </FormField>
          <FormRow>
            <FormField label="Type" required>
              <Select
                options={[
                  { value: 'enrollment', label: 'Enrollment' },
                  { value: 'course_completion', label: 'Course Completion' },
                  { value: 'quiz_assigned', label: 'Quiz Assigned' },
                  { value: 'quiz_result', label: 'Quiz Result' },
                  { value: 'payment_success', label: 'Payment Success' },
                  { value: 'payment_failed', label: 'Payment Failed' },
                  { value: 'instructor_reply', label: 'Instructor Reply' },
                  { value: 'system', label: 'System' },
                  { value: 'promotion', label: 'Promotion' },
                ]}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              />
            </FormField>
            <FormField label="Channel" required>
              <Select
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'in_app', label: 'In-App' },
                  { value: 'websocket', label: 'WebSocket' },
                  { value: 'sms', label: 'SMS' },
                ]}
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
              />
            </FormField>
          </FormRow>
          <FormField label="Title" required>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </FormField>
          <FormField label="Message" required>
            <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={4} required />
          </FormField>
        </div>
        <FormActions onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} submitLabel="Send" />
      </form>
    </Modal>
  );
}