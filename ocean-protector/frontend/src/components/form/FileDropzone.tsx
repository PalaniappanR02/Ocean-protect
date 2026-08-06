import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

export const FileDropzone: React.FC<{ onFiles?: (files: File[]) => void }>=({ onFiles })=>{
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = useCallback((f: FileList | null) => {
    if (!f) return;
    const list = Array.from(f);
    setFiles((s)=>[...s, ...list]);
    onFiles?.(list);
  }, [onFiles]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <motion.div whileHover={{ scale: 1.01 }} onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} className="rounded-lg border-2 border-dashed border-white/8 p-6 text-center">
        <p className="text-sm text-muted-foreground">Drag & drop images here, or click to select</p>
        <input type="file" accept="image/*" className="mx-auto mt-3 block w-full opacity-0" onChange={(e)=>handleFiles(e.target.files)} />
      </motion.div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {files.map((f, i)=> (
          <div key={i} className="rounded-md overflow-hidden bg-white/6 p-1 text-xs">
            <div className="truncate">{f.name}</div>
            <div className="text-[10px] text-muted-foreground">{Math.round(f.size/1024)} KB</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileDropzone;
