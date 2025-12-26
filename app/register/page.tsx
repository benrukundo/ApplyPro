import { redirect } from 'next/navigation';

export default function RegisterRedirectPage() {
  // Preserve legacy /register URL by redirecting to /signup
  redirect('/signup');
}
