# Hawker Search NTU FYP

Hawker Search is a mobile-focused web application that leverages Large Language Models (LLMs) to deliver personalized hawker stall recommendations.

## Features

- **Stall Owner and Customer Interfaces**: Separate user interfaces for stall owners and customers.

- **Customer-Oriented Functionality**: Customers can input their food preferences into a search box (e.g., “I want to eat something spicy”) and receive personalized hawker stall recommendations based on those preferences.

- **Stall Information**: Users can view recommended hawker stall details, including opening hours, metadata (e.g., Halal, vegetarian), and food menus.

**Stall Owner Exclusive Interface**

- **User-Friendly Onboarding**: A research-backed onboarding process ensures that elderly hawkers or those with low tech literacy can easily join the platform.

- **Analytics Dashboard**: A one-page marketing analytics page provides hawkers with performance data, search keyword data, and AI-powered insights.

### Customer Interface Features

- **Favorite Hawkers**: Customers can "favorite" hawker stalls they enjoy and view a list of favorited hawkers on a single page.

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Supabase
- **Database**: PostgreSQL (Managed via Supabase)
- **LLM integration**: OpenAI GPT, OpenAI Embedding Model

---

## Local Development Setup

Follow these steps to set up the project on your local machine for development purposes.

### Prerequisites

Before getting started, ensure you have the following installed:

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Docker](https://www.docker.com/get-started)
- [Node.js and npm](https://nodejs.org/en/download/) (for running the frontend)

### Steps

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies**:

   For the frontend:

   ```bash
   npm install
   ```

3. **Start Supabase locally**:

   Supabase uses Docker to run its local instance. Start the Supabase services using the following command:

   ```bash
   supabase start
   ```

   > **Note**: The first run may take some time as Docker downloads the necessary images.

4. **Configure environment variables**:

   If this is your first time setting up Supabase, you’ll need to configure your `.env.local` file with the Supabase `url` and `anon_key`. You can do this by running:

   ```bash
   npx supabase status -o env \
   --override-name api.url=NEXT_PUBLIC_SUPABASE_URL \
   --override-name auth.anon_key=NEXT_PUBLIC_SUPABASE_ANON_KEY | \
       grep NEXT_PUBLIC > .env.local
   ```

5. **Run the application**:

   Now you can run the development server with:

   ```bash
   npm run dev
   ```

6. **Access the application**:

   Open your browser and visit [http://localhost:3000](http://localhost:3000) to see the application running.

---

## Project Structure

```
/public       - Static files (images, etc.)
/src          - Main source code
/supabase     - Supabase settings (Migration file, seed data e.t.c.)
.env.local    - Local environment variables
```

---

## Contact Information

Provide a way for others to reach out if they have questions or want to connect:

- Email: syap020@e.ntu.edu.sg
- GitHub: [Shawn](https://github.com/your-username)

or

- Email: malt0001@e.ntu.edu.sg
- Github: [Malthus](https://github.com/malthusohtj)


---