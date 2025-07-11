import React, { useState } from 'react';
import type { Service, ServiceIconName, Notification } from '../../types';
import { servicesAPI } from '../../services/api';

interface ServiceManagementProps {
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addNotification: (type: Notification['type'], title: string, message: string) => void;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({
    services,
    setServices,
    loading,
    setLoading,
    addNotification
}) => {
    const [currentService, setCurrentService] = useState<Service | null>(null);
    const [serviceForm, setServiceForm] = useState({
        title: '',
        description: '',
        iconName: 'Consulting' as ServiceIconName
    });

    const iconOptions: ServiceIconName[] = [
        'Consulting', 'Processing', 'Fertilizer', 'Nutrition'
    ];

    const iconLabels: Record<ServiceIconName, string> = {
        'Consulting': 'Danışmanlık',
        'Processing': 'Fındık İşleme',
        'Fertilizer': 'Organomineral Gübre',
        'Nutrition': 'Bitki Besleme'
    };

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (currentService) {
                const updatedService = await servicesAPI.update(Number(currentService.id), serviceForm);
                setServices(prev => prev.map(s =>
                    s.id === currentService.id
                        ? { ...updatedService, id: updatedService.id.toString() }
                        : s
                ));
                addNotification('success', 'Başarılı!', 'Hizmet güncellendi.');
            } else {
                const newService = await servicesAPI.create(serviceForm);
                setServices(prev => [...prev, { ...newService, id: newService.id.toString() }]);
                addNotification('success', 'Başarılı!', 'Yeni hizmet eklendi.');
            }

            setCurrentService(null);
            setServiceForm({ title: '', description: '', iconName: 'Consulting' });
        } catch (error) {
            console.error('Hizmet kaydedilirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Hizmet kaydedilirken hata oluştu.');
        }
        setLoading(false);
    };

    const handleServiceEdit = (service: Service) => {
        setCurrentService(service);
        setServiceForm({
            title: service.title,
            description: service.description,
            iconName: service.iconName
        });
    };

    const handleServiceDelete = async (id: string) => {
        if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
            try {
                await servicesAPI.delete(Number(id));
                setServices(prev => prev.filter(s => s.id !== id));
                addNotification('success', 'Başarılı!', 'Hizmet silindi.');
            } catch (error) {
                console.error('Hizmet silinirken hata oluştu:', error);
                addNotification('error', 'Hata!', 'Hizmet silinirken hata oluştu.');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">🛠️ Hizmet Yönetimi</h2>

                {/* Service Form */}
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Hizmet Başlığı"
                            value={serviceForm.title}
                            onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                        <select
                            value={serviceForm.iconName}
                            onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value as ServiceIconName })}
                            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {iconOptions.map(icon => (
                                <option key={icon} value={icon}>{iconLabels[icon]}</option>
                            ))}
                        </select>
                    </div>
                    <textarea
                        placeholder="Hizmet Açıklaması"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                    />
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                        >
                            {loading ? '⏳ Kaydediliyor...' : (currentService ? '✅ Güncelle' : '➕ Ekle')}
                        </button>
                        {currentService && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentService(null);
                                    setServiceForm({ title: '', description: '', iconName: 'Consulting' });
                                }}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                            >
                                ❌ İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Hizmetler ({services.length})</h3>

                {services.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-4">🛠️</div>
                        <p className="text-gray-500">Henüz hizmet eklenmemiş.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((service) => (
                            <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-semibold text-gray-900 truncate">{service.title}</h4>
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => handleServiceEdit(service)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                            title="Düzenle"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleServiceDelete(service.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {service.iconName}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceManagement;
