interface UserAvatarProps {
  name: string
  avatarUrl?: string
}

export function UserAvatar({ name, avatarUrl }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: External avatar URLs vary by provider and are user-generated.
      <img
        src={avatarUrl}
        alt={name}
        className="size-8 shrink-0 rounded-full object-cover ring-1 ring-outline-variant"
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-on-primary-container">
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  )
}
