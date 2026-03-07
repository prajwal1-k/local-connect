

# KodeQuantum Local Services - Implementation Plan

## Overview
A local services marketplace (like Urban Company/JustDial) where service takers can discover and book local service providers, and providers can manage their services and accept/reject requests.

## Pages & Features

### 1. Landing Page
- Hero section with search bar and tagline "Find Trusted Local Services"
- Service categories grid (Home Services, Beauty & Wellness, Cleaning, Appliance Repair, IT Services, etc.) with bold icons
- How it works section (3 steps: Search → Book → Get Service)
- Featured/top-rated providers section
- Modern & bold design with vibrant brand colors

### 2. Authentication (Login & Signup)
- Role selection: **Service Taker** or **Service Provider**
- Email/password signup & login via Supabase Auth
- Separate signup flows:
  - **Taker**: Name, email, phone, location
  - **Provider**: Name, email, phone, location, service category, experience, description
- User profiles stored in database with Supabase Cloud

### 3. Service Taker Dashboard
- Browse & search services by category and location
- View provider profiles with ratings, reviews, and service details
- Send service requests with description, preferred date/time
- Track request status (Pending → Accepted → Completed)
- Rate & review completed services

### 4. Service Provider Dashboard
- Profile management (services offered, pricing, availability, portfolio photos)
- Incoming request notifications
- Accept/Reject/Complete service requests
- View earnings summary and booking history
- Customer reviews section

### 5. Service Listing & Discovery
- Category pages with filterable provider listings
- Provider detail page with full info, gallery, reviews
- Search with filters (category, rating, location)

### 6. Booking System
- Service request form (description, date, time, address)
- Request status tracking for both parties
- Notification when provider accepts/rejects

## Database (Supabase Cloud)
- **profiles** – user info (name, phone, location, avatar, bio)
- **user_roles** – role management (service_taker, service_provider)
- **services** – provider's offered services (category, price, description)
- **service_requests** – bookings (taker, provider, status, details, date)
- **reviews** – ratings and feedback
- **categories** – service categories list

## Design
- Modern & bold UI with vibrant primary color palette
- Large category cards with icons
- Clean provider cards with ratings badges
- Mobile-responsive throughout

