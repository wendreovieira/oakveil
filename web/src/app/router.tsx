import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/app/protected-route'
import { AppShell } from '@/layouts/app-shell'
import { LoginPage } from '@/pages/login-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { DefinitionListPage } from '@/pages/definitions/definition-list-page'
import { DefinitionFormPage } from '@/pages/definitions/definition-form-page'
import { TextureEditorPage } from '@/pages/editors/texture-editor-page'
import { UvEditorPage } from '@/pages/editors/uv-editor-page'
import { UvVariantEditorPage } from '@/pages/editors/uv-variant-editor-page'
import { CharacterRigEditorPage } from '@/pages/editors/character-rig-editor-page'
import { CharacterSkinEditorPage } from '@/pages/editors/character-skin-editor-page'
import { RigAnimationEditorPage } from '@/pages/editors/rig-animation-editor-page'
import { GraphEditorPage } from '@/pages/editors/graph-editor-page'
import { QuestEditorPage } from '@/pages/editors/quest-editor-page'
import { SlotsPage } from '@/pages/slots/slots-page'
import { SkeletonsPage } from '@/pages/skeletons/skeletons-page'
import { SkinsPage } from '@/pages/skins/skins-page'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'definitions/:definitionType',
        element: <DefinitionListPage />
      },
      {
        path: 'definitions/:definitionType/:definitionId',
        element: <DefinitionFormPage />
      },
      {
        path: 'editors/texture',
        element: <TextureEditorPage />
      },
      {
        path: 'editors/uv',
        element: <UvEditorPage />
      },
      {
        path: 'editors/uvvariant',
        element: <UvVariantEditorPage />
      },
      {
        path: 'editors/characterrig',
        element: <CharacterRigEditorPage />
      },
      {
        path: 'editors/characterskin',
        element: <CharacterSkinEditorPage />
      },
      {
        path: 'editors/riganimation',
        element: <RigAnimationEditorPage />
      },
      {
        path: 'editors/graph',
        element: <GraphEditorPage />
      },
      {
        path: 'editors/quest',
        element: <QuestEditorPage />
      },
      {
        path: 'slots',
        element: <SlotsPage />
      },
      {
        path: 'skeletons',
        element: <SkeletonsPage />
      },
      {
        path: 'skins',
        element: <SkinsPage />
      }
    ]
  }
])
