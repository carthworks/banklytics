import { Injectable, signal } from '@angular/core';
import { OnboardingData, OnboardingOption, OnboardingStep, BankAccount, BankOption } from '../models/onboarding.model';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly onboardingKey = 'onboarding_completed';
  private readonly onboardingDataKey = 'onboarding_data';

  isCompleted = signal<boolean>(this.checkIfCompleted());
  currentStep = signal<number>(1);

  private defaultSteps: OnboardingStep[] = [
    {
      stepNumber: 1,
      title: 'What stage are you at in your financial journey?',
      type: 'options',
      options: [
        {
          id: 'visualize',
          title: 'I just want to view my spending',
          description: 'No deep analytics',
        },
        {
          id: 'categorize',
          title: 'I want to categorize my spending',
          description: 'Understand where I spend the most',
        },
        {
          id: 'improve',
          title: 'I want to improve my financial life',
          description: 'Analytics, goals and insights',
        },
        {
          id: 'reduce',
          title: 'I want to reduce debt and save',
          description: 'Financial planning',
        },
        {
          id: 'invest',
          title: 'I want to invest my money better',
          description: 'Strategy and growth',
        },
      ],
      info: 'This information helps customize your experience in Banklytics',
    },
    {
      stepNumber: 2,
      title: 'How often would you like to track your finances?',
      type: 'options',
      options: [
        {
          id: 'daily',
          title: 'Daily',
          description: 'Detailed tracking every day',
        },
        {
          id: 'weekly',
          title: 'Weekly',
          description: 'Weekly spending review',
        },
        {
          id: 'monthly',
          title: 'Monthly',
          description: 'Monthly statement analysis',
        },
        {
          id: 'as-needed',
          title: 'Only when needed',
          description: 'No regular notifications',
        },
      ],
      info: 'This helps us send reminders at the right time',
    },
    {
      stepNumber: 3,
      title: 'Let\'s set up your first bank account',
      type: 'bank-account',
      banks: [
        { id: 'sbi', name: 'State Bank of India' },
        { id: 'hdfc', name: 'HDFC Bank' },
        { id: 'icici', name: 'ICICI Bank' },
        { id: 'axis', name: 'Axis Bank' },
        { id: 'kotak', name: 'Kotak Mahindra Bank' },
        { id: 'pnb', name: 'Punjab National Bank' },
        { id: 'bob', name: 'Bank of Baroda' },
        { id: 'canara', name: 'Canara Bank' },
        { id: 'union', name: 'Union Bank of India' },
        { id: 'indusind', name: 'IndusInd Bank' },
        { id: 'idbi', name: 'IDBI Bank' },
        { id: 'yes', name: 'Yes Bank' },
        { id: 'idfc', name: 'IDFC First Bank' },
        { id: 'rbl', name: 'RBL Bank' },
        { id: 'federal', name: 'Federal Bank' },
        { id: 'bandhan', name: 'Bandhan Bank' },
        { id: 'paytm', name: 'Paytm Payments Bank' },
        { id: 'airtel', name: 'Airtel Payments Bank' },
      ],
      info: 'You can add more accounts later',
    },
    {
      stepNumber: 4,
      title: 'Do you have any specific financial goals?',
      type: 'options',
      options: [
        {
          id: 'emergency-fund',
          title: 'Save for emergencies',
          description: 'Create an emergency fund',
        },
        {
          id: 'reduce-debts',
          title: 'Reduce debt',
          description: 'Pay off existing debts',
        },
        {
          id: 'invest-more',
          title: 'Invest more',
          description: 'Increase investments',
        },
        {
          id: 'big-purchase',
          title: 'Plan a big purchase',
          description: 'House, car, travel, etc.',
        },
        {
          id: 'no-goals',
          title: 'I don\'t have defined goals yet',
          description: 'I will define later',
        },
      ],
      info: 'This information helps us suggest relevant content',
    },
  ];

  getOnboardingData(): OnboardingData {
    const saved = localStorage.getItem(this.onboardingDataKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Valida se os dados salvos têm a mesma estrutura
        if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length === this.defaultSteps.length) {
          // Garante que currentStep não ultrapasse totalSteps e seja válido
          if (parsed.currentStep > parsed.totalSteps || parsed.currentStep < 1) {
            parsed.currentStep = 1;
          }
          // Garante que totalSteps está correto
          parsed.totalSteps = this.defaultSteps.length;
          // Atualiza os steps caso a estrutura tenha mudado
          parsed.steps = this.defaultSteps;
          return parsed;
        } else {
          // Se a estrutura não corresponder, reseta
          this.resetOnboardingData();
        }
      } catch (e) {
        // Se houver erro ao parsear, reseta
        this.resetOnboardingData();
      }
    }

    return {
      currentStep: 1,
      totalSteps: this.defaultSteps.length,
      steps: this.defaultSteps,
      bankAccounts: [],
    };
  }

  private resetOnboardingData(): void {
    localStorage.removeItem(this.onboardingDataKey);
    this.currentStep.set(1);
  }

  saveOnboardingData(data: OnboardingData): void {
    localStorage.setItem(this.onboardingDataKey, JSON.stringify(data));
    this.currentStep.set(data.currentStep);
  }

  selectOption(stepNumber: number, optionId: string): void {
    const data = this.getOnboardingData();
    const step = data.steps.find((s) => s.stepNumber === stepNumber);
    if (step && step.options) {
      step.options.forEach((opt) => {
        opt.selected = opt.id === optionId;
      });
      this.saveOnboardingData(data);
    }
  }

  getSelectedOption(stepNumber: number): OnboardingOption | null {
    const data = this.getOnboardingData();
    const step = data.steps.find((s) => s.stepNumber === stepNumber);
    if (!step || !step.options) {
      return null;
    }
    return step.options.find((opt) => opt.selected) || null;
  }

  nextStep(): void {
    const data = this.getOnboardingData();
    if (data.currentStep < data.totalSteps) {
      data.currentStep++;
      this.saveOnboardingData(data);
    }
  }

  previousStep(): void {
    const data = this.getOnboardingData();
    if (data.currentStep > 1) {
      data.currentStep--;
      this.saveOnboardingData(data);
    }
  }

  completeOnboarding(): void {
    localStorage.setItem(this.onboardingKey, 'true');
    this.isCompleted.set(true);
  }

  checkIfCompleted(): boolean {
    return localStorage.getItem(this.onboardingKey) === 'true';
  }

  resetOnboarding(): void {
    localStorage.removeItem(this.onboardingKey);
    localStorage.removeItem(this.onboardingDataKey);
    this.isCompleted.set(false);
    this.currentStep.set(1);
  }

  canProceed(stepNumber: number): boolean {
    const data = this.getOnboardingData();
    const step = data.steps.find((s) => s.stepNumber === stepNumber);

    if (!step) return false;

    if (step.type === 'bank-account') {
      return !!(data.bankAccounts && data.bankAccounts.length > 0);
    }

    const selected = this.getSelectedOption(stepNumber);
    return selected !== null;
  }

  addBankAccount(bankAccount: BankAccount): void {
    const data = this.getOnboardingData();
    if (!data.bankAccounts) {
      data.bankAccounts = [];
    }
    data.bankAccounts.push(bankAccount);
    this.saveOnboardingData(data);
  }

  removeBankAccount(index: number): void {
    const data = this.getOnboardingData();
    if (data.bankAccounts) {
      data.bankAccounts.splice(index, 1);
      this.saveOnboardingData(data);
    }
  }

  getBankAccounts(): BankAccount[] {
    const data = this.getOnboardingData();
    return data.bankAccounts || [];
  }

  getAvailableBanks(): BankOption[] {
    const bankStep = this.defaultSteps.find(step => step.type === 'bank-account');
    return bankStep?.banks || [
      { id: 'sbi', name: 'State Bank of India' },
      { id: 'hdfc', name: 'HDFC Bank' },
      { id: 'icici', name: 'ICICI Bank' },
      { id: 'axis', name: 'Axis Bank' },
      { id: 'kotak', name: 'Kotak Mahindra Bank' },
      { id: 'pnb', name: 'Punjab National Bank' },
      { id: 'bob', name: 'Bank of Baroda' },
      { id: 'canara', name: 'Canara Bank' },
      { id: 'union', name: 'Union Bank of India' },
      { id: 'indusind', name: 'IndusInd Bank' },
      { id: 'idbi', name: 'IDBI Bank' },
      { id: 'yes', name: 'Yes Bank' },
      { id: 'idfc', name: 'IDFC First Bank' },
      { id: 'rbl', name: 'RBL Bank' },
      { id: 'federal', name: 'Federal Bank' },
      { id: 'bandhan', name: 'Bandhan Bank' },
      { id: 'paytm', name: 'Paytm Payments Bank' },
      { id: 'airtel', name: 'Airtel Payments Bank' },
    ];
  }
}

