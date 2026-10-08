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

// Notas de um cliente ou de um fornecedor, na tela de cadastro
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

  const recebi = (
    <Botao variante="verde" onClick={() => setNova('entrada')}>
      + Recebi dinheiro
    </Botao>
  )
  const paguei = (
    <Botao variante="vermelho" onClick={() => setNova('saida')}>
      − Paguei
    </Botao>
  )

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold">Notas</h2>
        {tipo === 'cliente' && resumo.entrou > 0 && (
          <span className="text-slate-600">
            · Já recebeu <strong className="text-green-700">{formatarMoeda(resumo.entrou)}</strong>{' '}
            deste cliente
          </span>
        )}
        {tipo === 'fornecedor' && resumo.saiu > 0 && (
          <span className="text-slate-600">
            · Já pagou <strong className="text-red-700">{formatarMoeda(resumo.saiu)}</strong> para
            este fornecedor
          </span>
        )}
      </div>

      <div className="mb-3 flex gap-2">
        {tipo === 'cliente' ? (
          <>
            {recebi}
            {paguei}
          </>
        ) : (
          <>
            {paguei}
            {recebi}
          </>
        )}
      </div>

      <ListaNotas
        notas={notas}
        vazio={`Nada anotado para este ${tipo}.`}
        contexto={tipo}
        onAbrir={onAbrir}
        onMudou={carregar}
      />

      {nova && (
        <NotaForm
          tipo={nova}
          clienteId={tipo === 'cliente' ? id : null}
          fornecedorId={tipo === 'fornecedor' ? id : null}
          escolherFornecedor={tipo !== 'fornecedor'}
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
