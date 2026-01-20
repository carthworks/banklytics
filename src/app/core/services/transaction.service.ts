import { Injectable, signal, computed } from '@angular/core';
import { Transaction, TransactionFilters, DEFAULT_CATEGORIES, Category } from '@app/models/transaction.model';

@Injectable({
    providedIn: 'root',
})
export class TransactionService {
    private transactions = signal<Transaction[]>([]);
    private categories = signal<Category[]>(DEFAULT_CATEGORIES);

    // Public readonly signals
    allTransactions = this.transactions.asReadonly();
    allCategories = this.categories.asReadonly();

    // Computed values
    totalIncome = computed(() =>
        this.transactions()
            .filter(t => t.type === 'credit' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    totalExpenses = computed(() =>
        this.transactions()
            .filter(t => t.type === 'debit' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    balance = computed(() => this.totalIncome() - this.totalExpenses());

    constructor() {
        this.loadTransactions();
        this.generateMockData();
    }

    private loadTransactions(): void {
        const saved = localStorage.getItem('transactions');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Convert date strings back to Date objects
                const transactions = parsed.map((t: any) => ({
                    ...t,
                    date: new Date(t.date),
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt),
                }));
                this.transactions.set(transactions);
            } catch (e) {
                console.error('Error loading transactions:', e);
            }
        }
    }

    private saveTransactions(): void {
        localStorage.setItem('transactions', JSON.stringify(this.transactions()));
    }

    getAll(): Transaction[] {
        return this.transactions();
    }

    getById(id: string): Transaction | undefined {
        return this.transactions().find(t => t.id === id);
    }

    getFiltered(filters: TransactionFilters): Transaction[] {
        let filtered = this.transactions();

        if (filters.dateRange) {
            filtered = filtered.filter(t => {
                const date = new Date(t.date);
                return date >= filters.dateRange!.start && date <= filters.dateRange!.end;
            });
        }

        if (filters.amountRange) {
            filtered = filtered.filter(t =>
                t.amount >= filters.amountRange!.min && t.amount <= filters.amountRange!.max
            );
        }

        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(t => filters.categories!.includes(t.category.id));
        }

        if (filters.accounts && filters.accounts.length > 0) {
            filtered = filtered.filter(t => filters.accounts!.includes(t.accountId));
        }

        if (filters.types && filters.types.length > 0) {
            filtered = filtered.filter(t => filters.types!.includes(t.type));
        }

        if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter(t => filters.status!.includes(t.status));
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(query) ||
                t.merchant?.toLowerCase().includes(query) ||
                t.notes?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    add(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
        const newTransaction: Transaction = {
            ...transaction,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.transactions.update(txns => [...txns, newTransaction]);
        this.saveTransactions();
        return newTransaction;
    }

    update(id: string, updates: Partial<Transaction>): Transaction | null {
        const index = this.transactions().findIndex(t => t.id === id);
        if (index === -1) return null;

        const updated = {
            ...this.transactions()[index],
            ...updates,
            updatedAt: new Date(),
        };

        this.transactions.update(txns => {
            const newTxns = [...txns];
            newTxns[index] = updated;
            return newTxns;
        });

        this.saveTransactions();
        return updated;
    }

    delete(id: string): boolean {
        const initialLength = this.transactions().length;
        this.transactions.update(txns => txns.filter(t => t.id !== id));
        this.saveTransactions();
        return this.transactions().length < initialLength;
    }

    bulkDelete(ids: string[]): number {
        const initialLength = this.transactions().length;
        this.transactions.update(txns => txns.filter(t => !ids.includes(t.id)));
        this.saveTransactions();
        return initialLength - this.transactions().length;
    }

    getByCategory(categoryId: string): Transaction[] {
        return this.transactions().filter(t => t.category.id === categoryId);
    }

    getByDateRange(start: Date, end: Date): Transaction[] {
        return this.transactions().filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        });
    }

    getRecentTransactions(limit: number = 10): Transaction[] {
        return [...this.transactions()]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }

    private generateId(): string {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMockData(): void {
        // Only generate if no transactions exist
        if (this.transactions().length > 0) return;

        const mockTransactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
                accountId: 'acc_1',
                date: new Date(2026, 0, 15),
                description: 'Salary - January 2026',
                amount: 85000,
                type: 'credit',
                category: this.categories().find(c => c.id === 'salary')!,
                merchant: 'Company Inc.',
                status: 'completed',
            },
            {
                accountId: 'acc_1',
                date: new Date(2026, 0, 18),
                description: 'Grocery Shopping',
                amount: 3500,
                type: 'debit',
                category: this.categories().find(c => c.id === 'groceries')!,
                merchant: 'BigBasket',
                status: 'completed',
            },
            {
                accountId: 'acc_1',
                date: new Date(2026, 0, 19),
                description: 'Dinner at Restaurant',
                amount: 1200,
                type: 'debit',
                category: this.categories().find(c => c.id === 'dining')!,
                merchant: 'The Spice Route',
                status: 'completed',
            },
            {
                accountId: 'acc_1',
                date: new Date(2026, 0, 20),
                description: 'Uber Rides',
                amount: 450,
                type: 'debit',
                category: this.categories().find(c => c.id === 'transport')!,
                merchant: 'Uber',
                status: 'completed',
            },
            {
                accountId: 'acc_1',
                date: new Date(2026, 0, 20),
                description: 'Netflix Subscription',
                amount: 649,
                type: 'debit',
                category: this.categories().find(c => c.id === 'subscriptions')!,
                merchant: 'Netflix',
                status: 'completed',
                recurring: {
                    frequency: 'monthly',
                    nextDate: new Date(2026, 1, 20),
                },
            },
        ];

        mockTransactions.forEach(txn => this.add(txn));
    }

    // Category management
    getCategories(): Category[] {
        return this.categories();
    }

    getCategoryById(id: string): Category | undefined {
        return this.categories().find(c => c.id === id);
    }

    addCategory(category: Omit<Category, 'id'>): Category {
        const newCategory: Category = {
            ...category,
            id: `cat_${Date.now()}`,
        };
        this.categories.update(cats => [...cats, newCategory]);
        return newCategory;
    }
}
