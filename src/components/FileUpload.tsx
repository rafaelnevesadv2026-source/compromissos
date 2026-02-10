import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Paperclip, X, FileText, Image, Music, File } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return Image;
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return FileText;
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return Music;
  return File;
}

function getFileName(path: string) {
  return path.split('/').pop() || path;
}

export default function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || !user) return;

    setUploading(true);
    const newPaths: string[] = [];

    for (const file of Array.from(selectedFiles)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} excede 10MB`);
        continue;
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('anexos')
        .upload(filePath, file);

      if (error) {
        toast.error(`Erro ao enviar ${file.name}`);
        console.error(error);
      } else {
        newPaths.push(filePath);
      }
    }

    if (newPaths.length > 0) {
      onFilesChange([...files, ...newPaths]);
      toast.success(`${newPaths.length} arquivo(s) anexado(s)`);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async (path: string) => {
    await supabase.storage.from('anexos').remove([path]);
    onFilesChange(files.filter(f => f !== path));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all disabled:opacity-50"
        >
          <Paperclip className="w-3.5 h-3.5" />
          {uploading ? 'Enviando...' : 'Anexar arquivo'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.mp3,.wav,.txt"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map(f => {
            const Icon = getFileIcon(f);
            return (
              <div
                key={f}
                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg"
              >
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground truncate flex-1">
                  {getFileName(f)}
                </span>
                <button
                  onClick={() => handleRemove(f)}
                  className="p-0.5 hover:bg-destructive/20 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
