import { apiClient } from '@/api/client'
import type { AssetUploadResult } from '@/types/assets'

export async function uploadAsset(file: File, options?: { folder?: string; isPublic?: boolean }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', options?.folder ?? 'assets')
  formData.append('isPublic', String(options?.isPublic ?? true))

  const { data } = await apiClient.post<AssetUploadResult>('/api/assets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return data
}

export async function replaceAsset(objectKey: string, file: File, isPublic = true) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('isPublic', String(isPublic))

  const { data } = await apiClient.post<AssetUploadResult>(`/api/assets/replace/${objectKey}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return data
}

export async function getSignedUrl(objectKey: string) {
  const { data } = await apiClient.get<{ url: string }>(`/api/assets/signed-url/${objectKey}`)
  return data.url
}
