export default function PatientCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 w-9 h-9"></div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  )
}