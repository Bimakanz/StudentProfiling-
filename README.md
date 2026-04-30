# Student Profiling System

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white)

The **Student Profiling System** is a comprehensive platform designed to manage and showcase student achievements, portfolios, and academic records. This project stands out by utilizing a **Neobrutalism Design System**, offering a bold, high-contrast, and highly interactive user experience that distinguishes it from conventional academic applications.

## 🌟 Key Features

- **Neobrutalist User Interface:** A unique, high-contrast design language featuring bold typography, strong borders, and solid drop shadows for maximum accessibility and visual impact.
- **Custom Drawer Navigation:** A fluid, custom-built slide-over menu system that maintains state seamlessly without unmounting the main dashboard.
- **Portfolio & Certification Management:** Students can easily upload, categorize, and showcase their projects and certifications.
- **Public View Showcase:** A dedicated public route allowing external visitors to view student portfolios without requiring authentication.
- **Social Media Integration:** Seamless integration with GitHub, LinkedIn, and Instagram to build a comprehensive professional profile.
- **Robust REST API:** A secure and scalable backend architecture powered by Laravel 11.

---

## 💻 Tech Stack

### Frontend (Mobile)
- **Framework:** React Native with Expo
- **Routing:** Expo Router (File-based routing)
- **State Management & Storage:** React Hooks, AsyncStorage
- **Styling:** Custom Neobrutalism UI Components

### Backend (API)
- **Framework:** Laravel 11 (PHP)
- **Database:** MySQL
- **Authentication:** Laravel Sanctum / Token-based Auth

---

## 🚀 Installation & Setup Guide

To run this project locally, you will need to set up both the Laravel Backend and the React Native Frontend.

### Prerequisites
- PHP >= 8.2 & Composer
- MySQL Database
- Node.js & npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go App (installed on your mobile device) or an Emulator

### Part 1: Backend Setup (Laravel)
1. Navigate to the backend directory:
   ```bash
   cd ProfilingSiswa
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Configure the environment variables:
   ```bash
   cp .env.example .env
   ```
   *Open the `.env` file and update the `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` fields to match your local MySQL configuration.*
4. Generate the application key and migrate the database:
   ```bash
   php artisan key:generate
   php artisan migrate:fresh --seed
   ```
   *(Note: The `--seed` flag will populate the database with initial dummy data for testing purposes).*
5. Serve the API locally:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```
   > **Crucial:** Using `--host=0.0.0.0` ensures the API is accessible across your local network, which is required when connecting from a mobile device or emulator.

### Part 2: Frontend Setup (React Native)
1. Open a new terminal instance and navigate to the frontend directory:
   ```bash
   cd APIProfilingSiswa
   ```
2. Install JavaScript dependencies:
   ```bash
   npm install
   ```
3. **Configure the API Endpoint:**
   Locate the file where the API URL is defined (e.g., `app/(tabs)/Home.tsx` or `app/Start/Login.tsx`). Update the `API_URL` variable to point to your computer's local IP address (IPv4) instead of `localhost`.
   ```typescript
   // Example
   const API_URL = 'http://192.168.x.x:8000/api'; 
   ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Scan the QR Code generated in the terminal using the **Expo Go** app on your smartphone to launch the application.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
