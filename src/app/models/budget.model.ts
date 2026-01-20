export interface Budget {
    id: string;
    userId: string;
    name: string;
    category: string;
    amount: number;
    period: BudgetPeriod;
    startDate: Date;
    endDate: Date;
    spent: number;
    remaining: number;
    alerts: BudgetAlert[];
    rollover: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BudgetAlert {
    id: string;
    threshold: number; // percentage (e.g., 50, 75, 90, 100)
    triggered: boolean;
    notified: boolean;
    triggeredAt?: Date;
}

export interface BudgetTemplate {
    id: string;
    name: string;
    description: string;
    categories: {
        category: string;
        percentage: number;
        amount?: number;
    }[];
}

export interface BudgetProgress {
    budgetId: string;
    percentage: number;
    status: 'on-track' | 'warning' | 'exceeded';
    daysRemaining: number;
    projectedSpending: number;
}

// Default budget templates
export const DEFAULT_BUDGET_TEMPLATES: BudgetTemplate[] = [
    {
        id: '50-30-20',
        name: '50/30/20 Rule',
        description: '50% needs, 30% wants, 20% savings',
        categories: [
            { category: 'needs', percentage: 50 },
            { category: 'wants', percentage: 30 },
            { category: 'savings', percentage: 20 },
        ],
    },
    {
        id: 'conservative',
        name: 'Conservative Budget',
        description: 'Focus on savings and essentials',
        categories: [
            { category: 'rent', percentage: 30 },
            { category: 'groceries', percentage: 15 },
            { category: 'utilities', percentage: 10 },
            { category: 'transport', percentage: 10 },
            { category: 'savings', percentage: 25 },
            { category: 'other', percentage: 10 },
        ],
    },
    {
        id: 'balanced',
        name: 'Balanced Budget',
        description: 'Balance between saving and spending',
        categories: [
            { category: 'rent', percentage: 30 },
            { category: 'groceries', percentage: 12 },
            { category: 'dining', percentage: 8 },
            { category: 'entertainment', percentage: 10 },
            { category: 'transport', percentage: 10 },
            { category: 'savings', percentage: 20 },
            { category: 'other', percentage: 10 },
        ],
    },
];
