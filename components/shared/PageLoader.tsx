import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800">Loading Content</h3>
        <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your data...</p>
      </div>
      
      {/* Simple skeleton animation for the rest of the page */}
      <div className="w-full max-w-4xl mt-12 space-y-6">
        <div className="h-8 bg-gray-100 rounded-lg w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
};

export default PageLoader;
