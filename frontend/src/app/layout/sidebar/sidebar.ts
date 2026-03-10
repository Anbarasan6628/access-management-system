import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { filter } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatRippleModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  @Input()  isOpen       = true;
  @Output() closeSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router      = inject(Router);

  currentRoute = '';
  currentUser  = this.authService.getCurrentUser();

  menuItems: MenuItem[] = [
    { label: 'Dashboard',      icon: 'dashboard',      route: '/dashboard',    roles: ['Employee', 'Reviewer', 'Admin'] },
    { label: 'My Requests',    icon: 'assignment',     route: '/requests',     roles: ['Employee', 'Reviewer', 'Admin'] },
    { label: 'Review Queue',   icon: 'rate_review',    route: '/review',       roles: ['Reviewer', 'Admin'] },
    { label: 'All Requests',   icon: 'folder_open',    route: '/all-requests', roles: ['Admin'] },
    { label: 'Create Request', icon: 'add_circle',     route: '/requests/create', roles: ['Employee', 'Reviewer', 'Admin'] },
    { label: 'User Management',icon: 'manage_accounts',route: '/users',        roles: ['Admin'] },
  ];

  ngOnInit() {
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentRoute = e.url);
  }

  get filteredMenu(): MenuItem[] {
    const role = this.authService.getRole();
    return this.menuItems.filter(item => item.roles.includes(role));
  }

  isActive(route: string): boolean {
    return this.currentRoute === route ||
           this.currentRoute.startsWith(route + '/');
  }

  navigate(route: string) {
    this.router.navigate([route]);
    if (window.innerWidth < 768) {
      this.closeSidebar.emit();
    }
  }

  logout() {
    this.authService.logout();
  }
}