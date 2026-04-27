import { useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AssetPickerModal } from '@/components/common/asset-picker-modal'

export function UvVariantEditorPage() {
  const [baseUvId, setBaseUvId] = useState('')
  const [assetKey, setAssetKey] = useState('')
  const [assetUrl, setAssetUrl] = useState('')
  const [variantName, setVariantName] = useState('')

  return (
    <div>
      <PageHeader title='UV Variant Editor' description='Prototype visual workflow for rearranging UV-based pixel regions.' />

      <Card>
        <CardContent className='space-y-4 pt-5'>
          <div className='grid gap-3 md:grid-cols-2'>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Base UV Id</label>
              <Input value={baseUvId} onChange={(event) => setBaseUvId(event.target.value)} placeholder='guid-of-base-uv' />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Variant Name</label>
              <Input value={variantName} onChange={(event) => setVariantName(event.target.value)} placeholder='uvvariant.armor_red' />
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            <AssetPickerModal
              onSelect={(key, url) => {
                setAssetKey(key)
                setAssetUrl(url)
              }}
            />
            <Button variant='secondary'>Save Variant Definition</Button>
          </div>

          <div className='rounded-md border border-border p-3'>
            <p className='mb-2 text-sm font-medium'>Workspace (initial implementation)</p>
            {assetUrl ? <img src={assetUrl} alt='Variant source' className='max-h-80 rounded object-contain' /> : <p className='text-sm text-muted-foreground'>Select asset to start rearranging regions.</p>}
            {assetKey ? <p className='mt-2 text-xs text-muted-foreground'>Object key: {assetKey}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
