# CyberCheck

A React Native mobile application built with Expo for cybersecurity health assessments.

## Features

- **Welcome Screen**: Clean, modern design with the CyberCheck title and welcome message
- **Navigation**: Seamless navigation between screens using React Navigation
- **Health Check Screen**: Placeholder for cybersecurity assessment functionality
- **Modern UI**: Beautiful, responsive design with smooth animations and shadows

## Screens

### Welcome Screen
- Displays the "CyberCheck" title with a blue underline accent
- Shows the welcome message: "Let's start your cybersecurity health check!"
- Features a prominent "Begin" button that navigates to the Health Check screen
- Clean, minimalist design with proper spacing and typography

### Health Check Screen
- Header with back navigation
- Placeholder content for cybersecurity assessments
- Modern card-based layout
- Ready for future implementation of security check features

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Screen navigation
- **React Native Screens**: Native screen components
- **React Native Safe Area Context**: Safe area handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CyberCheck
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# For Android
npm run android

# For iOS (requires macOS)
npm run ios

# For web
npm run web
```

## Project Structure

```
CyberCheck/
├── App.js                 # Main app component with navigation setup
├── screens/
│   ├── WelcomeScreen.js   # Welcome screen component
│   └── HealthCheckScreen.js # Health check screen component
├── assets/               # Images, fonts, and other static assets
├── package.json          # Dependencies and scripts
└── app.json             # Expo configuration
```

## Design System

### Colors
- Primary Blue: `#3498db`
- Dark Text: `#2c3e50`
- Medium Text: `#34495e`
- Light Text: `#7f8c8d`
- Background: `#f8f9fa`
- White: `#ffffff`

### Typography
- Title: 42px, Bold (700)
- Header: 20px, Semi-bold (600)
- Body: 16-20px, Medium (500-600)
- Subtitle: 14-16px, Regular (400)

### Spacing
- Consistent padding and margins throughout
- Proper safe area handling for different devices
- Responsive design considerations

## Future Enhancements

- Implement actual cybersecurity assessment questions
- Add progress tracking and scoring
- Include security recommendations and tips
- Add user authentication and profile management
- Implement data persistence for assessment results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 