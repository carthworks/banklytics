export interface Transaction {
    id: string;
    accountId: string;
    date: Date;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    category: Category;
    subcategory?: string;
    merchant?: string;
    notes?: string;
    tags?: string[];
    attachments?: string[];
    recurring?: RecurringInfo;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    budget?: number;
    subcategories?: string[];
}

export interface RecurringInfo {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDate: Date;
    endDate?: Date;
}

export interface TransactionFilters {
    dateRange?: {
        start: Date;
        end: Date;
    };
    amountRange?: {
        min: number;
        max: number;
    };
    categories?: string[];
    accounts?: string[];
    types?: ('debit' | 'credit')[];
    status?: TransactionStatus[];
    searchQuery?: string;
}

export interface Merchant {
    id: string;
    name: string;
    category: string;
    logo?: string;
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
    // Income categories
    { id: 'salary', name: 'Salary', icon: '💼', color: '#00875A', type: 'income' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#00A86B', type: 'income' },
    { id: 'investment', name: 'Investment', icon: '📈', color: '#36B37E', type: 'income' },
    { id: 'other-income', name: 'Other Income', icon: '💰', color: '#57D9A3', type: 'income' },

    // Expense categories
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#FF8B00', type: 'expense' },
    { id: 'dining', name: 'Dining Out', icon: '🍽️', color: '#FFAB00', type: 'expense' },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: '#0052CC', type: 'expense' },
    { id: 'utilities', name: 'Utilities', icon: '💡', color: '#0065FF', type: 'expense' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#6554C0', type: 'expense' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#FF5630', type: 'expense' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#00B8D9', type: 'expense' },
    { id: 'education', name: 'Education', icon: '📚', color: '#36B37E', type: 'expense' },
    { id: 'rent', name: 'Rent/Mortgage', icon: '🏠', color: '#172B4D', type: 'expense' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#5E6C84', type: 'expense' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '📱', color: '#8777D9', type: 'expense' },
    { id: 'other-expense', name: 'Other Expense', icon: '💸', color: '#97A0AF', type: 'expense' },
];
