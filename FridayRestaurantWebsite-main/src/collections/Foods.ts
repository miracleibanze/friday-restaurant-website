import type { CollectionConfig } from 'payload'

export const Foods: CollectionConfig = {
  slug: 'foods',
  admin: { group: 'Restaurant', useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'available', type: 'checkbox', defaultValue: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'prepTime', type: 'number', defaultValue: 25, min: 5 },
    { name: 'rating', type: 'number', defaultValue: 4.8, min: 0, max: 5 },
    { name: 'calories', type: 'number', min: 0 },
  ],
}
