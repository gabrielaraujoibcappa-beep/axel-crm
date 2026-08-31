import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {
  googleConnected = false;
  googleEmail = '';
  loading = false;
  events: any[] = [];
  contacts: any[] = [];

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.checkGoogleStatus();
  }

  checkGoogleStatus(): void {
    this.http.get<any>(`${environment.apiUrl}/integrations/google/status`).subscribe({
      next: (res) => {
        this.googleConnected = res.connected;
        this.googleEmail = res.email;
        if (this.googleConnected) {
          this.loadCalendarEvents();
          this.loadGoogleContacts();
        }
      }
    });
  }

  connectGoogle(): void {
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/integrations/google/connect`, {}).subscribe({
      next: (res) => {
        window.location.href = res.authorizationUrl;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao conectar conta Google', 'OK', { duration: 3000 });
      }
    });
  }

  disconnectGoogle(): void {
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/integrations/google/disconnect`, {}).subscribe({
      next: () => {
        this.loading = false;
        this.googleConnected = false;
        this.googleEmail = '';
        this.events = [];
        this.snackBar.open('Conta Google desconectada.', 'OK', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao desconectar conta Google', 'OK', { duration: 3000 });
      }
    });
  }

  loadCalendarEvents(): void {
    this.http.get<any>(`${environment.apiUrl}/integrations/google/calendar`).subscribe({
      next: (res) => {
        this.events = Array.isArray(res) ? res : (res.items || []);
      }
    });
  }

  loadGoogleContacts(): void {
    this.http.get<any>(`${environment.apiUrl}/integrations/google/contacts`).subscribe({
      next: (res) => {
        this.contacts = Array.isArray(res) ? res : (res.connections || []);
      }
    });
  }
}
