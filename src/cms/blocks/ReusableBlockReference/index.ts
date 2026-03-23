import type { Block } from 'payload'

import { REUSABLE_BLOCK_REFERENCE_SLUG, SHARED_BLOCKS_COLLECTION_SLUG } from '../contracts'

export const ReusableBlockReferenceBlock: Block = {
  slug: REUSABLE_BLOCK_REFERENCE_SLUG,
  labels: {
    plural: 'Reusable blocks',
    singular: 'Reusable block',
  },
  fields: [
    {
      name: 'shared',
      type: 'relationship',
      relationTo: SHARED_BLOCKS_COLLECTION_SLUG as 'shared-blocks',
      required: true,
    },
  ],
}
