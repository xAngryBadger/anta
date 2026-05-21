import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Preloader } from './components/Preloader'
import { useLenis } from './hooks/useLenis'
import { revealVariants, staggerContainer } from './hooks/useScrollReveal'
import { apiUrl, apiHeaders } from './lib/api'
import { ApiConfig } from './components/ApiConfig'
import { BetaBanner } from './components/BetaBanner'

const COLAB_URL = 'https://colab.research.google.com/github/xAngryBadger/pdf-compressor/blob/main/colab-backend.ipynb'

function App() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [bannerVisible, setBannerVisible] = useState(() => !localStorage.getItem('badger-beta-banner-dismissed'))
  const [file, setFile] = useState<File | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [result, setResult] = useState<{ original: string; compressed: string; reduction: number; originalSize: number; compressedSize: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useLenis()

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') setFile(dropped)
  }, [])

  const handleCompress = async () => {
    if (!file) return
    setCompressing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(apiUrl('/api/compress'), {
        method: 'POST',
        body: formData,
        headers: apiHeaders(),
      })

      if (!response.ok) throw new Error('Failed to compress')

      const blob = await response.blob()
      const reduction = Math.max(0, Math.round((1 - blob.size / file.size) * 100))

      setResult({
        original: file.name,
        compressed: `compressed_${file.name}`,
        reduction,
        originalSize: file.size,
        compressedSize: blob.size,
      })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compressed_${file.name}`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 10000)
  } catch (error) {
    if (error instanceof Error && error.message === 'NO_API_URL') {
      alert('Configure a URL da API primeiro. Clique em "Sem API" no header e cole a URL do ngrok.')
    } else {
      console.error('Error:', error)
      alert('Erro ao comprimir PDF. Verifique se o backend está online.')
    }
    } finally {
      setCompressing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <>
      {showPreloader && <Preloader title="PDF Compressor" onComplete={() => setShowPreloader(false)} />}

      <div className="noise-overlay noise-overlay--animated" aria-hidden="true" />

      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0 0)' }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
      >
      <BetaBanner colabUrl={COLAB_URL} onDismiss={() => setBannerVisible(false)} />
      <header className={`fixed left-0 right-0 z-40 fade-border-bottom h-16 flex items-center transition-top duration-300 ${bannerVisible ? 'top-[44px]' : 'top-0'}`} style={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(9,9,11,0.8)' }}>
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-8 h-8 flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-lg font-serif font-normal tracking-tight text-[var(--color-cream)]">PDF Compressor</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
        <ApiConfig colabUrl={COLAB_URL} />
        <span className="label-mono text-[var(--color-text-muted)]">Até 90% menor</span>
      </div>
          </div>
        </header>

        <main className={`max-w-5xl mx-auto px-6 pb-16 lg:px-8 transition-[padding] duration-300 ${bannerVisible ? 'pt-[7rem]' : 'pt-20'}`}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={revealVariants} custom={0} className="mb-12 text-center">
              <p className="eyebrow text-[var(--color-primary)] mb-3">Compressão de PDF</p>
              <h2 className="text-3xl md:text-4xl font-serif font-normal text-[var(--color-cream)] leading-tight">
                Reduza o tamanho.<br />
                <span className="text-[var(--color-amber-light)]">Mantenha a qualidade.</span>
              </h2>
        <p className="mt-4 text-[var(--color-text-muted)] max-w-md mx-auto">
          Comprima PDFs com backend gratuito no Google Colab.
          Sem cadastro, sem cartão de crédito.
        </p>
            </motion.div>

            <motion.div variants={revealVariants} custom={0.1}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border border-dashed transition-all duration-300 cursor-pointer geometric-bg ${
                  isDragging
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }`}
                style={{ minHeight: '240px' }}
              >
                <input
                  type="file"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f?.type === 'application/pdf') setFile(f) }}
                  accept="application/pdf"
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center justify-center py-20 px-8 relative z-10">
  <motion.svg
          className="w-10 h-10 text-[var(--color-primary)] mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          animate={{ y: isDragging ? -4 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </motion.svg>
                  <p className="font-serif text-lg text-[var(--color-cream)]">Arraste seu PDF aqui</p>
                  <p className="label-mono text-[var(--color-text-muted)] mt-2">ou clique para selecionar</p>

                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-center"
                    >
                      <p className="text-sm text-[var(--color-primary)]">{file.name}</p>
                      <p className="label-mono text-[var(--color-text-muted)] mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </motion.div>
                  )}
                </label>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {file && !result && (
                <motion.div
                  key="compress-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="mt-8 editorial-divider pb-8"
                >
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="section-number">01</span>
                    <h3 className="text-xl font-serif font-normal text-[var(--color-cream)]">Comprimir</h3>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text)] truncate">{file.name}</p>
                      <p className="label-mono text-[var(--color-text-muted)] mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-amber-light)] transition-colors ml-4"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={handleCompress}
                    disabled={compressing}
                    className="btn-clipped w-full"
                  >
                    <span className="btn-text-back flex items-center justify-center gap-2 font-semibold text-sm tracking-wide">
                      {compressing ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Comprimindo...
                        </>
                      ) : (
                        'Comprimir PDF'
                      )}
                    </span>
                  </button>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                  className="mt-8"
                >
                  <div className="flex items-baseline gap-4 mb-8">
                    <span className="section-number">01</span>
                    <h3 className="text-xl font-serif font-normal text-[var(--color-cream)]">Resultado</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <ResultCard label="Redução" value={`${result.reduction}%`} accent />
                    <ResultCard label="Original" value={formatSize(result.originalSize)} />
                    <ResultCard label="Comprimido" value={formatSize(result.compressedSize)} />
                  </div>

                  <div className="editorial-divider pb-6 mb-6">
                    <div className="w-full h-[2px] bg-[var(--color-border)] overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--color-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.reduction}%` }}
                        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {result.original} → {result.compressed}
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      className="link-underline label-mono text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                    >
                      Novo arquivo
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        <footer className="fade-border-top px-6 py-6 mt-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="font-serif text-sm text-[var(--color-text-muted)]">
              Desenvolvido por Isaac Nathan
            </p>
            <a
              href="https://github.com/xAngryBadger"
              className="link-underline label-mono text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
            >
              GitHub
            </a>
          </div>
        </footer>
      </motion.div>
    </>
  )
}

function ResultCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="py-4 editorial-divider">
      <p className="eyebrow text-[var(--color-text-muted)] mb-2">{label}</p>
      <p className={`text-2xl font-serif font-normal counter-animate ${accent ? 'text-[var(--color-primary)]' : 'text-[var(--color-cream)]'}`}>
        {value}
      </p>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default App
