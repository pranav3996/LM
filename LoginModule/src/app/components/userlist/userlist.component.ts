import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css'],
})
export class UserlistComponent implements OnInit {
  users: any[] = [];
  selectedUsers: any[] = [];
  allSelected: boolean = false;
  errorMessage: string = '';
  noDataFound: boolean = false;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  displayedColumns: string[] = [
    'srNo',
    'id',
    'firstName',
    'lastName',
    'email',
    'role',
    'city',
    'enabled',
    'action',
  ];
  constructor(
    private readonly adminService: AdminService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe(
      (response) => {
        if (response && response.statusCode === 200 && response.usersList) {
          console.log(response);
          this.users = response.usersList;
          this.noDataFound = false;
        } else {
          this.showError('No users found.');
          this.noDataFound = true;
        }
      },
      (error) => {
        this.showError(error.message);
        this.noDataFound = true;
      }
    );
  }
  getUserById(userId: string): void {
    this.adminService.getUsersById(userId).subscribe(
      (response) => {
        console.log('Full API response:', response);

        if (response && response.users) {
          if (Array.isArray(response.users)) {
            this.users = response.users;
          } else {
            this.users = [response.users];
          }
          this.noDataFound = this.users.length === 0;
        } else {
          this.users = [];
          this.noDataFound = true;
          this.errorMessage = response.message; // Capture the message from the response
        }

        console.log('search data:', this.users);
      },
      (error) => {
        console.error('Error fetching user:', error);
        this.users = [];
        this.noDataFound = true;
        this.errorMessage = error.error?.message || 'An error occurred'; // Capture the error message from the API
      }
    );
  }

  searchUser(userId: string): void {
    const trimmedId = userId.trim();

    if (trimmedId) {
      this.getUserById(trimmedId);
    } else {
      this.loadUsers();
    }
  }

   // Method to handle "Select All" text click
   toggleSelectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedUsers = [...this.users]; // Select all users
    } else {
      this.selectedUsers = []; // Deselect all users
    }
  }

  // Method to check if a user is selected
  isSelected(user: any): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  // Method to handle individual checkbox changes
  onCheckboxChange(event: any, user: any) {
    if (event.target.checked) {
      this.selectedUsers.push(user);
    } else {
      const index = this.selectedUsers.findIndex((u) => u.id === user.id);
      if (index > -1) {
        this.selectedUsers.splice(index, 1);
      }
      // this.allSelected = false; // Uncheck "Select All" if any item is unchecked
    }
      // Update the allSelected flag based on the current selection
      this.allSelected = this.selectedUsers.length === this.users.length;
  }

  // Method to delete selected users
  deleteSelectedUsers() {
    if (this.selectedUsers.length > 0) {
      this.selectedUsers.forEach((user) => {
        this.deleteUser(user.id);
      });
      this.selectedUsers = [];
      this.allSelected = false;
    }
  }


  deleteUser(userId: string): void {
    const confirmDelete = confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      this.adminService.deleteUser(userId).subscribe(
        () => {
          this.loadUsers();
        },
        (error) => {
          this.showError(error.message);
        }
      );
    }
  }

  navigateToUpdate(userId: string): void {
    this.router.navigate(['/update', userId]);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
  // Download File's
  downloadCSV() {
    const csvData = this.convertToCSV(this.users);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  convertToCSV(data: any[]): string {
    const header = this.displayedColumns
      .filter((column) => column !== 'action') // Exclude 'action' column from CSV
      .map((column) => column.toUpperCase());

    const rows = data.map((row, index) => {
      const rowData = this.displayedColumns
        .filter((column) => column !== 'action') // Exclude 'action' column from CSV
        .map((col) => {
          if (col === 'srNo') {
            return index + 1; // Auto-incremented Sr No
          }
          return row[col];
        });
      return rowData;
    });

    return Papa.unparse([header, ...rows]);
  }

  downloadExcel() {
    // Filter the users data to include only the specified columns
    const filteredData = this.users.map((user, index) => {
      // Define the filteredUser object with a dynamic key type
      const filteredUser: { [key: string]: any } = {};

      this.displayedColumns.forEach((col) => {
        if (col === 'srNo') {
          filteredUser[col] = index + 1; // Add an auto-incremented ID column
        } else if (col !== 'action') {
          filteredUser[col] = user[col];
        }
      });

      return filteredUser;
    });

    // Create a worksheet with the filtered data
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Users');

    // Write the workbook to a binary array
    const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

    // Create a blob from the binary array and trigger the download
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fileName = 'users.xlsx';

    // Download logic for different browsers
    const navigator = window.navigator as any;
    if (navigator.msSaveOrOpenBlob) {
      // For IE
      navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }

  //Upload File's
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      this.uploadFile(selectedFile);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  uploadFile(file: File): void {
    if (file) {
      this.adminService.uploadFile(file).subscribe(
        (response) => {
          console.log('Upload response:', response); // Log response for debugging

          if (response?.status === 'progress') {
            console.log(`Upload Progress: ${response.message}%`);
          } else if (response?.status === 'success') {
            console.log('Success:', response.message);
            Swal.fire('Success', response.message, 'success');
            this.loadUsers();
          } else if (response?.status === 'error') {
            console.log('Error:', response);
            Swal.fire({
              icon: 'error',
              title: `Error ${response.errorCode || 'Unknown'}`,
              text: response.message || 'An error occurred during the upload.',
              // footer: response.details ? `Details: ${response.details.description}` : undefined
            });
          } else {
            console.log('Unexpected Response:', response);
          }
        },
        (error) => {
          console.error('Subscription Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Upload Error',
            text: error.message || 'An error occurred during file upload.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No file selected.',
      });
    }
  }
}
