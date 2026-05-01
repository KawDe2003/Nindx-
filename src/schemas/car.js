export default {
  name: 'car',
  type: 'document',
  title: 'Cars',
  fields: [
    {
      name: 'make',
      type: 'string',
      title: 'Make',
      validation: Rule => Rule.required()
    },
    {
      name: 'model',
      type: 'string',
      title: 'Model',
      validation: Rule => Rule.required()
    },
    {
      name: 'year',
      type: 'number',
      title: 'Year',
      validation: Rule => Rule.required()
    },
    {
      name: 'price',
      type: 'number',
      title: 'Price ($/month)',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      type: 'image',
      title: 'Main Image',
      options: { hotspot: true }
    },
    {
      name: 'featured',
      type: 'boolean',
      title: 'Featured (Hot Deal)',
      description: 'Check this box to show this car in the Hot Deals section with a gold crown.',
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: 'model',
      subtitle: 'make',
      media: 'image'
    }
  }
}
