export const metadata = {
  title: 'Settings | ApplyPro',
  description: 'Manage your account settings',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Settings page is under development.
        </p>
      </div>
    </div>
  );
}
