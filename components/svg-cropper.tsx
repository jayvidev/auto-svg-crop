'use client'

import { useState } from 'react'

import { Copy, Download, Scissors, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export function SvgCropper() {
  const [inputSvg, setInputSvg] = useState('')
  const [outputSvg, setOutputSvg] = useState('')
  const [previewBefore, setPreviewBefore] = useState('')
  const [previewAfter, setPreviewAfter] = useState('')
  const [originalViewBox, setOriginalViewBox] = useState('')
  const [croppedViewBox, setCroppedViewBox] = useState('')
  const [showStats, setShowStats] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const cropSvg = () => {
    if (!inputSvg.trim()) {
      alert('Por favor, pega un código SVG primero')
      return
    }

    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = inputSvg
      tempDiv.style.position = 'absolute'
      tempDiv.style.visibility = 'hidden'
      document.body.appendChild(tempDiv)

      const svg = tempDiv.querySelector('svg')

      if (!svg) {
        throw new Error('No se encontró un elemento SVG válido')
      }

      const originalVB = svg.getAttribute('viewBox') || 'No definido'
      setOriginalViewBox(originalVB)

      const bbox = svg.getBBox()
      const newViewBox = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
      svg.setAttribute('viewBox', newViewBox)

      svg.removeAttribute('width')
      svg.removeAttribute('height')

      const output = svg.outerHTML
      setOutputSvg(output)
      setPreviewBefore(inputSvg)
      setPreviewAfter(output)
      setCroppedViewBox(newViewBox)
      setShowStats(true)

      document.body.removeChild(tempDiv)
    } catch (error) {
      alert('Error al procesar el SVG: ' + (error as Error).message)
    }
  }

  const copyResult = async () => {
    if (!outputSvg) {
      alert('Primero recorta un SVG')
      return
    }

    try {
      await navigator.clipboard.writeText(outputSvg)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      alert('Error al copiar: ' + (error as Error).message)
    }
  }

  const clear = () => {
    setInputSvg('')
    setOutputSvg('')
    setPreviewBefore('')
    setPreviewAfter('')
    setShowStats(false)
    setCopySuccess(false)
  }

  const handleInputChange = (value: string) => {
    setInputSvg(value)
    if (value.trim() && value.includes('<svg')) {
      try {
        setPreviewBefore(value)
      } catch (error) {
        // Ignorar errores mientras escribe
      }
    } else {
      setPreviewBefore('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-primary" />
              SVG Original
            </CardTitle>
            <CardDescription>Pega aquí tu código SVG</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputSvg}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Pega aquí tu código SVG..."
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-6">
              {previewBefore ? (
                <div
                  dangerouslySetInnerHTML={{ __html: previewBefore }}
                  className="max-h-[300px] max-w-full"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Vista previa del original</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-primary" />
              SVG Recortado
            </CardTitle>
            <CardDescription>El resultado aparecerá aquí</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={outputSvg}
              readOnly
              placeholder="El SVG recortado aparecerá aquí..."
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-6">
              {previewAfter ? (
                <div
                  dangerouslySetInnerHTML={{ __html: previewAfter }}
                  className="max-h-[300px] max-w-full"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Vista previa del recortado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={cropSvg} size="lg" className="flex-1 sm:flex-none">
          <Scissors className="mr-2 h-4 w-4" />
          Recortar SVG
        </Button>
        <Button onClick={copyResult} variant="secondary" size="lg" className="flex-1 sm:flex-none">
          <Copy className="mr-2 h-4 w-4" />
          {copySuccess ? '¡Copiado!' : 'Copiar Resultado'}
        </Button>
        <Button
          onClick={clear}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none bg-transparent"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-l-4 border-l-primary bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">💡 Cómo funciona:</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa el método <code className="rounded bg-muted px-1 py-0.5">getBBox()</code> para
                calcular las coordenadas exactas del contenido visible y ajusta automáticamente el{' '}
                <code className="rounded bg-muted px-1 py-0.5">viewBox</code> para eliminar todo el
                espacio vacío.
              </p>
            </div>

            {showStats && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-background p-3">
                  <p className="text-xs font-semibold text-primary">ViewBox Original:</p>
                  <p className="mt-1 text-sm text-foreground">{originalViewBox}</p>
                </div>
                <div className="rounded-lg bg-background p-3">
                  <p className="text-xs font-semibold text-primary">ViewBox Recortado:</p>
                  <p className="mt-1 text-sm text-foreground">{croppedViewBox}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
