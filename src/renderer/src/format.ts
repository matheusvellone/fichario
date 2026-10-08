// Datas vêm do SQLite como "AAAA-MM-DD HH:MM:SS" (horário local)
export function formatarData(valor: string): string {
  const [data, hora = ''] = valor.split(' ')
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano} às ${hora.slice(0, 5)}`
}
