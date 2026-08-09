export const isSvgFile = (file: File) => file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)

export const readSvgFile = async (file: File): Promise<string> => {
  if (!isSvgFile(file)) {
    throw new Error(`"${file.name}" is not a .svg file`)
  }
  return await file.text()
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(2)} KB`
}

export const byteSize = (content: string) => new TextEncoder().encode(content).length
