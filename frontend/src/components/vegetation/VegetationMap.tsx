'use client';
import React from 'react';

const VegetationMap: React.FC = () => {
    return (
        <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center p-6 space-y-3">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Map Visualization</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Map preview is currently a placeholder. Full GeoTIFF rendering
                    requires a tiling service or client-side WebGL renderer.
                </p>
            </div>
        </div>
    );
};

export default VegetationMap;
