import { useCallback, useEffect, useState } from 'react'
import type { Nota, ResumoNotas, TipoCadastro, TipoNota } from '../../../shared/types'
import { formatarMoeda } from '../format'
import Botao from './Botao'
import ListaNotas from './ListaNotas'
import NotaForm from './NotaForm'

interface Props {
  tipo: TipoCadastro
  id: number
  onAbrir: (tipo: TipoCadastro, id: number) => void
}

// Notas de um cliente ou de um fornecedor, na tela de cadastro. No cliente, o que se
// anota agora são serviços (ServicosCliente); aqui só aparecem as notas antigas dele
export default function NotasCadastro({ tipo, id, onAbrir }: Props) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [resumo, setResumo] = useState<ResumoNotas>({ entrou: 0, saiu: 0 })
  const [nova, setNova] = useState<TipoNota | null>(null)

  const carregar = useCallback(async () => {
    const filtro = tipo === 'cliente' ? { clienteId: id } : { fornecedorId: id }
    const [lista, totais] = await Promise.all([
      window.api.notas.list(filtro),
      window.api.notas.resumo(filtro)
    ])
    setNotas(lista)
    setResumo(totais)
  }, [tipo, id])

  useEffect(() => {
    carregar()
  }, [carregar])

  if (tipo === 'cliente') {
    if (notas.length === 0) return null
    return (
      <section className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">Outras notas</h2>
        <ListaNotas notas={notas} vazio="" contexto={tipo} onAbrir={onAbrir} onMudou={carregar} />
      </section>
    )
  }

  return (
    <section className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold">Notas</h2>
        {resumo.saiu > 0 && (
          <span className="text-slate-600 dark:text-slate-400">
            · Já pagou <strong className="text-red-700 dark:text-red-400">{formatarMoeda(resumo.saiu)}</strong> para
            este fornecedor
          </span>
        )}
      </div>

      <div className="mb-3 flex gap-2">
        <Botao variante="vermelho" onClick={() => setNova('saida')}>
          − Paguei
        </Botao>
        <Botao variante="verde" onClick={() => setNova('entrada')}>
          + Recebi dinheiro
        </Botao>
      </div>

      <ListaNotas
        notas={notas}
        vazio="Nada anotado para este fornecedor."
        contexto={tipo}
        onAbrir={onAbrir}
        onMudou={carregar}
      />

      {nova && (
        <NotaForm
          tipo={nova}
          clienteId={null}
          fornecedorId={id}
          escolherFornecedor={false}
          onSalvo={() => {
            setNova(null)
            carregar()
          }}
          onCancelar={() => setNova(null)}
        />
      )}
    </section>
  )
}
