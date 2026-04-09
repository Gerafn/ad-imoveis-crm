import { useState, useRef, useEffect } from 'react'
import { Phone, MessageCircle } from 'lucide-react'

interface PhoneMenuProps {
  telefone: string
}

function toWhatsApp(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}`
}

export function PhoneMenu({ telefone }: PhoneMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="text-xs text-slate-400 flex items-center gap-1 hover:text-[#1B4F72] transition-colors"
      >
        <Phone size={10} />{telefone}
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
          <a
            href={`tel:${telefone}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Phone size={14} className="text-slate-500" />
            Ligar
          </a>
          <a
            href={toWhatsApp(telefone)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <MessageCircle size={14} className="text-green-500" />
            WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
