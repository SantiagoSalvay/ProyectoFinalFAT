import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Loader2, Heart, Calendar, Building } from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  date: string;
  recipient: {
    name: string;
    organization?: string;
    avatar?: string;
  };
  message?: string;
}

export default function DonationsHistoryPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        // Reemplaza esto por tu endpoint real de donaciones del usuario
        const data = await api.getDonacionesRealizadas();
        setDonations(data);
      } catch (error) {
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Historial de Donaciones</h1>
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Cargando donaciones...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No has realizado donaciones aún</h3>
            <p className="text-gray-600">Tus donaciones aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-6">
            {donations.map(donation => (
              <div key={donation.id} className="card p-6">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{donation.recipient.name}</h3>
                    {donation.recipient.organization && (
                      <span className="text-xs text-gray-500">{donation.recipient.organization}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(donation.date).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-purple-700">${donation.amount}</span>
                </div>
                {donation.message && (
                  <p className="text-gray-700 mb-2">{donation.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
