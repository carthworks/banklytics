import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { UiService } from '@app/core/services/ui.service';
import { TransactionService } from '@app/core/services/transaction.service';

interface OnboardingData {
  goals: string[];
  frequency: string;
  bankAccount: {
    bankId: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
  } | null;
  statementFile: File | null;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  private onboardingService = inject(OnboardingService);
  private uiService = inject(UiService);
  private router = inject(Router);
  private transactionService = inject(TransactionService);

  // State
  currentStep = signal(1);
  totalSteps = 4;

  // Form data
  formData = signal<OnboardingData>({
    goals: [],
    frequency: '',
    bankAccount: null,
    statementFile: null,
  });

  // Options
  steps = [
    {
      id: 1,
      title: 'Financial Goals',
      options: [
        { id: 'track-spending', label: 'Track Spending', icon: '💰', description: 'Monitor your daily expenses' },
        { id: 'budget-planning', label: 'Budget Planning', icon: '📊', description: 'Create and manage budgets' },
        { id: 'manage-debt', label: 'Manage Debt', icon: '💳', description: 'Track and reduce debt' },
        { id: 'save-money', label: 'Save Money', icon: '🎯', description: 'Build savings goals' },
        { id: 'investment-tracking', label: 'Investment Tracking', icon: '📈', description: 'Monitor investments' },
        { id: 'major-purchase', label: 'Plan Major Purchase', icon: '🏠', description: 'Save for big expenses' },
      ],
    },
    {
      id: 2,
      title: 'Transaction Frequency',
      options: [
        { id: 'daily', label: 'Daily', icon: '📅', description: '10+ transactions per day' },
        { id: 'weekly', label: 'Weekly', icon: '📆', description: '3-10 transactions per week' },
        { id: 'monthly', label: 'Monthly', icon: '🗓️', description: '1-5 transactions per month' },
        { id: 'occasional', label: 'Occasional', icon: '📋', description: 'Less than monthly' },
      ],
    },
  ];
  banks = this.onboardingService.getAvailableBanks();

  // File upload state
  uploadedFileName = signal<string>('');
  uploadProgress = signal<number>(0);
  isUploading = signal(false);

  // Validation
  canProceed = signal(false);

  constructor() {
    this.updateValidation();
  }

