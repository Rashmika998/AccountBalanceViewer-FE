import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { BalanceService } from '../services/balance.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-balance-upload',
  templateUrl: './balance-upload.component.html',
  styleUrls: ['./balance-upload.component.scss'],
})
export class BalanceUploadComponent implements OnInit {
  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private balanceService: BalanceService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.getUserRole() !== 'Admin') {
      this.authService.clearAuthData();
      this.router.navigate(['/admin-login']);
    }

    if (this.authService.isTokenExpired()) {
      this.authService.clearAuthData();
      this.router.navigate(['/user-login']);
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (
        fileExtension === 'xlsx' ||
        fileExtension === 'xls' ||
        fileExtension === 'txt'
      ) {
        this.selectedFile = file;
        this.errorMessage = '';
      } else {
        this.errorMessage =
          'Invalid file type. Please upload an Excel or text file.';
        this.selectedFile = null;
      }
    }
  }

  uploadFile(): void {
    if (this.authService.isTokenExpired()) {
      this.router.navigate(['/user-login']);
    }
    if (this.selectedFile) {
      const fileExtension = this.selectedFile.name
        .split('.')
        .pop()
        ?.toLowerCase();
      if (
        fileExtension === 'xlsx' ||
        fileExtension === 'xls' ||
        fileExtension === 'csv'
      ) {
        this.readExcelFile(this.selectedFile);
      } else if (fileExtension === 'txt') {
        this.readTextFile(this.selectedFile);
      }
    }
  }

  readExcelFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const formattedData = jsonData.map((row: any) => {
        return Object.values(row).map((cell: any) => cell.toString().trim());
      });

      this.processData(formattedData);
    };
    reader.readAsArrayBuffer(file);
  }

  readTextFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      const textData = event.target?.result as string;
      const rows = textData
        .split('\n')
        .map((row) => row.split('\t').map((cell) => cell.trim()));

      this.processData(rows);
    };
    reader.readAsText(file);
  }

  processData(data: any[]): void {
    const parsedData: { [key: string]: number } = {};
    data.forEach((row) => {
      if (row.length >= 2) {
        const [label, value] = row;
        const key = label
          .trim()
          .toLowerCase()
          .replace(/[^a-z]/g, '');
        const keyMapping: { [key: string]: string } = {
          canteen: 'canteen',
          ceoscar: 'ceoCarExpenses',
          marketing: 'marketing',
          parkingfines: 'parkingFines',
          rd: 'rnD',
          'ceo’scar': 'ceoCarExpenses',
        };

        const mappedKey = keyMapping[key];
        if (mappedKey) {
          parsedData[mappedKey] = parseFloat(value.replace(/[^\d.-]/g, ''));
        }
      }
    });

    this.balanceService.uploadBalance(parsedData).subscribe({
      next: () => {
        this.successMessage = 'File uploaded and processed successfully!';
        this.router.navigate(['/account-balance']);
      },
      error: (error) => {
        console.error('Error uploading balance:', error);
        this.errorMessage = 'An error occurred while uploading the balance.';
      },
    });
  }
}
