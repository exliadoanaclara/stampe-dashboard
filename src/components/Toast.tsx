interface ToastProps {
  message: string | null
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print animate-in slide-in-from-bottom-4 duration-300" onClick={onClose} role="alert">
      <div className="bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-[90vw] text-center">
        {message}
      </div>
    </div>
  )
}