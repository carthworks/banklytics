import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss',
})
export class LandingComponent {
    username = '';
    password = '';
    rememberMe = false;
    isLoading = false;
    errorMessage = '';
    showPassword = false;

    // Demo credentials
    demoCredentials = [
        { username: 'demo@banklytics.com', password: 'demo123' },
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'user123' }
    ];

    features = [
        {
            icon: 'chart',
            title: 'Smart Analytics',
            description: 'AI-powered insights into your spending patterns'
        },
        {
            icon: 'shield',
            title: 'Secure & Private',
            description: 'Bank-level encryption for your financial data'
        },
        {
            icon: 'automation',
            title: 'Auto Categorization',
            description: 'Automatically organize your transactions'
        },
        {
            icon: 'goals',
            title: 'Financial Goals',
            description: 'Set and track your savings objectives'
        }
    ];

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    login(): void {
        this.errorMessage = '';

        if (!this.username || !this.password) {
            this.errorMessage = 'Please enter both username and password';
            return;
        }

        this.isLoading = true;

        // Simulate API call delay
        setTimeout(() => {
            // Check credentials
            const validCredential = this.demoCredentials.find(
                cred => cred.username === this.username && cred.password === this.password
            );

            if (validCredential) {
                // Successful login
                const token = 'token-' + Date.now();
                const userData = {
                    username: this.username,
                    name: this.username.includes('@') ? this.username.split('@')[0] : this.username,
                    email: this.username.includes('@') ? this.username : `${this.username}@banklytics.com`
                };

                this.authService.login(token, userData);
                this.router.navigate(['/onboarding']);
            } else {
                this.errorMessage = 'Invalid username or password';
                this.isLoading = false;
            }
        }, 800);
    }

    useDemoCredentials(index: number): void {
        const cred = this.demoCredentials[index];
        this.username = cred.username;
        this.password = cred.password;
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}
