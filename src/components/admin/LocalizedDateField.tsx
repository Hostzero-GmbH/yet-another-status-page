'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DatePicker, useField } from '@payloadcms/ui'
import { FieldDescription } from '@payloadcms/ui/fields/FieldDescription'
import { FieldError } from '@payloadcms/ui/fields/FieldError'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import {
  DEFAULT_DATETIME_CONFIG,
  pickerDateToUtc,
  resolveDateTimeConfig,
  utcToPickerDate,
  uses12HourClock,
  type DateTimeConfig,
} from '@/lib/datetime'

type DateFieldProps = {
  path: string
  field: {
    admin?: {
      className?: string
      date?: {
        displayFormat?: string
        overrides?: Record<string, unknown>
        pickerAppearance?: 'dayAndTime' | 'dayOnly' | 'timeOnly' | 'monthOnly' | 'default'
      }
      description?: string
      placeholder?: string
    }
    label?: string
    localized?: boolean
    required?: boolean
  }
  readOnly?: boolean
}

export const LocalizedDateField: React.FC<DateFieldProps> = ({ field, path, readOnly }) => {
  const { value, setValue, showError, disabled } = useField<string>({ path })
  const [config, setConfig] = useState<DateTimeConfig>(DEFAULT_DATETIME_CONFIG)

  useEffect(() => {
    let cancelled = false
    fetch('/api/globals/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setConfig(resolveDateTimeConfig(data))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const pickerAppearance = field.admin?.date?.pickerAppearance || 'dayAndTime'
  const hour12 = uses12HourClock(config.locale)
  const displayFormat =
    field.admin?.date?.displayFormat ||
    (pickerAppearance === 'dayAndTime'
      ? hour12
        ? 'MMM d, yyyy h:mm aa'
        : 'MMM d, yyyy HH:mm'
      : undefined)
  const timeFormat = hour12 ? 'h:mm aa' : 'HH:mm'

  const displayedValue = useMemo(
    () => (value ? utcToPickerDate(value, config.timezone) : undefined),
    [value, config.timezone],
  )

  const onChange = useCallback(
    (incoming: Date | null) => {
      if (readOnly || disabled) return
      setValue(incoming ? pickerDateToUtc(incoming, config.timezone) : null)
    },
    [readOnly, disabled, setValue, config.timezone],
  )

  return (
    <div
      className={['field-type', 'date-time-field', field.admin?.className, showError && 'date-time-field--has-error']
        .filter(Boolean)
        .join(' ')}
    >
      <FieldLabel
        label={field.label}
        localized={field.localized}
        path={path}
        required={field.required}
      />
      <div className="field-type__wrap" id={`field-${path.replace(/\./g, '__')}`}>
        <FieldError path={path} showError={showError} />
        <DatePicker
          displayFormat={displayFormat}
          onChange={onChange}
          overrides={{
            calendarStartDay: config.weekStartsOn === 'sunday' ? 0 : 1,
            ...field.admin?.date?.overrides,
          }}
          pickerAppearance={pickerAppearance}
          placeholder={field.admin?.placeholder}
          readOnly={readOnly || disabled}
          timeFormat={timeFormat}
          value={displayedValue}
        />
      </div>
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
