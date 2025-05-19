import { useState } from 'react';
import { StatusSettings } from './StatusSettings';

export function Settings() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your workspace settings and preferences
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <StatusSettings />
        </div>

        {/* Add more settings sections here in the future */}
      </div>
    </div>
  );
} 