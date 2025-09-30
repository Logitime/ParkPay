import { redirect } from 'next/navigation';

// This page only redirects to the dashboard page, which is the root of the app.
export default function RootPage() {
  redirect('/dashboard');
}
