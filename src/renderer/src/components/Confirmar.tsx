import Botao from './Botao'
import { useEsc } from './useEsc'

interface Props {
  mensagem: string
  textoConfirmar: string
  onConfirmar: () => void
  onCancelar: () => void
}

export default function Confirmar({ mensagem, textoConfirmar, onConfirmar, onCancelar }: Props) {
  useEsc(onCancelar)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl">
        <p>{mensagem}</p>
        <div className="flex justify-end gap-2">
          <Botao variante="secundario" onClick={onCancelar} autoFocus>
            Cancelar
          </Botao>
          <Botao variante="vermelho" onClick={onConfirmar}>
            {textoConfirmar}
          </Botao>
        </div>
      </div>
    </div>
  )
}
