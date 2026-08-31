import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { svgBanco } from './bancos-brasil-core';

@Component({
  selector: 'app-bank-icon',
  standalone: true,
  template: `
    @if (svgContent) {
      <span [innerHTML]="svgContent" class="bank-icon-wrapper"></span>
    }
  `,
  styles: [`
    .bank-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      line-height: 1;
    }
  `]
})
export class BankIconComponent implements OnChanges {
  @Input() name = '';
  @Input() size = 32;
  @Input() format: 'quadrado' | 'circulo' | 'sem' = 'quadrado';

  svgContent: SafeHtml | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.render();
  }

  private render(): void {
    if (!this.name) {
      this.svgContent = null;
      return;
    }

    const key = this.normalizeBankName(this.name);
    try {
      const svg = svgBanco(key, {
        formato: this.format,
        tamanho: this.size
      });
      this.svgContent = svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : null;
    } catch {
      this.svgContent = null;
    }
  }

  private normalizeBankName(name: string): string {
    const clean = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean.includes('brasil')) return 'bancodobrasil';
    if (clean.includes('itau')) return 'itau';
    if (clean.includes('bradesco')) return 'bradesco';
    if (clean.includes('santander')) return 'santander';
    if (clean.includes('caixa')) return 'caixa';
    if (clean.includes('inter')) return 'inter';
    if (clean.includes('nubank')) return 'nubank';
    if (clean.includes('c6')) return 'c6';
    if (clean.includes('btg')) return 'btg';
    if (clean.includes('cora')) return 'cora';
    if (clean.includes('sicoob')) return 'sicoob';
    if (clean.includes('sicredi')) return 'sicredi';
    if (clean.includes('safra')) return 'safra';
    if (clean.includes('mercado') || clean.includes('pago')) return 'mercadopago';
    if (clean.includes('pagbank') || clean.includes('pagseguro')) return 'pagbank';
    if (clean.includes('picpay')) return 'picpay';
    if (clean.includes('asaas')) return 'asaas';
    if (clean.includes('stone')) return 'stone';
    if (clean.includes('infinite')) return 'infinitepay';
    if (clean.includes('xp')) return 'xp';
    return clean.replace(/[^a-z0-9]/g, '');
  }
}
