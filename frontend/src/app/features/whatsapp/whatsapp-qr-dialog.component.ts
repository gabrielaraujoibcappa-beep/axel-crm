import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface WhatsappQrDialogData {
  /** Imagem do QR em data URL (`data:image/png;base64,...`) devolvida pelo gateway. */
  qrcode: string;
}

/**
 * Exibe o QR code de pareamento do WhatsApp em modal.
 *
 * O componente é apresentacional: quem controla o ciclo de vida é o inbox, que
 * fecha o modal assim que o status do gateway vira CONNECTED.
 */
@Component({
  selector: 'app-whatsapp-qr-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './whatsapp-qr-dialog.component.html',
  styleUrl: './whatsapp-qr-dialog.component.scss',
})
export class WhatsappQrDialogComponent {
  /** Vira true se o navegador não conseguir decodificar a imagem recebida. */
  imageFailed = false;

  constructor(
    private dialogRef: MatDialogRef<WhatsappQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WhatsappQrDialogData,
  ) {}

  /** Um QR só é renderizável como imagem se vier em data URL. */
  get hasImage(): boolean {
    return !this.imageFailed && this.data.qrcode.startsWith('data:image');
  }

  onImageError(): void {
    this.imageFailed = true;
  }

  close(): void {
    this.dialogRef.close();
  }
}
