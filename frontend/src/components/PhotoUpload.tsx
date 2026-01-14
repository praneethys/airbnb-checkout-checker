import { useState } from 'react';
import { useUploadPhoto } from '../hooks/api';

interface Props {
  checkId: number;
  roomId: number;
  roomName: string;
}

export function PhotoUpload({ checkId, roomId, roomName }: Props) {
  const [result, setResult] = useState<unknown>(null);
  const upload = useUploadPhoto(checkId, roomId);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await upload.mutateAsync(file);
    setResult(res);
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
      <h4>{roomName}</h4>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={upload.isPending} />
      {upload.isPending && <p>Analyzing photo...</p>}
      {result && (
        <div style={{ marginTop: '0.5rem', background: '#f5f5f5', padding: '0.5rem' }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
