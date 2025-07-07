# AI Job Chommie

**Author:** Fernando Steyn

---

AI Job Chommie is an automated job-finding service tailored for South African users, offering both Basic and Premium subscription tiers. The app streamlines job discovery and application, with advanced features for premium users.

## Features

- **Automated Job Scraping:** Uses SerpAPI to fetch and normalize job listings from Google Jobs twice daily.
- **Subscription Plans:**
  - **Basic:** View curated job matches and apply manually.
  - **Premium:** Auto-applies to matching jobs on your behalf (via phone, email, fax, or interview URL).
- **Onboarding:**
  - Sign up via embedded Google Form (collects name, email, CV, and signature links).
  - Payment integration with Paystack.
- **User Dashboard:**
  - Paginated, filterable job list.
  - Application status tracking.
  - Subscription management and renewal.
- **Authentication:** Magic link login via Supabase Auth.
- **Subscription Enforcement:** Access is managed based on payment status and subscription expiry.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Paystack integration
- **Backend:** Python (FastAPI), Supabase (database & auth), SerpAPI (scraping)
- **Deployment:** Vercel (frontend), Render (backend)

## Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.8+
- Git

### Frontend
1. Install dependencies:
   ```sh
   cd ai-job-chommie-frontend
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

### Backend
1. Install dependencies:
   ```sh
   cd ai-job-chommie-backend/src
   pip install -r ../requirements.txt
   ```
2. Set up environment variables in a `.env` file:
   ```env
   SUPABASE_PROJECT_ID=your_project_id
   SUPABASE_API_KEY=your_api_key
   ```
3. Start the backend server:
   ```sh
   uvicorn main:app --reload
   ```

## Deployment
- **Frontend:** Deploy the `ai-job-chommie-frontend` folder on [Vercel](https://vercel.com/).
- **Backend:** Deploy the `ai-job-chommie-backend` folder on [Render](https://render.com/). Set environment variables in the Render dashboard.

## License

This project is licensed for educational and demonstration purposes.

---

*Crafted with care by Fernando Steyn.* 