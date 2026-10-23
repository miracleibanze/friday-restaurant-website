import type { CollectionConfig } from 'payload'

const owned = ({ req }: { req: { user?: null | { collection?: string; id: string | number } } }) =>
  req.user?.collection === 'users' ? { customer: { equals: req.user.id } } : false

export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: { group: 'Orders', useAsTitle: 'id' },
  access: { create: () => true, read: owned, update: owned, delete: owned },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'food', type: 'relationship', relationTo: 'foods', required: true },
        { name: 'quantity', type: 'number', required: true, min: 1 },
      ],
    },
  ],
}
