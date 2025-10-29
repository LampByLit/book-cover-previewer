/**
 * BOOK COVER PREVIEWER - File Upload Component
 *
 * Provides drag-and-drop file upload interface with validation and progress feedback.
 */

import { useState, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { validateFile } from '../utils/fileSystem';
import { addCover } from '../utils/coverData';
import { bleedEnabledAtom } from './UI';

export const UploadComponent = ({ onUploadSuccess, onUploadError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTrimSize, setSelectedTrimSize] = useState({ width: 5.0, height: 8.0 });
  const [customTrimSize, setCustomTrimSize] = useState({ width: '', height: '' });
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [spineWidthInches, setSpineWidthInches] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [error, setError] = useState(null);
  const [bleedEnabled, setBleedEnabled] = useAtom(bleedEnabledAtom);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle file drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  // Handle file input change
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  // Process uploaded file
  const processFile = async (file) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Get trim size
      const finalTrimSize = useCustomSize ? {
        width: parseFloat(customTrimSize.width),
        height: parseFloat(customTrimSize.height)
      } : selectedTrimSize;

      // Add cover to system (include optional spine width)
      // Ensure spine width is provided (either directly or via page count calculator)
      const PER_PAGE_THICKNESS = 0.0025; // inches per page
      let spineInches = spineWidthInches;
      if ((spineInches === '' || isNaN(parseFloat(spineInches))) && pageCount !== '') {
        const pages = parseInt(pageCount, 10);
        if (Number.isFinite(pages) && pages > 0) {
          spineInches = (pages * PER_PAGE_THICKNESS).toFixed(3);
          setSpineWidthInches(spineInches);
        }
      }
      const parsedSpine = parseFloat(spineInches);
      if (!Number.isFinite(parsedSpine) || parsedSpine <= 0) {
        throw new Error('Spine width is required. Enter it directly or provide a valid page count.');
      }

      const options = { spineWidthInches: parsedSpine };
      const newCover = await addCover(file, finalTrimSize, options);

      setUploadProgress(100);
      clearInterval(progressInterval);

      // Success callback
      if (onUploadSuccess) {
        onUploadSuccess(newCover);
      }

      // Reset form
      resetForm();

    } catch (error) {
      setError(error.message);
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    setSpineWidthInches('');
    setPageCount('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle trim size change
  const handleTrimSizeChange = (size) => {
    setSelectedTrimSize(size);
    setUseCustomSize(false);
  };

  // Handle custom trim size input
  const handleCustomTrimSizeChange = (field, value) => {
    setCustomTrimSize(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Essential trim sizes for quick selection
  const presetSizes = [
    { width: 4.25, height: 6.87, name: '4.25" × 6.87"', category: 'Fiction' },
    { width: 5.0, height: 8.0, name: '5" × 8"', category: 'Fiction' },
    { width: 6.0, height: 9.0, name: '6" × 9"', category: 'Fiction' },
    { width: 8.5, height: 11.0, name: '8.5" × 11"', category: 'Textbook' }
  ];

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Cover Art</h3>

      {/* Bleed toggle */}
      <div className="mb-4 flex items-center justify-between">
        <label className="text-sm text-gray-700 select-none" htmlFor="bleed-toggle">
          Apply 0.125" bleed
        </label>
        <input
          id="bleed-toggle"
          type="checkbox"
          checked={bleedEnabled}
          onChange={(e) => setBleedEnabled(e.target.checked)}
          className="h-4 w-4"
          disabled={isUploading}
        />
      </div>

      {/* Trim Size Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trim Size (Width × Height in inches)
        </label>

        {/* Preset Sizes */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {presetSizes.map((size, index) => (
            <button
              key={index}
              onClick={() => handleTrimSizeChange(size)}
              className={`px-3 py-2 text-xs border rounded transition-colors ${
                !useCustomSize &&
                selectedTrimSize.width === size.width &&
                selectedTrimSize.height === size.height
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={isUploading}
            >
              <div className="font-medium">{size.name}</div>
            </button>
          ))}
        </div>

        {/* Custom Size Toggle */}
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="custom-size"
            checked={useCustomSize}
            onChange={(e) => setUseCustomSize(e.target.checked)}
            className="mr-2"
            disabled={isUploading}
          />
          <label htmlFor="custom-size" className="text-sm text-gray-700">
            Use custom trim size
          </label>
        </div>

        {/* Custom Size Inputs */}
        {useCustomSize && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width (inches)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="20"
                value={customTrimSize.width}
                onChange={(e) => handleCustomTrimSizeChange('width', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="5.0"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height (inches)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="20"
                value={customTrimSize.height}
                onChange={(e) => handleCustomTrimSizeChange('height', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="8.0"
                disabled={isUploading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Page count calculator and spine width (required) */}
      <div className="mb-4 grid grid-cols-1 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Page count (optional, auto-calculates spine at 0.0025"/page)</label>
          <input
            type="number"
            step="1"
            min="1"
            max="2000"
            value={pageCount}
            onChange={(e) => {
              const val = e.target.value;
              setPageCount(val);
              const pages = parseInt(val, 10);
              if (Number.isFinite(pages) && pages > 0) {
                const computed = (pages * 0.0025).toFixed(3);
                setSpineWidthInches(computed);
              }
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            placeholder="e.g. 217"
            disabled={isUploading}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Spine width (inches, required)</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            max="5"
            value={spineWidthInches}
            onChange={(e) => setSpineWidthInches(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            placeholder="e.g. 0.543"
            disabled={isUploading}
            required
          />
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg
            className={`mx-auto h-12 w-12 mb-4 ${
              isDragOver ? 'text-blue-400' : error ? 'text-red-400' : 'text-gray-400'
            }`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mb-4">
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragOver ? 'Drop your cover image here' : 'Upload cover art'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop your PNG, JPG, or WebP file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum file size: 10MB
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isUploading}
          >
            Choose File
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="mb-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Uploading... {uploadProgress}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};
