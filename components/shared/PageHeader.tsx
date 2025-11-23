import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
    <div>
      <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-gray-600 mt-2 text-lg">
        {description}
      </p>
    </div>
    {action}
  </div>
);

export default PageHeader;