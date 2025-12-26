export const metadata = {
  title: 'Billing | ApplyPro',
  description: 'Manage your subscription and billing',
};

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Billing & Subscription
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your subscription plan and payment methods
        </p>
      </div>

      {/* Billing content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Billing page is under development.
        </p>
      </div>
    </div>
  );
}
