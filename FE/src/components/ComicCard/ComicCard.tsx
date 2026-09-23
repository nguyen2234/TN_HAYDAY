import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Badge, Card } from 'react-bootstrap'
import cn from 'clsx'
import type { Comic } from '~types/comic'
import styles from './ComicCard.module.scss'

interface ComicCardProps {
  comic: Comic
  onClick?: (slug: string) => void
}

const POINTER_OFFSET_X = 14
const POINTER_OFFSET_Y = 18

const formatViews = (views: number) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

const STATUS_LABEL: Record<Comic['status'], string> = {
  ongoing: 'Đang ra',
  completed: 'Hoàn thành',
  paused: 'Tạm dừng',
}

const buildTooltipContent = (comic: Comic) => {
  const lines: React.ReactNode[] = [
    <div key="status" className={styles.tooltipLine}>
      <span className={styles.tooltipKey}>Tình trạng:</span> {STATUS_LABEL[comic.status]}
    </div>,
    <div key="chapter" className={styles.tooltipLine}>
      <span className={styles.tooltipKey}>Mới nhất:</span> {comic.latestChapter}
    </div>,
    <div key="time" className={styles.tooltipLine}>
      <span className={styles.tooltipKey}>Cập nhật:</span> {comic.updatedAt}
    </div>,
  ]

  if (comic.categories.length > 0) {
    lines.push(
      <div key="cat" className={styles.tooltipLine}>
        <span className={styles.tooltipKey}>Thể loại:</span> {comic.categories.join(', ')}
      </div>,
    )
  }

  if (comic.viewCount > 0) {
    lines.push(
      <div key="views" className={styles.tooltipLine}>
        <span className={styles.tooltipKey}>Lượt xem:</span> {formatViews(comic.viewCount)}
      </div>,
    )
  }

  return lines
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onClick }) => {
  const [followTip, setFollowTip] = useState<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  })
  const pendingPos = useRef({ x: 0, y: 0 })
  const rafId = useRef<number | null>(null)

  const flushPosition = useCallback(() => {
    rafId.current = null
    setFollowTip(prev =>
      prev.active
        ? { active: true, x: pendingPos.current.x, y: pendingPos.current.y }
        : prev,
    )
  }, [])

  const handleTitleMove = (e: React.MouseEvent) => {
    pendingPos.current = { x: e.clientX, y: e.clientY }
    if (rafId.current == null) {
      rafId.current = requestAnimationFrame(flushPosition)
    }
  }

  const handleTitleEnter = (e: React.MouseEvent) => {
    pendingPos.current = { x: e.clientX, y: e.clientY }
    setFollowTip({ active: true, x: e.clientX, y: e.clientY })
  }

  const handleTitleLeave = () => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    setFollowTip(prev => ({ ...prev, active: false }))
  }

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const handleClick = () => {
    if (onClick) onClick(comic.slug)
  }

  const tooltipPortal = followTip.active
    ? createPortal(
        <div
          role="tooltip"
          className={styles.followTooltip}
          style={{
            left: followTip.x + POINTER_OFFSET_X,
            top: followTip.y + POINTER_OFFSET_Y,
          }}
        >
          <div className={styles.tooltipTitle}>{comic.title}</div>
          <div className={styles.tooltipBody}>{buildTooltipContent(comic)}</div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      {tooltipPortal}
      <Card className={cn('border-0', styles.comicCard)} onClick={handleClick}>
        <div className={styles.imageWrapper}>
          <Card.Img variant="top" src={comic.coverUrl} alt={comic.title} loading="lazy" />

          <Badge
            bg={
              comic.status === 'ongoing'
                ? 'success'
                : comic.status === 'completed'
                  ? 'primary'
                  : 'danger'
            }
            className={styles.statusBadge}
          >
            {STATUS_LABEL[comic.status]}
          </Badge>

          {comic.viewCount > 0 ? (
            <div className={styles.viewBadge}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatViews(comic.viewCount)}
            </div>
          ) : (
            <div className={styles.categoryBadge}>{comic.categories[0] ?? 'Truyện mới'}</div>
          )}
        </div>

        <Card.Body className={styles.content}>
          <span
            className={styles.titleTrigger}
            onMouseEnter={handleTitleEnter}
            onMouseMove={handleTitleMove}
            onMouseLeave={handleTitleLeave}
          >
            <span className={styles.title}>{comic.title}</span>
          </span>
          <div className={styles.footer}>
            <span className={styles.chapter}>{comic.latestChapter}</span>
            <span className={styles.time}>{comic.updatedAt}</span>
          </div>
        </Card.Body>
      </Card>
    </>
  )
}
