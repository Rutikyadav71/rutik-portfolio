import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glowing?: boolean
  children: React.ReactNode
}

export default function Card({ glowing, children, style, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'rgba(8,15,40,0.60)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s ease',
        ...style,
      }}
      onMouseEnter={glowing ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 60px rgba(99,102,241,0.18)'
      } : undefined}
      onMouseLeave={glowing ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
