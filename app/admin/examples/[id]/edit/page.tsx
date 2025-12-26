import { requireAdmin } from '@/lib/admin';
import ExampleForm from '../../components/ExampleForm';

export const metadata = {
  title: 'Edit Resume Example | ApplyPro Admin',
};

export default async function EditExamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  
  return <ExampleForm exampleId={id} />;
}
