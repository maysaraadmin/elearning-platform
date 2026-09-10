import { useState, useEffect } from 'react';
import { Table, Pagination, Loading, EmptyState, ErrorState, Card } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Dropdown } from '../components/ui/Dropdown';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { FormField, FormActions, FormSection } from '../components/forms';
import { PageHeader } from '../components/layout/MainLayout';
import { usersApi } from '../api/client';
import { User, PaginatedResponse } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, getRoleColor, classNames } from '../utils/helpers';

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { page, pageSize, totalPages, totalItems, setPage, setPageSize, updateFromResponse, reset } = usePagination();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('is_active', statusFilter);

      const response = await usersApi.list(page, pageSize);
      setData(response.items);
      updateFromResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search, roleFilter, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    reset();
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    reset();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    reset();
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    reset();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.delete(userToDelete.id);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSubmit = async (formData: Partial<User>) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
      } else {
        await usersApi.create(formData as any);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'avatar', header: '', width: '50px', render: (user: User) => <Avatar src={user.avatar_url} name={user.full_name} size="sm" /> },
    { key: 'email', header: 'Email', render: (user: User) => <span className="font-medium">{user.email}</span> },
    { key: 'full_name', header: 'Name', render: (user: User) => user.full_name },
    { key: 'role', header: 'Role', render: (user: User) => <Badge variant="status" status={user.role}>{user.role}</Badge> },
    { key: 'status', header: 'Status', render: (user: User) => <Badge variant="status" status={user.is_active ? 'active' : 'inactive'}>{user.is_active ? 'Active' : 'Inactive'}</Badge> },
    { key: 'created_at', header: 'Joined', render: (user: User) => formatDate(user.created_at) },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (user: User) => (
        <Dropdown
          trigger={<Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button>}
          items={[
            { label: 'Edit', onClick: () => openEditModal(user), icon: <EditIcon className="w-4 h-4" /> },
            { label: 'View', onClick: () => {}, icon: <EyeIcon className="w-4 h-4" /> },
            { label: 'Delete', onClick: () => handleDelete(user), icon: <TrashIcon className="w-4 h-4" />, danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users and their roles"
        action={<Button onClick={openCreateModal}>Add User</Button>}
      />

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
            className="flex-1 max-w-md"
          />
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={handleRoleChange}
            className="w-48"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-48"
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUsers} />
        ) : data.length === 0 ? (
          <EmptyState title="No users found" description="Get started by adding a new user" action={<Button onClick={openCreateModal}>Add User</Button>} />
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              keyExtractor={(u) => u.id}
              isLoading={isLoading}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showPageSize
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={userToDelete ? `Are you sure you want to delete ${userToDelete.full_name} (${userToDelete.email})? This action cannot be undone.` : 'Are you sure?'}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

function UserModal({ isOpen, onClose, user, onSubmit, isSubmitting }: { isOpen: boolean; onClose: () => void; user: User | null; onSubmit: (data: Partial<User>) => Promise<void>; isSubmitting: boolean }) {
  const [formData, setFormData] = useState<Partial<User>>({
    email: '',
    full_name: '',
    role: 'student',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      setFormData({ email: '', full_name: '', role: 'student', is_active: true });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create User'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="User Information">
          <FormField label="Email" required>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!user}
              required
            />
          </FormField>
          <FormField label="Full Name" required>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Role" required>
            <Select
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            />
          </FormField>
        </FormSection>

        <FormSection title="Status">
          <FormField>
            <Input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
          </FormField>
        </FormSection>

        <FormActions onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} submitLabel={user ? 'Update' : 'Create'} />
      </form>
    </Modal>
  );
}

function EditIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
function EyeIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}