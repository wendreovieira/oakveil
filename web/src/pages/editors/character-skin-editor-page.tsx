import { useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const defaultSlots = ['head', 'body', 'hands', 'legs']

export function CharacterSkinEditorPage() {
  const [slotToSkin, setSlotToSkin] = useState<Record<string, string>>({})

  return (
    <div>
      <PageHeader title='Character Skin Editor' description='Assign skin resources to rig slots and preview assembled setup.' />

      <Card>
        <CardContent className='grid gap-4 pt-5 lg:grid-cols-2'>
          <div className='space-y-3'>
            {defaultSlots.map((slot) => (
              <div key={slot} className='rounded-md border border-border p-3'>
                <label className='mb-1 block text-xs uppercase tracking-wide text-muted-foreground'>{slot}</label>
                <Input
                  value={slotToSkin[slot] ?? ''}
                  onChange={(event) => setSlotToSkin((prev) => ({ ...prev, [slot]: event.target.value }))}
                  placeholder={`skin id for ${slot}`}
                />
              </div>
            ))}
            <Button variant='secondary'>Save Character Skin</Button>
          </div>

          <div className='rounded-md border border-border p-4'>
            <h3 className='mb-3 text-sm font-semibold'>Assembled Preview (mock)</h3>
            <div className='mx-auto flex h-80 w-56 flex-col items-center justify-center rounded border border-border bg-muted/30'>
              {defaultSlots.map((slot) => (
                <div key={slot} className='mb-2 w-44 rounded bg-card px-2 py-1 text-center text-xs'>
                  {slot}: {slotToSkin[slot] || 'none'}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
