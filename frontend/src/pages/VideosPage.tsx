import { useState, useEffect } from 'react';
import { Table, Pagination, Loading, EmptyState, ErrorState, Card } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Dropdown } from '../components/ui/Dropdown';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { FileUpload } from '../components/forms/FileUpload';
import { FormField, FormActions, FormSection } from '../components/forms';
import { PageHeader } from '../components/layout/MainLayout';
import { videosApi } from '../api/client';
import { VideoAsset, VideoStatusResponse, PaginatedResponse } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, formatBytes, formatDuration, classNames } from '../utils/helpers';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const videoAcceptTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];

export function VideosPage() {
  const [data, setData] = useState<VideoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoAsset | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoAsset | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatusResponse | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const { page, pageSize, totalPages, totalItems, setPage, setPageSize, updateFromResponse, reset } = usePagination();

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await videosApi.list(page, pageSize);
      setData(response.items);
      updateFromResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
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

  const handleUpload = async (file: File) => {
    const title = file.name.replace(/\.[^/.]+$/, '');
    await videosApi.upload(file, title);
  };

  const handleDelete = (video: VideoAsset) => {
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    try {
      await videosApi.delete(videoToDelete.id);
      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    } finally {
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  const checkStatus = async (video: VideoAsset) => {
    setSelectedVideo(video);
    setIsCheckingStatus(true);
    try {
      const status = await videosApi.getStatus(video.id);
      setVideoStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const columns = [
    { key: 'thumbnail', header: '', width: '80px', render: (video: VideoAsset) => video.thumbnail_path ? <img src={video.thumbnail_path} alt="" className="w-16 h-10 rounded object-cover" /> : <div className="w-16 h-10 rounded bg-gray-200 flex items-center justify-center"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div> },
    { key: 'title', header: 'Title', render: (video: VideoAsset) => <span className="font-medium max-w-xs truncate block">{video.title}</span> },
    { key: 'original_filename', header: 'File', render: (video: VideoAsset) => <span className="text-sm text-gray-500">{video.original_filename}</span> },
    { key: 'file_size', header: 'Size', render: (video: VideoAsset) => formatBytes(video.file_size) },
    { key: 'duration', header: 'Duration', render: (video: VideoAsset) => formatDuration(video.duration_seconds) },
    { key: 'status', header: 'Status', render: (video: VideoAsset) => <Badge variant="status" status={video.status}>{video.status}</Badge> },
    { key: 'format', header: 'Format', render: (video: VideoAsset) => video.format },
    { key: 'created_at', header: 'Uploaded', render: (video: VideoAsset) => formatDate(video.created_at) },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (video: VideoAsset) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => checkStatus(video)} disabled={isCheckingStatus}>
            Status
          </Button>
          <Dropdown
            trigger={<Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button>}
            items={[
              { label: 'Delete', onClick: () => handleDelete(video), icon: <TrashIcon className="w-4 h-4" />, danger: true },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Videos"
        description="Manage video uploads and processing"
        action={
          <FileUpload
            onUpload={handleUpload}
            accept={videoAcceptTypes}
            maxSize={5 * 1024 * 1024 * 1024}
            label="Upload Video"
            helperText="MP4, WebM, MOV, AVI, MKV up to 5GB"
          />
        }
      />

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search videos..."
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
          <ErrorState message={error} onRetry={fetchVideos} />
        ) : data.length === 0 ? (
          <EmptyState title="No videos found" description="Upload your first video to get started" />
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              keyExtractor={(v) => v.id}
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

      {selectedVideo && videoStatus && (
        <StatusModal
          video={selectedVideo}
          status={videoStatus}
          isOpen={!!selectedVideo}
          onClose={() => { setSelectedVideo(null); setVideoStatus(null); }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Video"
        message={videoToDelete ? `Are you sure you want to delete "${videoToDelete.title}"? This action cannot be undone.` : 'Are you sure?'}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

function StatusModal({ video, status, isOpen, onClose }: { video: VideoAsset; status: VideoStatusResponse; isOpen: boolean; onClose: () => void }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Video Processing Status" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{video.title}</h4>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status.status] || 'bg-gray-100 text-gray-800'}`}>
            {status.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Video ID</p>
            <p className="font-mono">{status.video_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Progress</p>
            <p>{status.progress !== undefined ? `${status.progress}%` : 'N/A'}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}