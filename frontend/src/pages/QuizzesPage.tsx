import { useState, useEffect } from 'react';
import { Table, Pagination, Loading, EmptyState, ErrorState, Card } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Dropdown } from '../components/ui/Dropdown';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { FormField, FormActions, FormSection } from '../components/forms';
import { PageHeader } from '../components/layout/MainLayout';
import { quizzesApi, attemptsApi } from '../api/client';
import { Quiz, QuizAttempt, PaginatedResponse } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, classNames } from '../utils/helpers';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export function QuizzesPage() {
  const [data, setData] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [viewAttempts, setViewAttempts] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const { page, pageSize, totalPages, totalItems, setPage, setPageSize, updateFromResponse, reset } = usePagination();

  const fetchQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await quizzesApi.list(page, pageSize);
      setData(response.items);
      updateFromResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
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
    setEditingQuiz(null);
    setIsModalOpen(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleDelete = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      await quizzesApi.delete(quizToDelete.id);
      fetchQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
    } finally {
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const handleViewAttempts = async (quiz: Quiz) => {
    if (viewAttempts === quiz.id) {
      setViewAttempts(null);
      return;
    }
    setViewAttempts(quiz.id);
    try {
      const attemptsData = await attemptsApi.list(quiz.id);
      setAttempts(attemptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attempts');
    }
  };

  const columns = [
    { key: 'title', header: 'Title', render: (quiz: Quiz) => <span className="font-medium max-w-xs truncate block">{quiz.title}</span> },
    { key: 'course_id', header: 'Course', render: (quiz: Quiz) => quiz.course_id },
    { key: 'status', header: 'Status', render: (quiz: Quiz) => <Badge variant="status" status={quiz.status}>{quiz.status}</Badge> },
    { key: 'time_limit_minutes', header: 'Time Limit', render: (quiz: Quiz) => quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'No limit' },
    { key: 'max_attempts', header: 'Max Attempts', render: (quiz: Quiz) => quiz.max_attempts.toString() },
    { key: 'passing_score', header: 'Passing Score', render: (quiz: Quiz) => `${quiz.passing_score}%` },
    { key: 'total_points', header: 'Total Points', render: (quiz: Quiz) => quiz.total_points.toString() },
    { key: 'created_at', header: 'Created', render: (quiz: Quiz) => formatDate(quiz.created_at) },
    {
      key: 'actions',
      header: '',
      width: '160px',
      render: (quiz: Quiz) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewAttempts(quiz)}>
            {viewAttempts === quiz.id ? 'Hide' : 'Attempts'}
          </Button>
          <Dropdown
            trigger={<Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button>}
            items={[
              { label: 'Edit', onClick: () => openEditModal(quiz), icon: <EditIcon className="w-4 h-4" /> },
              { label: 'Delete', onClick: () => handleDelete(quiz), icon: <TrashIcon className="w-4 h-4" />, danger: true },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes"
        description="Manage quizzes and view attempts"
        action={<Button onClick={openCreateModal}>Create Quiz</Button>}
      />

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search quizzes..."
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
          <ErrorState message={error} onRetry={fetchQuizzes} />
        ) : data.length === 0 ? (
          <EmptyState title="No quizzes found" description="Get started by creating a new quiz" action={<Button onClick={openCreateModal}>Create Quiz</Button>} />
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              keyExtractor={(q) => q.id}
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

        {viewAttempts && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quiz Attempts</h3>
              <Button variant="outline" size="sm" onClick={() => setViewAttempts(null)}>Close</Button>
            </div>
            <AttemptsView attempts={attempts} />
          </div>
        )}
      </Card>

      <QuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quiz={editingQuiz}
        onSubmit={async (formData) => {
          setIsSubmitting(true);
          try {
            if (editingQuiz) {
              await quizzesApi.update(editingQuiz.id, formData);
            } else {
              await quizzesApi.create(formData);
            }
            setIsModalOpen(false);
            fetchQuizzes();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save quiz');
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
        title="Delete Quiz"
        message={quizToDelete ? `Are you sure you want to delete "${quizToDelete.title}"?` : 'Are you sure?'}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

function AttemptsView({ attempts }: { attempts: QuizAttempt[] }) {
  if (attempts.length === 0) {
    return <EmptyState title="No attempts yet" description="No one has attempted this quiz yet" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempt #</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attempts.map((attempt) => (
            <tr key={attempt.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{attempt.user_id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{attempt.attempt_number}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{attempt.total_score} / {attempt.max_score}</td>
              <td className="px-4 py-3 text-sm font-medium">{attempt.percentage.toFixed(1)}%</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {attempt.passed ? 'Passed' : 'Failed'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s</td>
              <td className="px-4 py-3 text-sm text-gray-500">{attempt.completed_at ? formatDate(attempt.completed_at) : 'In progress'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuizModal({ isOpen, onClose, quiz, onSubmit, isSubmitting }: { isOpen: boolean; onClose: () => void; quiz: Quiz | null; onSubmit: (data: Partial<Quiz>) => Promise<void>; isSubmitting: boolean }) {
  const [formData, setFormData] = useState<Partial<Quiz>>({
    course_id: '',
    title: '',
    description: '',
    status: 'draft',
    time_limit_minutes: 0,
    max_attempts: 3,
    passing_score: 70,
    randomize_questions: false,
    show_correct_answers: true,
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        course_id: quiz.course_id,
        title: quiz.title,
        description: quiz.description || '',
        status: quiz.status,
        time_limit_minutes: quiz.time_limit_minutes,
        max_attempts: quiz.max_attempts,
        passing_score: quiz.passing_score,
        randomize_questions: quiz.randomize_questions,
        show_correct_answers: quiz.show_correct_answers,
      });
    } else {
      setFormData({
        course_id: '',
        title: '',
        description: '',
        status: 'draft',
        time_limit_minutes: 0,
        max_attempts: 3,
        passing_score: 70,
        randomize_questions: false,
        show_correct_answers: true,
      });
    }
  }, [quiz, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quiz ? 'Edit Quiz' : 'Create Quiz'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Quiz Details">
          <FormField label="Course ID" required>
            <Input value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required placeholder="Course UUID" />
          </FormField>
          <FormField label="Title" required>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </FormField>
          <FormField label="Description">
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
          </FormField>
        </FormSection>

        <FormSection title="Settings">
          <FormRow>
            <FormField label="Time Limit (minutes)">
              <Input type="number" value={formData.time_limit_minutes || 0} onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 0 })} min={0} />
            </FormField>
            <FormField label="Max Attempts">
              <Input type="number" value={formData.max_attempts || 3} onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 3 })} min={1} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Passing Score (%)">
              <Input type="number" value={formData.passing_score || 70} onChange={(e) => setFormData({ ...formData, passing_score: parseFloat(e.target.value) || 70 })} min={0} max={100} step={0.1} />
            </FormField>
            <FormField label="Status">
              <Select
                options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Input type="checkbox" checked={formData.randomize_questions} onChange={(e) => setFormData({ ...formData, randomize_questions: e.target.checked })} id="randomize" />
              <label htmlFor="randomize" className="text-sm font-medium text-gray-700">Randomize Questions</label>
            </FormField>
            <FormField>
              <Input type="checkbox" checked={formData.show_correct_answers} onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })} id="show_answers" />
              <label htmlFor="show_answers" className="text-sm font-medium text-gray-700">Show Correct Answers</label>
            </FormField>
          </FormRow>
        </FormSection>

        <FormActions onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} submitLabel={quiz ? 'Update' : 'Create'} />
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