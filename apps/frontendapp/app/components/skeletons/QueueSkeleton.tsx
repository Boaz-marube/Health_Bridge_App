export default function QueueSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        
        {/* Queue Items */}
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                  <div className="flex space-x-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-14"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}