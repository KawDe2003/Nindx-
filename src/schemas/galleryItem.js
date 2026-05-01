export default {
  name: 'galleryItem',
  type: 'document',
  title: 'Gallery Items',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title / Description'
    },
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    }
  ]
}
