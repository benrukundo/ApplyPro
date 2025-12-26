import { requireAdmin } from '@/lib/admin';
import ExampleForm from '../components/ExampleForm';

export const metadata = {
  title: 'Add Resume Example | ApplyPro Admin',
};

export default async function NewExamplePage() {
  await requireAdmin();
  
  return <ExampleForm />;
}
