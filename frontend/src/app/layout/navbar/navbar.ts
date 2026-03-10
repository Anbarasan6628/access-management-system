import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router      = inject(Router);

  currentUser = this.authService.getCurrentUser();

  get userInitials(): string {
    return this.currentUser?.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? 'U';
  }

  get roleColor(): string {
    switch(this.currentUser?.role) {
      case 'Admin':    return '#E74C3C';
      case 'Reviewer': return '#F39C12';
      default:         return '#27AE60';
    }
  }

  logout() {
    this.authService.logout();
  }

  goToProfile() {
    // Future feature
  }
}