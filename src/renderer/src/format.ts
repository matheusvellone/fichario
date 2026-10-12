const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numero = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function formatarMoeda(centavos: number): string {
  return moeda.format(centavos / 100)
}

// Valor para preencher o campo de edição: 150050 → "1.500,50"
export function valorParaCampo(centavos: number): string {
  return numero.format(centavos / 100)
}

// Campo de valor estilo maquininha: só dígitos, os dois últimos são os centavos.
// "1200" → 1200 centavos (12,00); apagar um dígito volta para 120 (1,20)
export function centavosDoCampo(texto: string): number {
  const digitos = texto.replace(/\D/g, '').slice(0, 11)
  return digitos ? Number(digitos) : 0
}

// Máscara de telefone aplicada enquanto a pessoa digita.
// DDD + 8 dígitos: (11) 3333-4444 · DDD + 9 dígitos: (11) 99999-4444
export function formatarTelefone(texto: string): string {
  let d = texto.replace(/\D/g, '')
  // Número colado com o código do país (+55 11 99999-1234). Sem o "+", 55 é DDD (RS)
  if (texto.trim().startsWith('+55')) d = d.slice(2)
  d = d.slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  const ddd = `(${d.slice(0, 2)}) `
  const numero = d.slice(2)
  if (numero.length <= 4) return ddd + numero
  const meio = numero.length === 9 ? 5 : 4
  return `${ddd}${numero.slice(0, meio)}-${numero.slice(meio)}`
}

// Telefone vazio ou completo (10 ou 11 dígitos)
export function telefoneValido(telefone: string): boolean {
  const digitos = telefone.replace(/\D/g, '').length
  return digitos === 0 || digitos === 10 || digitos === 11
}

// Só os caracteres que contam no documento. CNPJ pode ter letras (alfanumérico, desde 2026)
function caracteresDocumento(texto: string): string {
  return texto.toUpperCase().replace(/[^0-9A-Z]/g, '')
}

// Máscara de CPF/CNPJ aplicada enquanto a pessoa digita. Até 11 dígitos é CPF
// (123.456.789-09); com mais caracteres, ou com letra, vira CNPJ (12.ABC.345/01DE-35)
export function formatarCpfCnpj(texto: string): string {
  let d = caracteresDocumento(texto)
  if (d.length <= 11 && /^\d*$/.test(d)) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
  }
  // Os dois últimos (dígitos verificadores) são sempre números
  d = d.slice(0, 12) + d.slice(12, 14).replace(/\D/g, '')
  return d
    .replace(/^(\w{2})(\w)/, '$1.$2')
    .replace(/^(\w{2})\.(\w{3})(\w)/, '$1.$2.$3')
    .replace(/^(\w{2})\.(\w{3})\.(\w{3})(\w)/, '$1.$2.$3/$4')
    .replace(/\/(\w{4})(\w)/, '/$1-$2')
}

function cpfValido(d: string): boolean {
  if (!/^\d{11}$/.test(d) || /^(\d)\1+$/.test(d)) return false
  const verificador = (tamanho: number): number => {
    let soma = 0
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i)
    return ((soma * 10) % 11) % 10
  }
  return verificador(9) === Number(d[9]) && verificador(10) === Number(d[10])
}

// Letras valem o código ASCII menos 48 (A = 17), como define a Receita para o CNPJ alfanumérico
function cnpjValido(d: string): boolean {
  if (!/^[0-9A-Z]{12}\d{2}$/.test(d) || /^(\d)\1+$/.test(d)) return false
  const verificador = (tamanho: number): number => {
    let soma = 0
    for (let i = 0; i < tamanho; i++) {
      const peso = ((tamanho - 1 - i) % 8) + 2
      soma += (d.charCodeAt(i) - 48) * peso
    }
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  return verificador(12) === Number(d[12]) && verificador(13) === Number(d[13])
}

// CPF/CNPJ vazio, ou CPF (11 dígitos) ou CNPJ (14 caracteres) com os verificadores certos
export function cpfCnpjValido(documento: string): boolean {
  const d = caracteresDocumento(documento)
  return d.length === 0 || cpfValido(d) || cnpjValido(d)
}

// "AAAA-MM-DD" → "DD/MM/AAAA"
export function formatarDia(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Data de hoje no horário local, no formato "AAAA-MM-DD"
export function hoje(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// "AAAA-MM" → "Outubro de 2026"
export function nomeDoMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const nome = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  return `${nome[0].toUpperCase()}${nome.slice(1)} de ${ano}`
}

// Soma (ou subtrai) meses de "AAAA-MM"
export function mudarMes(mes: string, quantos: number): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1 + quantos, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
