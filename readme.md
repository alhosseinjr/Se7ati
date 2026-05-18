# Sehati (صحتي)

## Project Overview

Sohati is an Arabic healthcare platform designed to help users verify medicines, detect suspicious products, and access medical information through an intelligent and user-friendly experience.

The idea behind the platform is to reduce the spread of counterfeit medicines in Egypt by giving users a fast and accessible way to check medications using barcode scanning, AI assistance, and medicine search tools.

The platform focuses on simplicity, Arabic RTL usability, and mobile-first interaction so that any user can use it easily.

---

# Main Features

## Medicine Verification

Users can search for medicines or scan a medicine barcode to instantly verify product information.

The platform helps users:

* Check if a medicine exists in the database
* View medicine information
* Detect suspicious or potentially counterfeit products
* Access medicine-related details quickly

---

## Barcode Scanning System

The website includes a real-time barcode scanner that uses the device camera.

Once a barcode is scanned:

* The barcode is analyzed
* The system searches the medicine database
* Medicine information is returned instantly
* Suspicious or unknown products can be flagged

This creates a faster and more practical experience for users compared to manual searching.

---

# AI Integration

One of the main parts of the project is the AI-powered medical assistant.

The AI system acts like a virtual pharmacist that helps users understand medicines and ask health-related questions in Arabic.

## What the AI Does

The AI assistant can:

* Answer medicine-related questions
* Explain medicine usage
* Provide simplified medical information
* Support Egyptian Arabic conversations
* Help users understand symptoms or medicine instructions

The assistant is designed to make medical information easier to access for normal users without requiring technical knowledge.

---

## AI Technologies Used

The AI part of the project was built using:

* OpenRouter API
* Llama 3.3 70B Instruct model
* Custom AI prompts for Arabic healthcare conversations

The AI integration was structured to support:

* Arabic RTL communication
* Natural conversation flow
* Fast response generation
* Context-aware answers

The platform also includes fallback handling in case advanced AI vision or image analysis features are unavailable.

---

# Technologies Used

## Frontend

The frontend was built using:

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion

The interface was designed with a fully Arabic RTL layout and optimized for mobile devices.

---

## Backend

The backend system was built using:

* Node.js
* Express.js
* TypeScript

The backend handles:

* Barcode processing
* Medicine search requests
* AI communication
* Report handling
* API management

---

## Database

The project uses:

* PostgreSQL
* Drizzle ORM

The database stores:

* Medicine records
* Barcode mappings
* Suspicious medicine reports
* Scan logs

---

# User Experience & Design

The platform was designed to feel modern, fast, and easy to use.

Main design goals:

* Arabic-first experience
* Responsive design
* Clean healthcare interface
* Fast navigation
* Mobile-friendly interactions

Animations and transitions were implemented to create a smoother user experience.

---

# Project Goal

The main goal of Sohati is to improve medicine awareness and help reduce counterfeit medicine risks through technology and AI.

The platform combines healthcare, artificial intelligence, and modern web technologies to create a practical solution that can support users in their daily medical needs.

---

# Author

Developed by Al-Hossein Mahmoud

