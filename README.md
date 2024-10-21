# HawkerSearch (NTU FYP)

HawkerSearch is a mobile-focused web application that leverages Large Language Models (LLMs) to deliver personalised hawker stall recommendations to customers, as a novel way for elderly and/or low tech literacy hawkers to market their stalls.

## Features

### Customer Interface

-   **Powerful Search Function**: Customers can input their food preferences into a search box (e.g., “I want to eat something spicy”) and receive personalised hawker stall recommendations based on those preferences.
-   **Hawker Stall Information**: Users can view the details of any recommended hawker stall which include location, opening hours, certifications (e.g. halal, vegetarian), and menus (i.e. food items and their descriptions).
-   **Favourite Hawkers**: Customers can "favourite" hawker stalls they want to visit and view the entire list of favourited hawkers on a dedicated page.

### Hawker Owner Interface

-   **Research-Backed Onboarding Flow**: An onboarding process designed with well-tested user interface and experience (UI/UX) principles tailored to elderly and/or low tech literacy hawkers, so that they can easily join our platform.
-   **Insights Dashboard**: A marketing analytics page that provides hawkers with platform performance data (e.g. how many customers they were recommended to), top search keywords (e.g. many customers searched for "spicy"), and actionable business insights.

## Tech Stack

-   **Frontend**: Next.js, React
-   **Backend**: Supabase
-   **Database**: PostgreSQL (Managed via Supabase)
-   **LLM integration**: OpenAI GPT, OpenAI Embedding Model

---

## Local Development Setup

Follow these steps to set up the project on your local machine for development purposes.

### Prerequisites

Before getting started, ensure you have the following installed:

-   [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
-   [Docker](https://www.docker.com/get-started)
-   [Node.js and npm](https://nodejs.org/en/download/) (for running the frontend)

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

If you have any questions, you may contact either:

-   GitHub: [Yap Yu Xiang, Shawn](https://github.com/your-username)
-   Email: syap020@e.ntu.edu.sg

or

-   GitHub: [Malthus Oh Teng Jie](https://github.com/malthusohtj)
-   Email: malt0001@e.ntu.edu.sg

---
