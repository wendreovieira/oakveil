import { useState } from 'react'
import { getSignedUrl } from '@/api/assets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AssetPickerModal({ onSelect }: { onSelect: (key: string, url: string) => void }) {
  const [open, setOpen] = useState(false)
  const [objectKey, setObjectKey] = useState('')

  return (
    <>
      <Button type='button' variant='outline' onClick={() => setOpen(true)}>
        Asset Picker
      </Button>
      {open ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-lg rounded-lg border border-border bg-card p-4'>
            <h3 className='mb-2 text-lg font-semibold'>Pick asset by object key</h3>
            <Input value={objectKey} onChange={(event) => setObjectKey(event.target.value)} placeholder='previews/sprite.png' />
            <div className='mt-4 flex gap-2'>
              <Button
                type='button'
                onClick={async () => {
                  if (!objectKey.trim()) {
                    return
                  }

                  const url = await getSignedUrl(objectKey)
                  onSelect(objectKey, url)
                  setOpen(false)
                }}
              >
                Select
              </Button>
              <Button type='button' variant='ghost' onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
