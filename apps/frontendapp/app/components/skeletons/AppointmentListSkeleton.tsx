export default function AppointmentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}