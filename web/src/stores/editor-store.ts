import { create } from 'zustand'

type EditorState = {
  selectedDefinitionType: string | null
  setSelectedDefinitionType: (value: string | null) => void
  selectedAssetKey: string | null
  setSelectedAssetKey: (value: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedDefinitionType: null,
  setSelectedDefinitionType: (value) => set({ selectedDefinitionType: value }),
  selectedAssetKey: null,
  setSelectedAssetKey: (value) => set({ selectedAssetKey: value })
}))
