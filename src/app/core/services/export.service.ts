import { Injectable } from '@angular/core';
import { Transaction } from '@app/models/transaction.model';
import { Budget } from '@app/models/budget.model';

export interface ExportOptions {
    filename?: string;
    dateFormat?: string;
    includeHeaders?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    /**
     * Export transactions to CSV format
     */
    exportTransactionsToCSV(transactions: Transaction[], options: ExportOptions = {}): void {
        const {
            filename = `transactions_${this.getDateString()}.csv`,
            includeHeaders = true,
        } = options;

        const headers = [
            'Date',
            'Description',
            'Amount',
            'Type',
            'Category',
            'Merchant',
            'Status',
            'Notes',
        ];

        const rows = transactions.map(t => [
            this.formatDate(t.date),
            this.escapeCsvValue(t.description),
            t.amount.toFixed(2),
            t.type,
            t.category.name,
            this.escapeCsvValue(t.merchant || ''),
            t.status,
            this.escapeCsvValue(t.notes || ''),
        ]);

        const csvContent = this.generateCSV(headers, rows, includeHeaders);
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    /**
     * Export budgets to CSV format
     */
    exportBudgetsToCSV(budgets: Budget[], options: ExportOptions = {}): void {
        const {
            filename = `budgets_${this.getDateString()}.csv`,
            includeHeaders = true,
        } = options;

        const headers = [
            'Name',
            'Category',
            'Amount',
            'Spent',
            'Remaining',
            'Period',
            'Start Date',
            'End Date',
            'Status',
        ];

        const rows = budgets.map(b => [
            this.escapeCsvValue(b.name),
            b.category,
            b.amount.toFixed(2),
            b.spent.toFixed(2),
            b.remaining.toFixed(2),
            b.period,
            this.formatDate(b.startDate),
            this.formatDate(b.endDate),
            b.active ? 'Active' : 'Inactive',
        ]);

        const csvContent = this.generateCSV(headers, rows, includeHeaders);
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    /**
     * Export data to JSON format
     */
    exportToJSON(data: any, filename: string = `export_${this.getDateString()}.json`): void {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename, 'application/json');
    }

    /**
     * Export transactions to Excel-compatible format (CSV with UTF-8 BOM)
     */
    exportTransactionsToExcel(transactions: Transaction[], options: ExportOptions = {}): void {
        const {
            filename = `transactions_${this.getDateString()}.csv`,
            includeHeaders = true,
        } = options;

        const headers = [
            'Date',
            'Description',
            'Amount',
            'Type',
            'Category',
            'Subcategory',
            'Merchant',
            'Status',
            'Notes',
            'Tags',
        ];

        const rows = transactions.map(t => [
            this.formatDate(t.date),
            this.escapeCsvValue(t.description),
            t.amount.toFixed(2),
            t.type === 'credit' ? 'Income' : 'Expense',
            t.category.name,
            this.escapeCsvValue(t.subcategory || ''),
            this.escapeCsvValue(t.merchant || ''),
            t.status,
            this.escapeCsvValue(t.notes || ''),
            this.escapeCsvValue(t.tags?.join(', ') || ''),
        ]);

        const csvContent = this.generateCSV(headers, rows, includeHeaders);
        // Add UTF-8 BOM for Excel compatibility
        const bom = '\uFEFF';
        this.downloadFile(bom + csvContent, filename, 'text/csv;charset=utf-8');
    }

    /**
     * Generate summary report
     */
    generateSummaryReport(transactions: Transaction[]): string {
        const totalIncome = transactions
            .filter(t => t.type === 'credit' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'debit' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        const categoryBreakdown = this.getCategoryBreakdown(transactions);

        let report = '=== BANKLYTICS FINANCIAL SUMMARY ===\n\n';
        report += `Report Generated: ${this.formatDate(new Date())}\n`;
        report += `Total Transactions: ${transactions.length}\n\n`;
        report += `Total Income: ₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        report += `Total Expenses: ₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        report += `Net Balance: ₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n`;
        report += '=== CATEGORY BREAKDOWN ===\n\n';

        Object.entries(categoryBreakdown).forEach(([category, amount]) => {
            report += `${category}: ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        });

        return report;
    }

    /**
     * Export summary report to text file
     */
    exportSummaryReport(transactions: Transaction[], filename?: string): void {
        const report = this.generateSummaryReport(transactions);
        const fname = filename || `summary_report_${this.getDateString()}.txt`;
        this.downloadFile(report, fname, 'text/plain');
    }

    /**
     * Print transactions (opens print dialog)
     */
    printTransactions(transactions: Transaction[]): void {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print');
            return;
        }

        const html = this.generatePrintHTML(transactions);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    // Private helper methods

    private generateCSV(headers: string[], rows: string[][], includeHeaders: boolean): string {
        const lines: string[] = [];

        if (includeHeaders) {
            lines.push(headers.join(','));
        }

        rows.forEach(row => {
            lines.push(row.join(','));
        });

        return lines.join('\n');
    }

    private escapeCsvValue(value: string): string {
        if (!value) return '';

        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
    }

    private formatDate(date: Date): string {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private getDateString(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    private downloadFile(content: string, filename: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    private getCategoryBreakdown(transactions: Transaction[]): Record<string, number> {
        const breakdown: Record<string, number> = {};

        transactions
            .filter(t => t.status === 'completed')
            .forEach(t => {
                const category = t.category.name;
                breakdown[category] = (breakdown[category] || 0) + t.amount;
            });

        return breakdown;
    }

    private generatePrintHTML(transactions: Transaction[]): string {
        const summary = this.generateSummaryReport(transactions);

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Banklytics - Transaction Report</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 20px;
            color: #172B4D;
          }
          h1 {
            color: #0052CC;
            border-bottom: 3px solid #0052CC;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #DFE1E6;
          }
          th {
            background-color: #F4F5F7;
            font-weight: 600;
            color: #172B4D;
          }
          .credit {
            color: #00875A;
          }
          .debit {
            color: #DE350B;
          }
          .summary {
            background: #F4F5F7;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Banklytics - Transaction Report</h1>
        <div class="summary">
          <pre>${summary}</pre>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${this.formatDate(t.date)}</td>
                <td>${t.description}</td>
                <td>${t.category.name}</td>
                <td class="${t.type}">₹${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>${t.type === 'credit' ? 'Income' : 'Expense'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    }
}
