import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectUsers, selectUserError } from 'src/app/store/user/user.selectors';

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, RouterLink, AsyncPipe],
})
export class UserlistComponent implements OnInit {
  users$: Observable<any[]> = this.store.select(selectUsers);
  error$: Observable<string | null> = this.store.select(selectUserError);

  users: any[] = [];
  selectedUsers: any[] = [];
  allSelected = false;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  displayedColumns: string[] = ['srNo', 'id', 'firstName', 'lastName', 'email', 'role', 'city', 'enabled', 'action'];

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
    this.users$.subscribe((users) => (this.users = users));
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
    this.allSelected = !this.allSelected;
    this.selectedUsers = this.allSelected ? [...this.users] : [];
  }

  isSelected(user: any): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  onCheckboxChange(event: any, user: any): void {
    if (event.target.checked) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    }
    this.allSelected = this.selectedUsers.length === this.users.length;
  }

  deleteSelectedUsers(): void {
    if (this.selectedUsers.length > 0) {
      this.selectedUsers.forEach((user) => this.deleteUser(user.id));
      this.selectedUsers = [];
      this.allSelected = false;
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
    const csvData = this.convertToCSV(this.users);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(data: any[]): string {
    const header = this.displayedColumns.filter((c) => c !== 'action').map((c) => c.toUpperCase());
    const rows = data.map((row, i) =>
      this.displayedColumns.filter((c) => c !== 'action').map((col) => (col === 'srNo' ? i + 1 : row[col]))
    );
    return Papa.unparse([header, ...rows]);
  }

  downloadExcel(): void {
    const filteredData = this.users.map((user, i) => {
      const obj: { [key: string]: any } = {};
      this.displayedColumns.forEach((col) => {
        if (col === 'srNo') obj[col] = i + 1;
        else if (col !== 'action') obj[col] = user[col];
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
    this.fileInput.nativeElement.click();
  }
}
