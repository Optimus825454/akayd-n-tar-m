
import React from 'react';

const WeatherWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Hava Durumu</h3>
        <span className="text-sm text-gray-500">Sakarya, Hendek</span>
      </div>

      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">
          ☁️
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">18°C</div>
          <div className="text-sm text-gray-600">Parçalı Bulutlu</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Nem:</span>
          <span className="font-medium">65%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Rüzgar:</span>
          <span className="font-medium">2.5 m/s</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</p>
      </div>
    </div>
  );
};

export default WeatherWidget;