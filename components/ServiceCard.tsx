
import React from 'react';
import type { Service } from '../types';
import { serviceIcons } from '../constants';

interface ServiceCardProps {
    service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const IconComponent = serviceIcons[service.iconName];

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center">
            <div className="bg-green-100 p-5 rounded-full mb-6">
                {IconComponent && <IconComponent className="w-10 h-10 text-green-600" />}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
            <p className="text-gray-600 flex-grow">{service.description}</p>
        </div>
    );
};

export default ServiceCard;
