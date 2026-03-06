## Packages
@clerk/clerk-react | Authentication provider
lucide-react | Icons

## Notes
Clerk authentication requires VITE_CLERK_PUBLISHABLE_KEY environment variable. A fallback dummy key is used to prevent hard crashes during development, but full auth flow will require a valid key.
All API requests in the hooks use a custom wrapper to inject the Clerk JWT token.
