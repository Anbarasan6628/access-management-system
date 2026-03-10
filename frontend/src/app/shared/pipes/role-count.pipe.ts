import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'roleCount', standalone: true })
export class RoleCountPipe implements PipeTransform {
  transform(users: any[], role: string): number {
    return users.filter(u => u.role === role).length;
  }
}