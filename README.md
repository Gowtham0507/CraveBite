# CraveBite - Premium Food Delivery Platform

CraveBite is a comprehensive, full-stack food delivery application featuring a robust backend architecture and a highly dynamic, modern frontend interface. It is designed to simulate a real-world, enterprise-grade food ordering experience.

## Core Features

- **User Authentication:** Secure registration and login using encrypted credentials and JWT-based session management.
- **Dynamic Restaurant Browsing:** Explore local restaurants, view categorized menus, and add items directly to your cart.
- **Advanced Cart Management:** Real-time cart updates, item quantity adjustments, and secure checkout flows.
- **Order Processing & Payment Integration:** Place orders seamlessly with multiple payment options (Online & Cash on Delivery). Features a custom-built, simulated UPI payment flow (PhonePe simulator) for a complete end-to-end user experience.
- **Admin Operations Dashboard:** A dedicated interface for restaurant administrators to monitor incoming orders, accept or reject them based on inventory, and manage order lifecycles.
- **Automated Email Notifications:** Users receive automated HTML-formatted emails upon registration, order confirmation, and order cancellation using SMTP integration.

## Technical Architecture

- **Frontend:** Built with React and Vite for blazing-fast development and optimized production builds. Styled entirely with Tailwind CSS to ensure a responsive, mobile-first design with modern aesthetics. State is managed via React Context APIs.
- **Backend:** Powered by Java 17 and Spring Boot for robust enterprise-level performance. Utilizes Spring Security for endpoint protection and data security.
- **Database:** MongoDB acts as the primary NoSQL data store, handling complex, nested JSON objects (like restaurant menus and order items) with high scalability.
- **Build Tools:** Maven for backend dependency management, Node/npm for the frontend ecosystem.

## Project Setup Instructions

### Backend Configuration
1. Navigate to the `backend` directory.
2. Open `src/main/resources/application.properties` and configure your local or remote MongoDB URI as well as your SMTP credentials for email services.
3. Start the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on port `8080` by default.

### Frontend Configuration
1. Navigate to the `frontend` directory.
2. Install all required Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

## Development Team Contributions
- Ch. Eswar
- Asif Baji Shaik
- Sai Gowtham Peddinti
- Chakka Venkata Charan
