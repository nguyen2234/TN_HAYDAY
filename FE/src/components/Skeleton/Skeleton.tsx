import React from 'react'
import cn from 'clsx'
import styles from './Skeleton.module.scss'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  variant?: 'text' | 'rect' | 'circle'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  borderRadius,
  variant = 'rect',
}) => {
  return (
    <div
      className={cn(styles.skeleton, styles[variant], className)}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  )
}
