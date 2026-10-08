import { useEffect, useState } from 'react'
import Botao from './Botao'

export default function AvisoAtualizacao() {
  const [versao, setVersao] = useState<string | null>(null)
  const [dispensado, setDispensado] = useState(false)

  useEffect(() => window.api.updater.onUpdateDownloaded(setVersao), [])

  if (!versao || dispensado) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold">Atualização disponível</h2>
        <p>
          Uma nova versão do Fichário ({versao}) foi baixada.
          <br />
          <strong>Reinicie o programa para aplicar a atualização.</strong>
        </p>
        <p className="text-slate-500">
          Seus dados não serão perdidos. Se preferir, a atualização será aplicada automaticamente
          na próxima vez que você fechar o programa.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Botao variante="secundario" onClick={() => setDispensado(true)}>
            Depois
          </Botao>
          <Botao onClick={() => window.api.updater.restart()}>Reiniciar agora</Botao>
        </div>
      </div>
    </div>
  )
}
