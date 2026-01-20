import { Injectable, signal, computed } from '@angular/core';
import { Budget, BudgetAlert, BudgetPeriod, BudgetProgress, DEFAULT_BUDGET_TEMPLATES } from '@app/models/budget.model';

@Injectable({
    providedIn: 'root',
})
export class BudgetService {
    private budgets = signal<Budget[]>([]);

    // Public readonly signal
    allBudgets = this.budgets.asReadonly();

    // Computed values
    activeBudgets = computed(() =>
        this.budgets().filter(b => b.active)
    );

    totalBudgeted = computed(() =>
        this.activeBudgets().reduce((sum, b) => sum + b.amount, 0)
    );

    totalSpent = computed(() =>
        this.activeBudgets().reduce((sum, b) => sum + b.spent, 0)
    );

    totalRemaining = computed(() =>
        this.activeBudgets().reduce((sum, b) => sum + b.remaining, 0)
    );

    constructor() {
        this.loadBudgets();
    }

    private loadBudgets(): void {
        const saved = localStorage.getItem('budgets');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const budgets = parsed.map((b: any) => ({
                    ...b,
                    startDate: new Date(b.startDate),
                    endDate: new Date(b.endDate),
                    createdAt: new Date(b.createdAt),
                    updatedAt: new Date(b.updatedAt),
                    alerts: b.alerts.map((a: any) => ({
                        ...a,
                        triggeredAt: a.triggeredAt ? new Date(a.triggeredAt) : undefined,
                    })),
                }));
                this.budgets.set(budgets);
            } catch (e) {
                console.error('Error loading budgets:', e);
            }
        }
    }

    private saveBudgets(): void {
        localStorage.setItem('budgets', JSON.stringify(this.budgets()));
    }

    getAll(): Budget[] {
        return this.budgets();
    }

    getById(id: string): Budget | undefined {
        return this.budgets().find(b => b.id === id);
    }

    getActive(): Budget[] {
        return this.budgets().filter(b => b.active);
    }

    getByCategory(category: string): Budget | undefined {
        return this.budgets().find(b => b.category === category && b.active);
    }

    create(budget: Omit<Budget, 'id' | 'spent' | 'remaining' | 'createdAt' | 'updatedAt'>): Budget {
        const newBudget: Budget = {
            ...budget,
            id: this.generateId(),
            spent: 0,
            remaining: budget.amount,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.budgets.update(budgets => [...budgets, newBudget]);
        this.saveBudgets();
        return newBudget;
    }

    update(id: string, updates: Partial<Budget>): Budget | null {
        const index = this.budgets().findIndex(b => b.id === id);
        if (index === -1) return null;

        const updated = {
            ...this.budgets()[index],
            ...updates,
            updatedAt: new Date(),
        };

        // Recalculate remaining if amount or spent changed
        if (updates.amount !== undefined || updates.spent !== undefined) {
            updated.remaining = updated.amount - updated.spent;
        }

        this.budgets.update(budgets => {
            const newBudgets = [...budgets];
            newBudgets[index] = updated;
            return newBudgets;
        });

        this.saveBudgets();
        return updated;
    }

    delete(id: string): boolean {
        const initialLength = this.budgets().length;
        this.budgets.update(budgets => budgets.filter(b => b.id !== id));
        this.saveBudgets();
        return this.budgets().length < initialLength;
    }

    addSpending(budgetId: string, amount: number): Budget | null {
        const budget = this.getById(budgetId);
        if (!budget) return null;

        const newSpent = budget.spent + amount;
        const newRemaining = budget.amount - newSpent;

        // Check alerts
        const updatedAlerts = budget.alerts.map(alert => {
            const threshold = (budget.amount * alert.threshold) / 100;
            if (newSpent >= threshold && !alert.triggered) {
                return {
                    ...alert,
                    triggered: true,
                    triggeredAt: new Date(),
                };
            }
            return alert;
        });

        return this.update(budgetId, {
            spent: newSpent,
            remaining: newRemaining,
            alerts: updatedAlerts,
        });
    }

    getBudgetProgress(budgetId: string): BudgetProgress | null {
        const budget = this.getById(budgetId);
        if (!budget) return null;

        const percentage = (budget.spent / budget.amount) * 100;
        const now = new Date();
        const daysRemaining = Math.ceil(
            (budget.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        let status: 'on-track' | 'warning' | 'exceeded' = 'on-track';
        if (percentage >= 100) {
            status = 'exceeded';
        } else if (percentage >= 75) {
            status = 'warning';
        }

        // Simple projection: current daily rate * days remaining
        const daysPassed = Math.ceil(
            (now.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const dailyRate = daysPassed > 0 ? budget.spent / daysPassed : 0;
        const projectedSpending = budget.spent + (dailyRate * daysRemaining);

        return {
            budgetId,
            percentage,
            status,
            daysRemaining,
            projectedSpending,
        };
    }

    createFromTemplate(templateId: string, totalAmount: number, period: BudgetPeriod, userId: string): Budget[] {
        const template = DEFAULT_BUDGET_TEMPLATES.find(t => t.id === templateId);
        if (!template) return [];

        const now = new Date();
        const endDate = this.calculateEndDate(now, period);

        const budgets = template.categories.map(cat => {
            const amount = (totalAmount * cat.percentage) / 100;
            return this.create({
                userId,
                name: `${cat.category} Budget`,
                category: cat.category,
                amount,
                period,
                startDate: now,
                endDate,
                alerts: this.createDefaultAlerts(),
                rollover: false,
                active: true,
            });
        });

        return budgets;
    }

    private createDefaultAlerts(): BudgetAlert[] {
        return [
            { id: 'alert_50', threshold: 50, triggered: false, notified: false },
            { id: 'alert_75', threshold: 75, triggered: false, notified: false },
            { id: 'alert_90', threshold: 90, triggered: false, notified: false },
            { id: 'alert_100', threshold: 100, triggered: false, notified: false },
        ];
    }

    private calculateEndDate(startDate: Date, period: BudgetPeriod): Date {
        const end = new Date(startDate);
        switch (period) {
            case 'weekly':
                end.setDate(end.getDate() + 7);
                break;
            case 'monthly':
                end.setMonth(end.getMonth() + 1);
                break;
            case 'quarterly':
                end.setMonth(end.getMonth() + 3);
                break;
            case 'yearly':
                end.setFullYear(end.getFullYear() + 1);
                break;
        }
        return end;
    }

    private generateId(): string {
        return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getTriggeredAlerts(): { budget: Budget; alert: BudgetAlert }[] {
        const triggered: { budget: Budget; alert: BudgetAlert }[] = [];

        this.activeBudgets().forEach(budget => {
            budget.alerts.forEach(alert => {
                if (alert.triggered && !alert.notified) {
                    triggered.push({ budget, alert });
                }
            });
        });

        return triggered;
    }

    markAlertAsNotified(budgetId: string, alertId: string): void {
        const budget = this.getById(budgetId);
        if (!budget) return;

        const updatedAlerts = budget.alerts.map(alert =>
            alert.id === alertId ? { ...alert, notified: true } : alert
        );

        this.update(budgetId, { alerts: updatedAlerts });
    }
}
