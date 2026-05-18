import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  collectLocalStorageData,
  restoreDataToLocalStorage,
  isValidBackup,
  validateFile,
  BACKUP_FILE_NAME,
  ALLOWED_FILE_TYPE,
  MAX_FILE_SIZE_BYTES,
  LOG_PREFIX
} from './backupRestore';

/**
 * Component that provides data backup (export) and restore (import) buttons.
 * Uses utility functions from backupRestore.js.
 *
 * @returns {JSX.Element} The backup/restore section.
 */
export default function BackupRestore() {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = useCallback(() => {
    try {
      const data = collectLocalStorageData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: ALLOWED_FILE_TYPE });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = BACKUP_FILE_NAME;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success('Backup exported successfully.');
      console.log(`${LOG_PREFIX} Export completed. Key count: ${Object.keys(data).length}`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Export failed:`, error);
      toast.error(`Export failed: ${error.message}`);
    }
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Basic schema validation and sanitization for task objects.
   * Assumes each task is an object with at least 'id' and 'title' fields.
   * Strips any null/undefined values and ensures all fields are strings or numbers.
   * @param {*} parsed - The parsed JSON object.
   * @returns {{ valid: boolean, sanitized: object|null, errors: string[] }}
   */
  const sanitizeAndValidateTasks = (parsed) => {
    const errors = [];
    const sanitized = {};

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { valid: false, sanitized: null, errors: ['Data must be a JSON object.'] };
    }

    for (const [key, value] of Object.entries(parsed)) {
      // Ensure key is a non-empty string (localStorage keys are strings)
      if (typeof key !== 'string' || key.length === 0) {
        errors.push(`Invalid key: ${String(key)}. Skipping.`);
        continue;
      }

      // Task value should be a string (for simple localStorage backup) or an object
      if (typeof value === 'string') {
        try {
          const parsedTask = JSON.parse(value);
          if (typeof parsedTask === 'object' && parsedTask !== null && !Array.isArray(parsedTask)) {
            // Minimal sanitization: ensure id and title exist
            if (!parsedTask.id) parsedTask.id = key;
            if (!parsedTask.title) parsedTask.title = 'Untitled';
            sanitized[key] = JSON.stringify(parsedTask);
          } else {
            // Keep as plain string if not an object
            sanitized[key] = value;
          }
        } catch {
          // Not JSON – keep as plain string
          sanitized[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // If value is already an object, ensure it's serializable
        try {
          const cleaned = {};
          for (const [k, v] of Object.entries(value)) {
            if (v !== null && v !== undefined) {
              cleaned[k] = typeof v === 'string' || typeof v === 'number' ? v : String(v);
            }
          }
          if (!cleaned.id) cleaned.id = key;
          if (!cleaned.title) cleaned.title = 'Untitled';
          sanitized[key] = cleaned; // Will be stringified later
        } catch {
          errors.push(`Failed to sanitize task for key "${key}". Skipping.`);
        }
      } else {
        errors.push(`Invalid value type for key "${key}". Skipping.`);
      }
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors
    };
  };

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Size validation (already performed by validateFile, but reinforce)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File size exceeds limit (${(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(1)} MB).`);
        console.warn(`${LOG_PREFIX} File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        event.target.value = '';
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        console.warn(`${LOG_PREFIX} File validation failed:`, validationError);
        event.target.value = '';
        return;
      }

      setIsImporting(true);

      const reader = new FileReader();

      reader.onload = (loadEvent) => {
        try {
          const raw = loadEvent.target?.result;
          if (typeof raw !== 'string') {
            throw new Error('File content is not a string.');
          }

          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (parseError) {
            throw new Error(`Invalid JSON: ${parseError.message}`);
          }

          // Validate and sanitize the imported data
          const { valid, sanitized, errors } = sanitizeAndValidateTasks(parsed);
          if (!valid) {
            const errorMsg = `Data validation failed: ${errors.join('; ')}`;
            toast.error(errorMsg);
            console.error(`${LOG_PREFIX} ${errorMsg}`);
            return;
          }

          // Restore the sanitized data to localStorage
          restoreDataToLocalStorage(sanitized);

          const keyCount = Object.keys(sanitized).length;
          toast.success(`Backup restored successfully. ${keyCount} keys restored.`);
          console.log(`${LOG_PREFIX} Import completed. Restored keys:`, Object.keys(sanitized));
        } catch (error) {
          console.error(`${LOG_PREFIX} Import failed:`, error);
          toast.error(`Import failed: ${error.message}`);
        } finally {
          setIsImporting(false);
          event.target.value = '';
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read file. Please try again.');
        console.error(`${LOG_PREFIX} FileReader error:`, reader.error);
        setIsImporting(false);
        event.target.value = '';
      };

      reader.readAsText(file);
    },
    []
  );

  // Automated backup every 30 minutes (optional)
  useEffect(() => {
    const intervalMs = 30 * 60 * 1000; // 30 minutes
    const intervalId = setInterval(() => {
      handleExport();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [handleExport]);

  return (
    <div className="container mt-4">
      <h2>Data Backup & Restore</h2>
      <div className="d-flex gap-3">
        <button
          className="btn btn-outline-primary"
          onClick={handleExport}
        >
          Export Backup
        </button>
        <button
          className="btn btn-primary"
          onClick={handleImportClick}
          disabled={isImporting}
        >
          {isImporting ? 'Importing…' : 'Import Backup'}
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".json"
        aria-label="Select JSON backup file"
      />
    </div>
  );
}