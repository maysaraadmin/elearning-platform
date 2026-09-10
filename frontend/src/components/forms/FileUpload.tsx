import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { classNames } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { formatBytes } from '../../utils/helpers';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  label?: string;
  helperText?: string;
}

export function FileUpload({
  onUpload,
  accept = [],
  maxSize = 5 * 1024 * 1024 * 1024,
  multiple = false,
  label = 'Upload file',
  helperText,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (accept.length > 0 && !accept.some((type) => file.type.match(type.replace('*', '.*')))) {
      return `File type ${file.type} is not allowed`;
    }
    if (file.size > maxSize) {
      return `File size exceeds ${formatBytes(maxSize)}`;
    }
    return null;
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    if (validFiles.length > 0) {
      setSelectedFiles((prev) => multiple ? [...prev, ...validFiles] : validFiles);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await onUpload(file);
      }
      setSelectedFiles([]);
    } finally {
      setUploading(false);
    }
  };

  const acceptAttr = accept.length > 0 ? accept.join(',') : undefined;

  return (
    <div className="border-2 border-dashed rounded-xl p-6 transition-colors" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptAttr}
        onChange={handleChange}
        className="sr-only"
        aria-label={label}
      />

      <div className={classNames('text-center', dragActive && 'bg-indigo-50 border-indigo-500')}>
        <svg
          className={classNames('mx-auto h-12 w-12', dragActive ? 'text-indigo-500' : 'text-gray-400')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className={classNames('mt-2 text-sm font-medium', dragActive ? 'text-indigo-700' : 'text-gray-900')}>
          {dragActive ? 'Drop files here...' : `Click to ${label.toLowerCase()}`}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {helperText || `Drag and drop or click to select${multiple ? ' multiple' : ''} file(s).`}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
          Choose Files
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <svg className="w-8 h-8 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zm0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t border-gray-200">
            <Button onClick={handleUpload} isLoading={uploading} disabled={uploading || selectedFiles.length === 0}>
              Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}