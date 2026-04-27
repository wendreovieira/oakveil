import { useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CharacterRigEditorPage() {
  const [slotName, setSlotName] = useState('')
  const [slots, setSlots] = useState<string[]>(['root', 'head', 'body'])
  const [required, setRequired] = useState<string[]>(['root'])

  return (
    <div>
      <PageHeader title='Character Rig Editor' description='Manage slot hierarchy with required/optional semantics.' />

      <Card>
        <CardContent className='pt-5'>
          <div className='mb-4 flex gap-2'>
            <Input value={slotName} onChange={(event) => setSlotName(event.target.value)} placeholder='new slot name' />
            <Button
              onClick={() => {
                if (!slotName.trim()) return
                setSlots((prev) => [...prev, slotName.trim()])
                setSlotName('')
              }}
            >
              Add slot
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-md border border-border p-3'>
              <h3 className='mb-3 text-sm font-semibold'>Slot hierarchy</h3>
              <ul className='space-y-2 text-sm'>
                {slots.map((slot) => (
                  <li key={slot} className='flex items-center justify-between rounded bg-muted/50 px-2 py-1'>
                    <span>{slot}</span>
                    <Button
                      size='sm'
                      variant={required.includes(slot) ? 'secondary' : 'outline'}
                      onClick={() => {
                        setRequired((prev) => (prev.includes(slot) ? prev.filter((value) => value !== slot) : [...prev, slot]))
                      }}
                    >
                      {required.includes(slot) ? 'Required' : 'Optional'}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className='rounded-md border border-border p-3'>
              <h3 className='mb-3 text-sm font-semibold'>Summary</h3>
              <p className='text-sm text-muted-foreground'>Required slots: {required.join(', ') || 'none'}</p>
              <p className='text-sm text-muted-foreground'>Total slots: {slots.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