  // Navigation
  nextStep(): void {
    if (!this.canProceed()) return;

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(step => step + 1);
      this.updateValidation();
      this.scrollToTop();
    } else {
      this.completeOnboarding();
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
      this.updateValidation();
      this.scrollToTop();
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep() || this.isStepAccessible(step)) {
      this.currentStep.set(step);
      this.updateValidation();
      this.scrollToTop();
    }
  }

  private isStepAccessible(step: number): boolean {
    // Can only access completed or current step
    return step <= this.currentStep();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Step 1: Goals
  toggleGoal(goalId: string): void {
    const goals = [...this.formData().goals];
    const index = goals.indexOf(goalId);

    if (index > -1) {
      goals.splice(index, 1);
    } else {
      goals.push(goalId);
    }

    this.formData.update(data => ({ ...data, goals }));
    this.updateValidation();
  }

  isGoalSelected(goalId: string): boolean {
    return this.formData().goals.includes(goalId);
  }

  // Step 2: Frequency
  selectFrequency(frequency: string): void {
    this.formData.update(data => ({ ...data, frequency }));
    this.updateValidation();
  }

  // Step 3: Bank Account
  bankId = signal('');
  accountName = signal('');
  accountNumber = signal('');
  accountType = signal('savings');

  selectBank(bankId: string): void {
    this.bankId.set(bankId);
    const bank = this.banks.find(b => b.id === bankId);
    if (bank) {
      this.formData.update(data => ({
        ...data,
        bankAccount: {
          bankId: bank.id,
          bankName: bank.name,
          accountName: this.accountName(),
          accountNumber: this.accountNumber(),
          accountType: this.accountType(),
        },
      }));
    }
    this.updateValidation();
  }

  updateBankAccount(): void {
    if (this.bankId()) {
      const bank = this.banks.find(b => b.id === this.bankId());
      if (bank) {
        this.formData.update(data => ({
          ...data,
          bankAccount: {
            bankId: bank.id,
            bankName: bank.name,
            accountName: this.accountName(),
            accountNumber: this.accountNumber(),
            accountType: this.accountType(),
          },
        }));
      }
    }
    this.updateValidation();
  }

  // Step 4: Upload Statement
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const validTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(file.type)) {
        this.uiService.toast.error('Invalid File', 'Please upload PDF, CSV, or Excel files only');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uiService.toast.error('File Too Large', 'Maximum file size is 10MB');
        return;
      }

      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.uploadedFileName.set(file.name);

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress.update(progress => {
        const newProgress = progress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          this.isUploading.set(false);
          this.formData.update(data => ({ ...data, statementFile: file }));
          this.updateValidation();
          this.uiService.toast.success('Upload Complete', `${file.name} uploaded successfully`);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  }

  removeFile(): void {
    this.formData.update(data => ({ ...data, statementFile: null }));
    this.uploadedFileName.set('');
    this.uploadProgress.set(0);
    this.updateValidation();
  }

  downloadSample(): void {
    // Create sample CSV content
    const sampleContent = this.generateSampleStatement();
    const blob = new Blob([sampleContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_bank_statement.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.uiService.toast.success('Downloaded', 'Sample statement downloaded');
  }

  private generateSampleStatement(): string {
    return `Date,Description,Amount,Type,Category,Merchant
2026-01-15,Salary - January 2026,85000,credit,Salary,Company Inc.
2026-01-16,Grocery Shopping,3500,debit,Groceries,BigBasket
2026-01-17,Electricity Bill,1200,debit,Utilities,BESCOM
2026-01-18,Dinner at Restaurant,1800,debit,Dining,The Spice Route
2026-01-19,Uber Rides,450,debit,Transportation,Uber
2026-01-20,Netflix Subscription,649,debit,Subscriptions,Netflix
2026-01-20,Freelance Payment,15000,credit,Freelance,Client XYZ
2026-01-21,Medical Checkup,2500,debit,Healthcare,Apollo Hospital`;
  }

  // Validation
  private updateValidation(): void {
    let isValid = false;

    switch (this.currentStep()) {
      case 1:
        isValid = this.formData().goals.length > 0;
        break;
      case 2:
        isValid = !!this.formData().frequency;
        break;
      case 3:
        isValid = !!this.formData().bankAccount?.bankId &&
          !!this.accountName() &&
          !!this.accountNumber();
        break;
      case 4:
        isValid = !!this.formData().statementFile;
        break;
    }

    this.canProceed.set(isValid);
  }

  // Complete onboarding
  private async completeOnboarding(): Promise<void> {
    const data = this.formData();

    // Save bank account to onboarding service
    if (data.bankAccount) {
      this.onboardingService.addBankAccount({
        bankId: data.bankAccount.bankId,
        bankName: data.bankAccount.bankName,
        accountName: data.bankAccount.accountName,
      });
    }

    // Process uploaded statement file
    if (data.statementFile) {
      await this.processStatementFile(data.statementFile);
    }

    this.onboardingService.completeOnboarding();

    this.uiService.toast.success('Welcome to Banklytics!', 'Your account is ready. Explore your financial insights.');
    this.router.navigate(['/home']);
  }

  // Process uploaded statement file
  private async processStatementFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        this.uiService.toast.error('Invalid File', 'The file appears to be empty');
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      let successCount = 0;

      for (const line of dataLines) {
        const columns = line.split(',').map(col => col.trim());

        if (columns.length < 4) continue;

        try {
          const [dateStr, description, amountStr, type, category = 'Other', merchant = ''] = columns;

          // Parse date
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) continue;

          // Parse amount
          const amount = Math.abs(parseFloat(amountStr.replace(/[^\d.-]/g, '')));
          if (isNaN(amount)) continue;

          // Create transaction
          this.transactionService.add({
            date,
            description: description || 'Transaction',
            amount,
            type: type.toLowerCase() === 'credit' ? 'credit' : 'debit',
            category: this.transactionService.getCategories()[0],
            merchant: merchant || undefined,
            status: 'completed',
            accountId: this.formData().bankAccount?.bankId || 'default',
          });

          successCount++;
        } catch (error) {
          console.error('Error parsing line:', line, error);
        }
      }

      if (successCount > 0) {
        this.uiService.toast.success(
          'Statement Processed',
          `Successfully imported ${successCount} transactions from your statement`
        );
      } else {
        this.uiService.toast.warn(
          'No Transactions Found',
          'Could not parse any transactions from the file.'
        );
      }
    } catch (error) {
      console.error('Error processing file:', error);
      this.uiService.toast.error(
        'Processing Failed',
        'Could not process the file. Please check the format.'
      );
    }
  }

  // Progress calculation
  getProgress(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }
}
