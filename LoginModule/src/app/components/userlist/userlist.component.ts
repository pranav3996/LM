import { Component, ElementRef, OnInit, ChangeDetectionStrategy, inject, viewChild, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserActions } from 'src/app/store/user/user.actions';
import { AdminService } from 'src/app/service/admin.service';
import { UserRecord } from 'src/app/models/api.models';

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
})
export class UserlistComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private adminService = inject(AdminService);

  // Local UI state only — not duplicating server data
  readonly users = toSignal(this.adminService.users$, { initialValue: [] as UserRecord[] });
  readonly error = toSignal(this.adminService.error$, { initialValue: null });
  readonly loading = toSignal(this.adminService.loading$, { initialValue: false });
  readonly uploadProgress = toSignal(this.adminService.uploadProgress$, { initialValue: 0 });

  selectedUsers = signal([] as UserRecord[]);
  allSelected = signal(false);

  readonly fileInput = viewChild.required<ElementRef>('fileInput');
  readonly displayedColumns = ['srNo', 'id', 'firstName', 'lastName', 'email', 'role', 'city', 'enabled', 'action'];


  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
  }

  searchUser(userId: string): void {
    const trimmedId = userId.trim();
    if (trimmedId) {
      this.store.dispatch(UserActions.loadUserById({ userId: trimmedId }));
    } else {
      this.store.dispatch(UserActions.loadUsers());
    }
  }

  toggleSelectAll(): void {
    this.allSelected.update(v => !v);
    this.selectedUsers.set(this.allSelected() ? [...this.users()] : []);
  }

  isSelected(user: UserRecord): boolean {
    return this.selectedUsers().some((u) => u.id === user.id);
  }

  onCheckboxChange(event: Event, user: UserRecord): void {
    if ((event.target as HTMLInputElement).checked) {
      this.selectedUsers.update(users => [...users, user]);
    } else {
      this.selectedUsers.update(users => users.filter((u) => u.id !== user.id));
    }
    this.allSelected.set(this.selectedUsers().length === this.users().length);
  }

  deleteSelectedUsers(): void {
    if (this.selectedUsers().length > 0) {
      this.selectedUsers().forEach((user) => this.deleteUser(user.id));
      this.selectedUsers.set([]);
      this.allSelected.set(false);
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.store.dispatch(UserActions.deleteUser({ userId }));
    }
  }

  navigateToUpdate(userId: string): void {
    this.router.navigate(['/update', userId]);
  }

  downloadCSV(): void {
    const csvData = this.convertToCSV(this.users());
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(data: UserRecord[]): string {
    const cols = this.displayedColumns.filter((c) => c !== 'action');
    const header = cols.map((c) => c.toUpperCase());
    const rows = data.map((row, i) =>
      cols.map((col) => (col === 'srNo' ? i + 1 : (row as any)[col]))
    );
    return Papa.unparse([header, ...rows]);
  }

  downloadExcel(): void {
    const filteredData = this.users().map((user, i) => {
      const obj: Record<string, unknown> = {};
      this.displayedColumns.forEach((col) => {
        if (col === 'srNo') obj[col] = i + 1;
        else if (col !== 'action') obj[col] = (user as any)[col];
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.store.dispatch(UserActions.uploadFile({ file: input.files[0] }));
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No file selected.' });
    }
  }

  triggerFileInput(): void {
    this.fileInput().nativeElement.click();
  }
}
