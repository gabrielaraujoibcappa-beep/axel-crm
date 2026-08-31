import { ICONES } from './bancos-icones';

export interface BancoConfig {
  cor?: string;
  fundo?: string;
  formato?: 'quadrado' | 'circulo' | 'sem';
  tamanho?: number;
}

const PRESETS: Record<string, { cor: string; fundo: string; formato: 'quadrado' | 'circulo' | 'sem'; tamanho: number }> = {
  nubank: { cor: '#FFFFFF', fundo: '#820AD1', formato: 'quadrado', tamanho: 64 },
  cora: { cor: '#FFFFFF', fundo: '#FE3E6D', formato: 'quadrado', tamanho: 64 },
  itau: { cor: '#FFFFFF', fundo: '#EC7000', formato: 'quadrado', tamanho: 64 },
  inter: { cor: '#FFFFFF', fundo: '#FF7A00', formato: 'quadrado', tamanho: 64 },
  bancodobrasil: { cor: '#FFDD00', fundo: '#003D7A', formato: 'quadrado', tamanho: 64 },
  bradesco: { cor: '#FFFFFF', fundo: '#CC092F', formato: 'quadrado', tamanho: 64 },
  santander: { cor: '#FFFFFF', fundo: '#EC0000', formato: 'quadrado', tamanho: 64 },
  caixa: { cor: '#FFFFFF', fundo: '#0066A1', formato: 'quadrado', tamanho: 64 },
  btg: { cor: '#FFFFFF', fundo: '#001E62', formato: 'quadrado', tamanho: 64 },
  xp: { cor: '#000000', fundo: '#FFFFFF', formato: 'quadrado', tamanho: 64 },
  infinitepay: { cor: '#7DDB13', fundo: '#171527', formato: 'quadrado', tamanho: 64 },
  picpay: { cor: '#FFFFFF', fundo: '#11C76F', formato: 'quadrado', tamanho: 64 },
  mercadopago: { cor: '#009EE3', fundo: '#FFFFFF', formato: 'quadrado', tamanho: 64 },
  pagbank: { cor: '#00A868', fundo: '#FFFFFF', formato: 'quadrado', tamanho: 64 },
  c6: { cor: '#FFFFFF', fundo: '#242424', formato: 'quadrado', tamanho: 64 },
  sicoob: { cor: '#FFFFFF', fundo: '#003641', formato: 'quadrado', tamanho: 64 },
  sicredi: { cor: '#FFFFFF', fundo: '#008542', formato: 'quadrado', tamanho: 64 },
  safra: { cor: '#FFFFFF', fundo: '#141414', formato: 'quadrado', tamanho: 64 },
  stone: { cor: '#FFFFFF', fundo: '#00A868', formato: 'quadrado', tamanho: 64 },
  asaas: { cor: '#FFFFFF', fundo: '#0030B8', formato: 'quadrado', tamanho: 64 }
};

export function svgBanco(nome: string, options: BancoConfig = {}): string {
  const chave = nome.toLowerCase().replace(/[^a-z0-9]/g, '');
  const preset = PRESETS[chave] || { cor: '#FFFFFF', fundo: '#3b82f6', formato: 'quadrado', tamanho: 64 };
  
  const cor = options.cor || preset.cor;
  const fundo = options.fundo || preset.fundo;
  const formato = options.formato || preset.formato;
  const tamanho = options.tamanho || preset.tamanho;

  const rawSvg = (ICONES as Record<string, string>)[chave];
  if (!rawSvg) {
    return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="${fundo}"/>
      <text x="32" y="38" text-anchor="middle" fill="${cor}" font-family="sans-serif" font-size="20" font-weight="bold">${nome.substring(0, 2).toUpperCase()}</text>
    </svg>`;
  }

  const radius = formato === 'circulo' ? '50%' : formato === 'quadrado' ? '18%' : '0%';
  const padding = formato === 'sem' ? '0' : '15%';

  // Inject fill color into paths
  let coloredSvg = rawSvg.replace(/fill="none"/g, '').replace(/<path/g, `<path fill="${cor}"`);
  
  if (formato === 'sem') {
    return `<div style="width:${tamanho}px;height:${tamanho}px;display:inline-flex;align-items:center;justify-content:center;">${coloredSvg}</div>`;
  }

  return `<div style="width:${tamanho}px;height:${tamanho}px;background-color:${fundo};border-radius:${radius};padding:${padding};box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${coloredSvg}</div>`;
}
