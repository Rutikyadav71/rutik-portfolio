'use client'
import { useState, useRef, useEffect } from 'react'
import { useAdmin } from '@/context/AdminContext'
import { Pencil, Check, X } from 'lucide-react'
import { clsx } from 'clsx'

interface EditableTextProps {
  value: string
  onChange: (val: string) => void
  className?: string
  multiline?: boolean
  placeholder?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'
}

export function EditableText({ value, onChange, className, multiline = false, placeholder, as: Tag = 'span' }: EditableTextProps) {
  const { isAdmin, isEditMode } = useAdmin()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  if (!isAdmin || !isEditMode) {
    return <Tag className={className}>{value}</Tag>
  }

  const save = () => { onChange(draft); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }

  if (editing) {
    return (
      <span className="relative inline-flex flex-col gap-1 w-full">
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            className={clsx('w-full bg-slate-900 border border-primary/50 rounded-lg px-3 py-2 text-white outline-none resize-none', className)}
            onKeyDown={e => { if (e.key === 'Escape') cancel() }}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className={clsx('w-full bg-slate-900 border border-primary/50 rounded-lg px-3 py-2 text-white outline-none', className)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          />
        )}
        <span className="flex gap-2">
          <button onClick={save} className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><Check size={12} /></button>
          <button onClick={cancel} className="p-1.5 rounded-md bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"><X size={12} /></button>
        </span>
      </span>
    )
  }

  return (
    <Tag
      className={clsx('group relative cursor-pointer', className)}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-slate-600 italic">{placeholder || 'Click to edit...'}</span>}
      <Pencil size={10} className="inline ml-1.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
    </Tag>
  )
}

// Editable comma-separated list (for tech tags)
interface EditableTagsProps {
  tags: string[]
  onChange: (tags: string[]) => void
  className?: string
}

export function EditableTags({ tags, onChange, className }: EditableTagsProps) {
  const { isAdmin, isEditMode } = useAdmin()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(tags.join(', '))

  useEffect(() => { setDraft(tags.join(', ')) }, [tags])

  if (!isAdmin || !isEditMode) return null

  const save = () => {
    onChange(draft.split(',').map(t => t.trim()).filter(Boolean))
    setEditing(false)
  }

  return (
    <div className={className}>
      {editing ? (
        <div className="flex gap-2 items-start mt-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="React, Node.js, MySQL"
            className="flex-1 bg-slate-900 border border-primary/50 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
            autoFocus
          />
          <button onClick={save} className="p-2 rounded-md bg-emerald-500/20 text-emerald-400"><Check size={12} /></button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-primary/60 hover:text-primary border border-dashed border-primary/30 hover:border-primary/60 px-2 py-1 rounded-md transition-all mt-2 flex items-center gap-1"
        >
          <Pencil size={10} /> Edit tags
        </button>
      )}
    </div>
  )
}
