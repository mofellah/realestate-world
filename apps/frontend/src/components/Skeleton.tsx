/**
 * Skeleton Loading Component
 * Provides animated placeholder for content being loaded
 */

interface SkeletonProps {
  className?: string;
  variant?: "text" | "title" | "card" | "avatar" | "image";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

  const variantClasses: Record<string, string> = {
    text: "h-4 w-full",
    title: "h-6 w-3/4",
    card: "h-48 w-full",
    avatar: "h-12 w-12 rounded-full",
    image: "h-80 w-full",
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
      <Skeleton variant="image" className="h-64" />
      <div className="p-4 space-y-3">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="h-4 w-2/3" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Skeleton variant="text" className="h-8 w-1/4" />
      <Skeleton variant="image" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Skeleton variant="title" className="h-6" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>
        <div className="space-y-4">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-40" />
        </div>
      </div>
    </div>
  );
}

export function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <Skeleton variant="text" className="h-4 w-1/2 mb-2" />
          <Skeleton variant="title" className="h-8 w-2/3" />
        </div>
      ))}
    </div>
  );
}
