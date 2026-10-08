import type { CadastroApi, TipoCadastro } from '../../shared/types'

// Textos e API de cada tipo de cadastro; as telas são as mesmas
export const CADASTROS: Record<
  TipoCadastro,
  {
    api: () => CadastroApi
    singular: string
    plural: string
    novo: string
    exemploObservacoes: string
  }
> = {
  cliente: {
    api: () => window.api.clientes,
    singular: 'cliente',
    plural: 'Clientes',
    novo: 'Novo cliente',
    exemploObservacoes: 'Ex.: portão azul, só atende à tarde'
  },
  fornecedor: {
    api: () => window.api.fornecedores,
    singular: 'fornecedor',
    plural: 'Fornecedores',
    novo: 'Novo fornecedor',
    exemploObservacoes: 'Ex.: entrega às terças, pedir nota fiscal'
  }
}
