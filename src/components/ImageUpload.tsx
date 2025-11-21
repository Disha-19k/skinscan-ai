import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploadProps {
  onFileSelect: (file: File, preview: string) => void;
  preview: string | null;
}

const ImageUpload = ({ onFileSelect, preview }: ImageUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onFileSelect(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null as any, null as any);
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">Drop your image here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
          <p className="text-xs text-muted-foreground">Supports: PNG, JPG, JPEG, WEBP</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
