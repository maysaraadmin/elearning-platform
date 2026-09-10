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
import { coursesApi, modulesApi, lessonsApi } from '../api/client';
import { Course, Module, Lesson, PaginatedResponse } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, classNames } from '../utils/helpers';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function CoursesPage() {
  const [data, setData] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [viewModules, setViewModules] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const { page, pageSize, totalPages, totalItems, setPage, setPageSize, updateFromResponse, reset } = usePagination();

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await coursesApi.list(page, pageSize);
      setData(response.items);
      updateFromResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
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
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await coursesApi.delete(courseToDelete.id);
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleViewModules = async (course: Course) => {
    if (viewModules === course.id) {
      setViewModules(null);
      return;
    }
    setViewModules(course.id);
    try {
      const modulesData = await modulesApi.list(course.id);
      setModules(modulesData);
      setSelectedModule(null);
      setLessons([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modules');
    }
  };

  const handleViewLessons = async (module: Module) => {
    setSelectedModule(module);
    try {
      const lessonsData = await lessonsApi.list(module.id);
      setLessons(lessonsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lessons');
    }
  };

  const columns = [
    { key: 'thumbnail', header: '', width: '60px', render: (course: Course) => course.thumbnail_url ? <img src={course.thumbnail_url} alt="" className="w-12 h-8 rounded object-cover" /> : <div className="w-12 h-8 rounded bg-gray-200 flex items-center justify-center"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div> },
    { key: 'title', header: 'Title', render: (course: Course) => <span className="font-medium max-w-xs truncate block">{course.title}</span> },
    { key: 'category', header: 'Category', render: (course: Course) => course.category },
    { key: 'level', header: 'Level', render: (course: Course) => <Badge variant="default" size="sm">{course.level}</Badge> },
    { key: 'status', header: 'Status', render: (course: Course) => <Badge variant="status" status={course.status}>{course.status}</Badge> },
    { key: 'price', header: 'Price', render: (course: Course) => course.is_free ? 'Free' : `$${course.price}` },
    { key: 'enrollment_count', header: 'Enrollments', render: (course: Course) => course.enrollment_count.toString() },
    { key: 'rating', header: 'Rating', render: (course: Course) => `${course.rating} (${course.rating_count})` },
    { key: 'created_at', header: 'Created', render: (course: Course) => formatDate(course.created_at) },
    {
      key: 'actions',
      header: '',
      width: '160px',
      render: (course: Course) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewModules(course)}>
            {viewModules === course.id ? 'Hide' : 'Modules'}
          </Button>
          <Dropdown
            trigger={<Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button>}
            items={[
              { label: 'Edit', onClick: () => openEditModal(course), icon: <EditIcon className="w-4 h-4" /> },
              { label: 'Delete', onClick: () => handleDelete(course), icon: <TrashIcon className="w-4 h-4" />, danger: true },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Manage courses, modules, and lessons"
        action={<Button onClick={openCreateModal}>Create Course</Button>}
      />

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search courses..."
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
          <ErrorState message={error} onRetry={fetchCourses} />
        ) : data.length === 0 ? (
          <EmptyState title="No courses found" description="Get started by creating a new course" action={<Button onClick={openCreateModal}>Create Course</Button>} />
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              keyExtractor={(c) => c.id}
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

        {viewModules && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Modules for Course</h3>
              <Button variant="outline" size="sm" onClick={() => setViewModules(null)}>Close</Button>
            </div>
            <ModulesView
              modules={modules}
              onViewLessons={handleViewLessons}
              courseId={viewModules}
              selectedModule={selectedModule}
            />
            {selectedModule && (
              <LessonsView
                lessons={lessons}
                moduleId={selectedModule.id}
              />
            )}
          </div>
        )}
      </Card>

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={editingCourse}
        onSubmit={async (formData) => {
          setIsSubmitting(true);
          try {
            if (editingCourse) {
              await coursesApi.update(editingCourse.id, formData);
            } else {
              await coursesApi.create(formData);
            }
            setIsModalOpen(false);
            fetchCourses();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save course');
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
        title="Delete Course"
        message={courseToDelete ? `Are you sure you want to delete "${courseToDelete.title}"? This action cannot be undone.` : 'Are you sure?'}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

function ModulesView({ modules, onViewLessons, courseId, selectedModule }: { modules: Module[]; onViewLessons: (module: Module) => void; courseId: string; selectedModule: Module | null }) {
  return (
    <div className="space-y-3">
      {modules.map((module) => (
        <div
          key={module.id}
          className={classNames(
            'flex items-center justify-between p-4 rounded-lg border transition-colors',
            selectedModule?.id === module.id
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:bg-gray-50'
          )}
          onClick={() => onViewLessons(module)}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-sm text-gray-500 w-8 text-center">{module.order_index}</span>
            <div>
              <p className="font-medium text-gray-900 truncate">{module.title}</p>
              {module.description && <p className="text-sm text-gray-500 truncate">{module.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{module.duration_minutes} min</span>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewLessons(module); }}>
              View Lessons
            </Button>
          </div>
        </div>
      ))}
      {modules.length === 0 && (
        <EmptyState title="No modules yet" description="Create modules to organize your course content" />
      )}
    </div>
  );
}

function LessonsView({ lessons, moduleId }: { lessons: Lesson[]; moduleId: string }) {
  const lessonTypeIcons: Record<string, React.ReactNode> = {
    video: <VideoIcon className="w-4 h-4" />,
    pdf: <FileIcon className="w-4 h-4" />,
    text: <FileTextIcon className="w-4 h-4" />,
    quiz: <QuizIcon className="w-4 h-4" />,
    assignment: <AssignmentIcon className="w-4 h-4" />,
    live: <LiveIcon className="w-4 h-4" />,
  };

  return (
    <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Lessons</h4>
      {lessons.map((lesson) => (
        <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <span className="text-sm text-gray-500 w-8 text-center">{lesson.order_index}</span>
          <div className="p-1.5 bg-white rounded text-gray-600">
            {lessonTypeIcons[lesson.type] || <DocumentIcon className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
            <p className="text-xs text-gray-500 capitalize">{lesson.type}</p>
          </div>
          <span className="text-sm text-gray-500">{lesson.duration_minutes} min</span>
        </div>
      ))}
      {lessons.length === 0 && <p className="text-sm text-gray-500 py-4">No lessons in this module</p>}
    </div>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
}
function FileIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
}
function FileTextIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function QuizIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}
function AssignmentIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function LiveIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
}
function DocumentIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function EditIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}