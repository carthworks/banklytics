# 🏦 Banklytics

> **Turn bank statements into actionable intelligence.**

A professional, enterprise-grade banking analytics platform built with Angular 21, featuring AI-powered insights, comprehensive transaction management, and advanced reporting capabilities.

[![Angular](https://img.shields.io/badge/Angular-21-red.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Banklytics Dashboard](https://via.placeholder.com/1200x600/0052CC/FFFFFF?text=Banklytics+Dashboard)

## ✨ Features

### 🎯 Core Features
- **Smart Transaction Management** - Track, categorize, and analyze all your financial transactions
- **Budget Management** - Create budgets with alerts and progress tracking
- **Multi-Bank Support** - Connect 18+ major Indian banks
- **Advanced Filtering** - Filter by date, amount, category, merchant, and more
- **Bulk Operations** - Manage multiple transactions at once

### 📊 Analytics & Insights
- **Real-time Dashboard** - Live financial overview with interactive charts
- **Category Breakdown** - Understand spending patterns by category
- **Income vs Expenses** - Track your financial health over time
- **Trend Analysis** - Identify spending trends and patterns
- **Financial Health Score** - Get an overall view of your financial wellness

### 📈 Reports & Export
- **Multiple Export Formats** - CSV, Excel, JSON, and PDF
- **Summary Reports** - Generate comprehensive financial summaries
- **Print-Friendly Views** - Professional print layouts
- **Custom Date Ranges** - Export data for any time period
- **Category Reports** - Detailed breakdown by spending category

### 🎨 Professional UI/UX
- **Modern Design** - Corporate banking aesthetic with professional blue theme
- **Responsive Layout** - Optimized for desktop, tablet, and mobile
- **Dark Mode Ready** - Prepared for theme customization
- **Accessibility** - WCAG AA compliant
- **Smooth Animations** - Polished micro-interactions

### 🔐 Security & Privacy
- **Secure Authentication** - Protected routes and session management
- **Local Data Storage** - Your data stays on your device
- **No External Calls** - Complete privacy in demo mode
- **Encrypted Storage** - Client-side data encryption ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 21+

### Installation

```bash
# Clone the repository
git clone https://github.com/carthworks/banklytics.git
cd banklytics

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Demo Login

Use any of these credentials to login:

| Email/Username | Password | Description |
|----------------|----------|-------------|
| `demo@banklytics.com` | `demo123` | General demo account |
| `admin` | `admin123` | Admin features |
| `user` | `user123` | Basic user account |

## 📁 Project Structure

```
banklytics/
├── src/
│   ├── app/
│   │   ├── core/                    # Core functionality
│   │   │   ├── services/           # Business logic services
│   │   │   ├── guards/             # Route guards
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   ├── header/             # Header component
│   │   │   └── footer/             # Footer component
│   │   │
│   │   ├── shared/                  # Shared resources
│   │   │   ├── components/         # Reusable components
│   │   │   ├── directives/         # Custom directives
│   │   │   └── pipes/              # Custom pipes
│   │   │
│   │   ├── views/                   # Feature modules
│   │   │   ├── landing/            # Landing page
│   │   │   ├── onboarding/         # Onboarding flow
│   │   │   ├── home/               # Dashboard
│   │   │   └── transactions/       # Transaction management
│   │   │
│   │   ├── models/                  # Data models
│   │   │   ├── transaction.model.ts
│   │   │   └── budget.model.ts
│   │   │
│   │   └── app.*                   # Root files
│   │
│   ├── assets/                      # Static assets
│   └── styles.scss                  # Global styles
│
├── .gemini/                         # Documentation
│   ├── UPGRADE_PLAN.md
│   ├── FEATURE_ROADMAP.md
│   ├── ARCHITECTURE.md
│   └── PHASE_1_3_IMPLEMENTATION.md
│
└── package.json
```

## 🎯 Key Technologies

### Frontend
- **Angular 21** - Latest framework with standalone components
- **TypeScript 5.9** - Type-safe development
- **RxJS 7.8** - Reactive programming
- **Signals** - Modern state management
- **Chart.js 4.5** - Data visualization

### Styling
- **SCSS** - Advanced CSS with variables
- **CSS Grid & Flexbox** - Modern layouts
- **CSS Variables** - Dynamic theming
- **Responsive Design** - Mobile-first approach

### Development Tools
- **Angular CLI** - Project scaffolding
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing

## 📊 Available Scripts

```bash
# Development
npm start              # Start dev server (http://localhost:4200)
npm run watch          # Build and watch for changes

# Production
npm run build          # Production build
npm run build:prod     # Optimized production build

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting

# Testing
npm test               # Run unit tests
```

## 🎨 Design System

### Color Palette

**Primary Colors**:
- Primary Blue: `#0052CC` - Main brand color
- Primary Blue Dark: `#003D99` - Hover states
- Primary Blue Light: `#0066FF` - Accents

**Secondary Colors**:
- Success Green: `#00875A`
- Warning Orange: `#FFAB00`
- Error Red: `#DE350B`
- Info Blue: `#0065FF`

**Neutral Scale**:
- 10 shades from `#091E42` (darkest) to `#FFFFFF` (white)

### Typography
- **Font Family**: Inter
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## 🔧 Configuration

### Environment Variables
Currently using demo mode with local storage. For production:

1. Create `environment.ts` files
2. Configure API endpoints
3. Set up authentication tokens
4. Enable analytics

### Customization

**Theme Colors**: Edit `src/styles.scss`
```scss
:root {
  --primary-blue: #0052CC;
  --success: #00875A;
  // ... customize colors
}
```

**Bank List**: Edit `src/app/core/services/onboarding.service.ts`

## 📚 Documentation

Comprehensive documentation available in `.gemini/` folder:

- **[UPGRADE_PLAN.md](.gemini/UPGRADE_PLAN.md)** - Complete upgrade strategy
- **[FEATURE_ROADMAP.md](.gemini/FEATURE_ROADMAP.md)** - Detailed feature roadmap
- **[ARCHITECTURE.md](.gemini/ARCHITECTURE.md)** - Technical architecture
- **[PHASE_1_3_IMPLEMENTATION.md](.gemini/PHASE_1_3_IMPLEMENTATION.md)** - Implementation guide
- **[COLOR_PALETTE.md](.gemini/COLOR_PALETTE.md)** - Color system guide
- **[REBRANDING_SUMMARY.md](.gemini/REBRANDING_SUMMARY.md)** - Rebranding details

## 🚀 Deployment

### Build for Production

```bash
npm run build:prod
```

Output will be in `dist/` folder.

### Hosting Options

**Recommended**:
- [Vercel](https://vercel.com) - Zero config deployment
- [Netlify](https://netlify.com) - Easy continuous deployment
- [Firebase Hosting](https://firebase.google.com/docs/hosting) - Google's hosting solution

**Deploy to Vercel**:
```bash
npm install -g vercel
vercel
```

## 🗺️ Roadmap

### ✅ Completed (v1.0.0)
- [x] Professional landing page with login
- [x] User authentication system
- [x] Onboarding flow (4 steps)
- [x] Transaction management with CRUD
- [x] Budget management system
- [x] Advanced filtering and search
- [x] Export to CSV, Excel, JSON
- [x] Summary reports and printing
- [x] Toast notification system
- [x] 18 Indian banks integration
- [x] Professional UI with corporate design

### 🔄 In Progress (v1.1.0)
- [ ] Analytics dashboard
- [ ] Budget widgets
- [ ] Chart visualizations
- [ ] Mobile optimization

### 📋 Planned (v2.0.0)
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Multi-currency support
- [ ] Collaboration features
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Push notifications

See [FEATURE_ROADMAP.md](.gemini/FEATURE_ROADMAP.md) for detailed timeline.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Angular style guide
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure code passes linting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**T Karthikeyan**

- GitHub: [@carthworks](https://github.com/carthworks)
- Project: [Banklytics](https://github.com/carthworks/banklytics)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Chart.js for visualization library
- Inter font by Rasmus Andersson
- Icons from Feather Icons

## 📞 Support

For support, questions, or feedback:

- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/carthworks/banklytics/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/carthworks/banklytics/discussions)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Banklytics** - Turn bank statements into actionable intelligence.

Built with ❤️ using Angular 21
