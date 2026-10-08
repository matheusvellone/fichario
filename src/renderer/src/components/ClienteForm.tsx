import { useEffect, useState, type FormEvent } from 'react'
import type { Cliente } from '../../../shared/types'
import Botao from './Botao'
import Confirmar from './Confirmar'

interface Props {
  cliente?: Cliente
  onSalvo: (c: Cliente) => void
  onCancelar?: () => void
  onExcluido?: () => void
}

export default function ClienteForm({ cliente, onSalvo, onCancelar, onExcluido }: Props) {
  const [nome, setNome] = useState(cliente?.nome ?? '')
  const [endereco, setEndereco] = useState(cliente?.endereco ?? '')
  const [telefone, setTelefone] = useState(cliente?.telefone ?? '')
  const [salvo, setSalvo] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (!salvo) return
    const t = setTimeout(() => setSalvo(false), 2500)
    return () => clearTimeout(t)
  }, [salvo])

  const alterado =
    !cliente ||
    nome !== cliente.nome ||
    endereco !== (cliente.endereco ?? '') ||
    telefone !== (cliente.telefone ?? '')

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    const input = { nome, endereco, telefone }
    const resultado = cliente
      ? await window.api.clientes.update(cliente.id, input)
      : await window.api.clientes.create(input)
    setSalvo(true)
    onSalvo(resultado)
  }

  async function excluir() {
    if (!cliente) return
    await window.api.clientes.remove(cliente.id)
    setConfirmando(false)
    onExcluido?.()
  }

  return (
    <section className="mx-auto max-w-4xl rounded-lg bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">{cliente ? 'Dados do cliente' : 'Novo cliente'}</h2>
      <form onSubmit={salvar} className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-medium text-slate-700">Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus={!cliente}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-medium text-slate-700">Telefone</span>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-medium text-slate-700">Endereço</span>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-500"
          />
        </label>

        <div className="flex items-center gap-3">
          <Botao type="submit" disabled={!nome.trim() || !alterado}>
            {cliente ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Botao>
          {onCancelar && (
            <Botao type="button" variante="secundario" onClick={onCancelar}>
              Cancelar
            </Botao>
          )}
          {salvo && <span className="font-medium text-green-700">✓ Salvo!</span>}
          {cliente && (
            <Botao
              type="button"
              variante="perigo"
              className="ml-auto"
              onClick={() => setConfirmando(true)}
            >
              Excluir cliente
            </Botao>
          )}
        </div>
      </form>

      {confirmando && cliente && (
        <Confirmar
          mensagem={`Tem certeza que deseja excluir o cliente "${cliente.nome}" e todas as suas anotações? Isso não pode ser desfeito.`}
          textoConfirmar="Sim, excluir"
          onConfirmar={excluir}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </section>
  )
}
