import type { CollectionConfig } from 'payload'

const orderOwner = ({ req }: { req: { user?: null | { collection?: string; id: string | number } } }) =>
  req.user?.collection === 'users' ? { customer: { equals: req.user.id } } : false

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { group: 'Orders', useAsTitle: 'orderNumber' },
  access: { create: () => true, read: orderOwner, update: orderOwner, delete: () => false },
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'users' },
    { name: 'customerName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'deliveryAddress', type: 'textarea', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'food', type: 'relationship', relationTo: 'foods', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true, min: 0 },
        { name: 'quantity', type: 'number', required: true, min: 1 },
      ],
    },
    { name: 'subtotal', type: 'number', required: true, min: 0 },
    { name: 'deliveryFee', type: 'number', required: true, min: 0 },
    { name: 'total', type: 'number', required: true, min: 0 },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Mobile Money', value: 'mobile-money' },
        { label: 'Card on delivery', value: 'card' },
        { label: 'Cash on delivery', value: 'cash' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Preparing', value: 'preparing' },
        { label: 'On the way', value: 'on-the-way' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    { name: 'notes', type: 'textarea' },
  ],
}
