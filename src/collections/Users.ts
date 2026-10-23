import type { CollectionConfig } from 'payload'

const isCustomer = (user: unknown): user is { collection: 'users'; id: string | number } =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { hidden: true, useAsTitle: 'email' },
  access: {
    create: () => true,
    read: ({ req }) => (isCustomer(req.user) ? { id: { equals: req.user.id } } : false),
    update: ({ req }) => (isCustomer(req.user) ? { id: { equals: req.user.id } } : false),
    delete: ({ req }) => (isCustomer(req.user) ? { id: { equals: req.user.id } } : false),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'defaultAddress', type: 'textarea' },
  ],
}
