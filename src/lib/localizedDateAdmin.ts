const localizedDateField = '@/components/admin/LocalizedDateField#LocalizedDateField'

export function localizedDateAdmin(options?: {
  description?: string
  position?: 'sidebar'
  readOnly?: boolean
  hidden?: boolean
  condition?: (data: unknown, siblingData: unknown) => boolean
}) {
  return {
    ...options,
    date: {
      pickerAppearance: 'dayAndTime' as const,
    },
    components: {
      Field: localizedDateField,
    },
  }
}
