import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'Banklytics';
  private router = inject(Router);
  showHeader = true;
  showFooter = true;

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hideOnRoutes = ['/', '/onboarding'];
        const currentRoute = event.url.split('?')[0]; // Remove query params

        this.showHeader = !hideOnRoutes.includes(currentRoute);
        this.showFooter = !hideOnRoutes.includes(currentRoute);
      });

    // Set initial state
    const currentRoute = this.router.url.split('?')[0];
    const hideOnRoutes = ['/', '/onboarding'];
    this.showHeader = !hideOnRoutes.includes(currentRoute);
    this.showFooter = !hideOnRoutes.includes(currentRoute);
  }
}
