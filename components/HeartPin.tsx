interface HeartPinProps {
  color: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function HeartPin({ color, size = "md", className = "" }: HeartPinProps) {
  const sizeClasses = {
    sm: "w-8 h-10",
    md: "w-12 h-15",
    lg: "w-16 h-20",
  }

  const heartSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full rounded-b-none transform rotate-45 ${className}`}
      style={{ backgroundColor: color }}
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45">
        <div className={`${heartSizes[size]} bg-white rounded-full flex items-center justify-center`}>
          <svg className={`${heartSizes[size]} fill-current`} style={{ color }} viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
