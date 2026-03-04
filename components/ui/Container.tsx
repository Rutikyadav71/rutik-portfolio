import { HTMLAttributes } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const maxWidths = { sm: '42rem', md: '56rem', lg: '64rem', xl: '80rem' }

export default function Container({ children, size = 'xl', style, ...props }: ContainerProps) {
  return (
    <div
      style={{ maxWidth: maxWidths[size], margin: '0 auto', padding: '0 clamp(1rem,4vw,2.5rem)', ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
