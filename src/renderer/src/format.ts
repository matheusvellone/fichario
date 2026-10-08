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
