import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './src/schemas'

export default defineConfig({
  name: 'default',
  title: 'Ninestar Auto',

  projectId: 'bd6a1e7e',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
})
