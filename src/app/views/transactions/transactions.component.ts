import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '@app/core/services/transaction.service';
import { BudgetService } from '@app/core/services/budget.service';
import { ExportService } from '@app/core/services/export.service';
import { UiService } from '@app/core/services/ui.service';
import { Transaction, TransactionFilters } from '@app/models/transaction.model';

@Component({
    selector: 'app-transactions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './transactions.component.html',
    styleUrl: './transactions.component.scss',
})
export class TransactionsComponent {
    private transactionService = inject(TransactionService);
    private budgetService = inject(BudgetService);
    private exportService = inject(ExportService);
    private uiService = inject(UiService);

    // State
    transactions = this.transactionService.allTransactions;
    categories = this.transactionService.allCategories;

    // Filters
    private filters = signal<TransactionFilters>({});
    searchQuery = signal('');
    selectedCategory = signal<string>('all');
    selectedType = signal<'all' | 'debit' | 'credit'>('all' as 'all' | 'debit' | 'credit');
    dateRange = signal<{ start: Date | null; end: Date | null }>({ start: null, end: null });

    // Computed filtered transactions
    filteredTransactions = computed(() => {
        const filters: TransactionFilters = {};

        if (this.searchQuery()) {
            filters.searchQuery = this.searchQuery();
        }

        if (this.selectedCategory() !== 'all') {
            filters.categories = [this.selectedCategory()];
        }

        if (this.selectedType() !== 'all') {
            filters.types = [this.selectedType() as 'debit' | 'credit'];
        }

        if (this.dateRange().start && this.dateRange().end) {
            filters.dateRange = {
                start: this.dateRange().start!,
                end: this.dateRange().end!,
            };
        }

        return this.transactionService.getFiltered(filters);
    });

    // Computed statistics
    totalIncome = computed(() =>
        this.filteredTransactions()
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    totalExpenses = computed(() =>
        this.filteredTransactions()
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    netBalance = computed(() => this.totalIncome() - this.totalExpenses());

    // UI state
    selectedTransactions = signal<Set<string>>(new Set());
    showFilters = signal(false);
    sortBy = signal<'date' | 'amount'>('date');
    sortOrder = signal<'asc' | 'desc'>('desc');

    // Sorted transactions
    sortedTransactions = computed(() => {
        const txns = [...this.filteredTransactions()];
        const order = this.sortOrder() === 'asc' ? 1 : -1;

        return txns.sort((a, b) => {
            if (this.sortBy() === 'date') {
                return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
            } else {
                return (a.amount - b.amount) * order;
            }
        });
    });

    // Methods
    toggleTransactionSelection(id: string): void {
        const selected = new Set(this.selectedTransactions());
        if (selected.has(id)) {
            selected.delete(id);
        } else {
            selected.add(id);
        }
        this.selectedTransactions.set(selected);
    }

    selectAll(): void {
        const allIds = new Set(this.sortedTransactions().map(t => t.id));
        this.selectedTransactions.set(allIds);
    }

    deselectAll(): void {
        this.selectedTransactions.set(new Set());
    }

    deleteSelected(): void {
        const count = this.selectedTransactions().size;
        if (count === 0) return;

        this.uiService.dialog.confirm(
            'Delete Transactions',
            `Are you sure you want to delete ${count} transaction(s)?`
        ).then(confirmed => {
            if (confirmed) {
                const deleted = this.transactionService.bulkDelete(Array.from(this.selectedTransactions()));
                this.selectedTransactions.set(new Set());
                this.uiService.toast.success('Deleted', `${deleted} transaction(s) deleted successfully`);
            }
        });
    }

    deleteTransaction(id: string): void {
        this.uiService.dialog.confirm(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?'
        ).then(confirmed => {
            if (confirmed) {
                this.transactionService.delete(id);
                this.uiService.toast.success('Deleted', 'Transaction deleted successfully');
            }
        });
    }

    exportToCSV(): void {
        this.exportService.exportTransactionsToCSV(this.filteredTransactions());
        this.uiService.toast.success('Exported', 'Transactions exported to CSV');
    }

    exportToExcel(): void {
        this.exportService.exportTransactionsToExcel(this.filteredTransactions());
        this.uiService.toast.success('Exported', 'Transactions exported to Excel');
    }

    exportToJSON(): void {
        this.exportService.exportToJSON({
            transactions: this.filteredTransactions(),
            exportDate: new Date(),
            filters: this.filters(),
        });
        this.uiService.toast.success('Exported', 'Transactions exported to JSON');
    }

    exportSummary(): void {
        this.exportService.exportSummaryReport(this.filteredTransactions());
        this.uiService.toast.success('Exported', 'Summary report exported');
    }

    print(): void {
        this.exportService.printTransactions(this.filteredTransactions());
    }

    toggleFilters(): void {
        this.showFilters.update(v => !v);
    }

    clearFilters(): void {
        this.searchQuery.set('');
        this.selectedCategory.set('all');
        this.selectedType.set('all');
        this.dateRange.set({ start: null, end: null });
    }

    toggleSort(field: 'date' | 'amount'): void {
        if (this.sortBy() === field) {
            this.sortOrder.update(order => order === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortBy.set(field);
            this.sortOrder.set('desc');
        }
    }

    formatCurrency(amount: number): string {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    getCategoryIcon(categoryId: string): string {
        const category = this.categories().find(c => c.id === categoryId);
        return category?.icon || '💰';
    }

    getCategoryColor(categoryId: string): string {
        const category = this.categories().find(c => c.id === categoryId);
        return category?.color || '#97A0AF';
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                this.uiService.toast.error('Invalid File', 'Please upload a CSV file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                this.uiService.toast.error('File Too Large', 'Maximum file size is 10MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const result = this.transactionService.processCSV(text);

                if (result.imported > 0) {
                    this.uiService.toast.success('Import Successful', `Imported ${result.imported} transactions.`);
                }

                if (result.skipped > 0) {
                    this.uiService.toast.info('Duplicates Skipped', `Skipped ${result.skipped} duplicate transactions.`);
                }

                if (result.errors > 0) {
                    this.uiService.toast.warn('Import Issues', `${result.errors} lines could not be parsed.`);
                }

                if (result.imported === 0 && result.skipped === 0) {
                    this.uiService.toast.error('Import Failed', 'No valid transactions found.');
                }

                input.value = ''; // Reset input
            };
            reader.readAsText(file);
        }
    }
}
