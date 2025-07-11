
import React from 'react';

const WeatherRadar: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        Bölgesel Hava Radarı
      </h3>
      <div className="bg-gray-200 rounded-md overflow-hidden flex-grow flex items-center justify-center">
        <img 
          src={`https://www.mgm.gov.tr/Images_Sys/radar/sak.png?v=${new Date().getTime()}`}
          alt="Sakarya Hava Radarı" 
          className="w-full h-auto object-cover"
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">Kaynak: Meteoroloji Genel Müdürlüğü (MGM)</p>
    </div>
  );
};

export default WeatherRadar;
