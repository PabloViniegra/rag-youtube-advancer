'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ThumbnailImageProps {
  youtubeId: string
  alt: string
  sizes: string
  className?: string
  priority?: boolean
}

/**
 * YouTube thumbnail con fallback automático.
 *
 * Intenta primero maxresdefault (1280×720, 16:9) que es suficiente para
 * cualquier pantalla retina. Si el video no lo tiene (videos muy antiguos),
 * cae a hqdefault (480×360) vía onError sin romper el layout.
 */
export function ThumbnailImage({
  youtubeId,
  alt,
  sizes,
  className,
  priority,
}: ThumbnailImageProps) {
  const [src, setSrc] = useState(
    `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
  )

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      quality={90}
      priority={priority}
      onError={() =>
        setSrc(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`)
      }
    />
  )
}
