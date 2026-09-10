import { useState, useEffect } from 'react';
import { Table, Pagination, Loading, EmptyState, ErrorState, Card } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Dropdown } from '../components/ui/Dropdown';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { FormField, FormActions, FormSection, FormRow } from '../components/forms';
import { PageHeader } from '../components/layout/MainLayout';
import { enrollmentsApi, progressApi, certificatesApi } from '../api/client';
import { Enrollment, LessonProgress, Certificate, PaginatedResponse } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, classNames } from '../utils/helpers';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'suspended', label: 'Suspended' },
];

export function EnrollmentsPage() {
  const [data, setData] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);
  const [viewProgress, setViewProgress] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<LessonProgress[]>([]);
  const [viewCertificate, setViewCertificate] = useState<Certificate | null>(null);

  const { page, pageSize, totalPages, totalItems, setPage, setPageSize, updateFromResponse, reset } = usePagination();

  const fetchEnrollments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await enrollmentsApi.list(page, pageSize);
      setData(response.items);
      updateFromResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [page, pageSize, search, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
    setEditingEnrollment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setIsModalOpen(true);
  };

  const handleDelete = (enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!enrollmentToDelete) return;
    try {
      await enrollmentsApi.delete(enrollmentToDelete.id);
      fetchEnrollments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete enrollment');
    } finally {
      setDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
    }
  };

  const handleViewProgress = async (enrollment: Enrollment) => {
    if (viewProgress === enrollment.id) {
      setViewProgress(null);
      return;
    }
    setViewProgress(enrollment.id);
    try {
      const progress = await progressApi.list(enrollment.id);
      setProgressData(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    }
  };

  const handleViewCertificate = async (enrollment: Enrollment) => {
    try {
      const cert = await certificatesApi.get(enrollment.user_id, enrollment.course_id);
      setViewCertificate(cert);
    } catch {
      setViewCertificate(null);
    }
  };

  const columns = [
    { key: 'user_id', header: 'User', render: (e: Enrollment) => e.user_id },
    { key: 'course_id', header: 'Course', render: (e: Enrollment) => e.course_id },
    { key: 'status', header: 'Status', render: (e: Enrollment) => <Badge variant="status" status={e.status}>{e.status}</Badge> },
    { key: 'progress_percentage', header: 'Progress', render: (e: Enrollment) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${e.progress_percentage}%` }} />
        </div>
        <span className="text-sm font-medium w-16 text-right">{e.progress_percentage.toFixed(1)}%</span>
      </div>
    )},
    { key: 'completed_lessons', header: 'Lessons', render: (e: Enrollment) => `${e.completed_lessons} / ${e.total_lessons}` },
    { key: 'watch_time_minutes', header: 'Watch Time', render: (e: Enrollment) => `${e.watch_time_minutes} min` },
    { key: 'last_accessed_at', header: 'Last Access', render: (e: Enrollment) => e.last_accessed_at ? formatDate(e.last_accessed_at) : 'Never' },
    { key: 'created_at', header: 'Enrolled', render: (e: Enrollment) => formatDate(e.created_at) },
    {
      key: 'actions',
      header: '',
      width: '160px',
      render: (e: Enrollment) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewProgress(e)}>
            {viewProgress === e.id ? 'Hide' : 'Progress'}
          </Button>
          {e.status === 'completed' && (
            <Button variant="ghost" size="sm" onClick={() => handleViewCertificate(e)}>
              Certificate
            </Button>
          )}
          <Dropdown
            trigger={<Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button>}
            items={[
              { label: 'Edit', onClick: () => openEditModal(e), icon: <EditIcon className="w-4 h-4" /> },
              { label: 'Delete', onClick: () => handleDelete(e), icon: <TrashIcon className="w-4 h-4" />, danger: true },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        description="Manage course enrollments and track progress"
        action={<Button onClick={openCreateModal}>Enroll User</Button>}
      />

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search enrollments..."
            value={search}
            onChange={handleSearch}
            className="flex-1 max-w-md"
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
          <ErrorState message={error} onRetry={fetchEnrollments} />
        ) : data.length === 0 ? (
          <EmptyState title="No enrollments found" description="Get started by enrolling a user in a course" action={<Button onClick={openCreateModal}>Enroll User</Button>} />
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              keyExtractor={(e) => e.id}
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

        {viewProgress && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Lesson Progress</h3>
              <Button variant="outline" size="sm" onClick={() => setViewProgress(null)}>Close</Button>
            </div>
            <ProgressView progress={progressData} />
          </div>
        )}
      </Card>

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        enrollment={editingEnrollment}
        onSubmit={async (formData) => {
          setIsSubmitting(true);
          try {
            if (editingEnrollment) {
              await enrollmentsApi.update(editingEnrollment.id, formData);
            } else {
              await enrollmentsApi.create(formData);
            }
            setIsModalOpen(false);
            fetchEnrollments();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save enrollment');
          } finally {
            setIsSubmitting(false);
          }
        }}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Enrollment"
        message={enrollmentToDelete ? `Are you sure you want to delete this enrollment?` : 'Are you sure?'}
        confirmLabel="Delete"
        variant="danger"
      />

      {viewCertificate && (
        <CertificateModal certificate={viewCertificate} onClose={() => setViewCertificate(null)} isOpen={!!viewCertificate} />
      )}
    </div>
  );
}

function ProgressView({ progress }: { progress: LessonProgress[] }) {
  if (progress.length === 0) {
    return <EmptyState title="No progress data" description="No lesson progress recorded yet" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watch Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Position</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {progress.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{p.lesson_id}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {p.completed ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(p.watch_time_seconds / 60)}m {p.watch_time_seconds % 60}s</td>
              <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(p.last_position_seconds / 60)}m {p.last_position_seconds % 60}s</td>
              <td className="px-4 py-3 text-sm text-gray-500">{p.completed_at ? formatDate(p.completed_at) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CertificateModal({ certificate, onClose, isOpen }: { certificate: Certificate; onClose: () => void; isOpen: boolean }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Certificate" size="lg">
      <div className="space-y-4 text-center">
        <div className="p-8 border-4 border-indigo-600 rounded-xl bg-indigo-50">
          <h3 className="text-3xl font-bold text-indigo-900">Certificate of Completion</h3>
          <p className="text-indigo-700 mt-2">#{certificate.certificate_number}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-6">{certificate.final_score.toFixed(1)}% Final Score</p>
          <p className="text-indigo-600 mt-2">Issued: {formatDate(certificate.issued_at)}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <a href={certificate.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </a>
        </div>
      </div>
    </Modal>
  );
}

function EnrollmentModal({ isOpen, onClose, enrollment, onSubmit, isSubmitting }: { isOpen: boolean; onClose: () => void; enrollment: Enrollment | null; onSubmit: (data: Partial<Enrollment>) => Promise<void>; isSubmitting: boolean }) {
  const [formData, setFormData] = useState<Partial<Enrollment>>({
    user_id: '',
    course_id: '',
    status: 'active',
    progress_percentage: 0,
  });

  useEffect(() => {
    if (enrollment) {
      setFormData({
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        status: enrollment.status,
        progress_percentage: enrollment.progress_percentage,
      });
    } else {
      setFormData({ user_id: '', course_id: '', status: 'active', progress_percentage: 0 });
    }
  }, [enrollment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={enrollment ? 'Edit Enrollment' : 'Create Enrollment'} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Enrollment Details">
          <FormField label="User ID" required>
            <Input value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} required placeholder="User UUID" disabled={!!enrollment} />
          </FormField>
          <FormField label="Course ID" required>
            <Input value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required placeholder="Course UUID" disabled={!!enrollment} />
          </FormField>
          <FormField label="Status">
            <Select
              options={[{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'dropped', label: 'Dropped' }, { value: 'suspended', label: 'Suspended' }]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            />
          </FormField>
          <FormField label="Progress %">
            <Input type="number" value={formData.progress_percentage || 0} onChange={(e) => setFormData({ ...formData, progress_percentage: parseFloat(e.target.value) || 0 })} min={0} max={100} step={0.1} />
          </FormField>
        </FormSection>

        <FormActions onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} submitLabel={enrollment ? 'Update' : 'Create'} />
      </form>
    </Modal>
  );
}

function EditIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}