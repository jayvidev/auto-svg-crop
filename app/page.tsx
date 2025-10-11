import { Scissors } from 'lucide-react'

import { SvgCropper } from '@/components/svg-cropper'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                <Scissors className="h-8 w-8 text-primary" />
                Recortador Automático de SVG
              </h1>
              <p className="text-muted-foreground">
                Elimina el espacio vacío alrededor de tu SVG automáticamente
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* Main Content */}
          <SvgCropper />
        </div>
      </div>
    </div>
  )
}
