export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Greeting Skeleton */}
        <div className="animate-pulse">
          <div className="h-10 bg-card/50 rounded-lg w-64 mb-2"></div>
          <div className="h-6 bg-card/30 rounded w-32"></div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="mx-auto w-10 h-10 bg-muted/50 rounded-full mb-2"></div>
                <div className="h-8 bg-muted/30 rounded w-12 mx-auto mb-1"></div>
                <div className="h-4 bg-muted/20 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Section Skeleton */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6 rounded-2xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-orange-500/20 rounded w-32 mb-2"></div>
              <div className="h-4 bg-orange-500/10 rounded w-48"></div>
            </div>
          </div>
        </div>

        {/* Recent Entries Skeleton */}
        <div>
          <div className="h-8 bg-card/50 rounded w-40 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border p-4 rounded-xl animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 bg-muted/50 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted/40 rounded w-48"></div>
                    <div className="h-4 bg-muted/20 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
