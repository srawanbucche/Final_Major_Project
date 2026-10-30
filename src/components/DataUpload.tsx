import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatBytes } from '@/lib/utils'

export function DataUpload({
  onUpload,
  disabled = false,
  buttonText = 'Upload and normalize',
}: {
  onUpload: (file: File, onProgress: (value: number) => void) => Promise<void>
  disabled?: boolean
  buttonText?: string
}) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleUpload() {
    if (!file) return
    setError('')
    setStatus('uploading')
    setProgress(10)
    try {
      await onUpload(file, (value) => {
        setProgress(value)
        if (value >= 60) setStatus('processing')
      })
      setStatus('complete')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold">Upload Chat Export</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        TXT, CSV, or JSON. Direct private-message APIs are not used.
      </p>
      <label className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-secondary/40 px-4 py-8 text-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <Upload className="mb-2 h-6 w-6 text-accent" />
        <span className="text-sm font-medium">Drop a file or browse</span>
        <input
          type="file"
          accept=".txt,.csv,.json"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.files?.[0]
            if (next) {
              setFile(next)
              setStatus('idle')
              setProgress(0)
            }
          }}
        />
      </label>
      {file ? (
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="font-medium">File name:</span> {file.name}
          </p>
          <p>
            <span className="font-medium">File size:</span> {formatBytes(file.size)}
          </p>
          <p>
            <span className="font-medium">Processing status:</span> {status}
          </p>
          <Progress value={progress} />
          {error ? <p className="text-destructive">{error}</p> : null}
          <Button 
            className="mt-2" 
            variant="teal" 
            onClick={() => void handleUpload()}
            disabled={disabled || status === 'uploading' || status === 'processing'}
          >
            {status === 'uploading' || status === 'processing' ? 'Processing...' : buttonText}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
