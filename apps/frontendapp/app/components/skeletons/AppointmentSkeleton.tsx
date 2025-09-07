export default function AppointmentSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}