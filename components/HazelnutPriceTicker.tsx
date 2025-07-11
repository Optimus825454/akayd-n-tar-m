
import React, { useState, useEffect } from 'react';
import { hazelnutPricesAPI } from '../services/api';
import type { HazelnutPrices } from '../types';

const HazelnutPriceTicker: React.FC = () => {
  const [prices, setPrices] = useState<HazelnutPrices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await hazelnutPricesAPI.get();
        setPrices(data);
      } catch (error) {
        console.error('Fındık fiyatları yüklenirken hata:', error);
        // Varsayılan değerler
        setPrices({
          id: 1,
          price: 48.00,
          daily_change: 0.00,
          change_percentage: 0.00,
          source: 'manual',
          update_mode: 'manual',
          scraping_enabled: true,
          notes: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    // 30 saniyede bir otomatik yenileme
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-12 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prices) return null;

  const isPositive = Number(prices.daily_change) >= 0;
  const currentPrice = Number(prices.price) || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Güncel Fındık Fiyatı</h3>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↗' : '↘'} {isPositive ? '+' : ''}{Number(prices.daily_change || 0).toFixed(2)} ₺
        </span>
      </div>

      <div className="mb-4">
        <div className="text-4xl font-bold text-purple-600">{currentPrice.toFixed(2)} ₺</div>
        <div className="text-sm text-gray-600">50 Randıman Fındık için kg başına (serbest piyasa)</div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Günlük Değişim:</span>
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            %{Number(prices.change_percentage || 0).toFixed(2)}
          </span>
        </div>
      </div>



      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Son güncelleme: {new Date(prices.updated_at).toLocaleString('tr-TR')}
        </p>
      </div>
    </div>
  );
};

export default HazelnutPriceTicker;
