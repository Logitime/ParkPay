
import { redirect } from 'next/navigation';

// This page redirects to the dashboard.
export default function RootPage() {
  redirect('/dashboard');
}
