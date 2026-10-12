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
    exemploBusca: string
    // RG, CPF/CNPJ, cidade e estado
    dadosPessoais: boolean
  }
> = {
  cliente: {
    api: () => window.api.clientes,
    singular: 'cliente',
    plural: 'Clientes',
    novo: 'Novo cliente',
    exemploObservacoes: 'Ex.: portão azul, só atende à tarde',
    exemploBusca: 'Buscar por nome, telefone, CPF/CNPJ, endereço, cidade, observação ou nota...',
    dadosPessoais: true
  },
  fornecedor: {
    api: () => window.api.fornecedores,
    singular: 'fornecedor',
    plural: 'Fornecedores',
    novo: 'Novo fornecedor',
    exemploObservacoes: 'Ex.: entrega às terças, pedir nota fiscal',
    exemploBusca: 'Buscar por nome, telefone, endereço, observação ou nota...',
    dadosPessoais: false
  }
}

export const ESTADOS: { sigla: string; nome: string }[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
]
