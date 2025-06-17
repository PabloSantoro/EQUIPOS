import React, { useEffect, useState } from 'react';

export const APITest: React.FC = () => {
  const [status, setStatus] = useState<string>('Conectando...');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Probar health check
        const healthResponse = await fetch('http://localhost:3001/api/health');
        if (!healthResponse.ok) {
          throw new Error(`Health check failed: ${healthResponse.status}`);
        }
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);

        // Probar equipos
        const equipmentResponse = await fetch('http://localhost:3001/api/equipment');
        if (!equipmentResponse.ok) {
          throw new Error(`Equipment API failed: ${equipmentResponse.status}`);
        }
        const equipmentData = await equipmentResponse.json();
        console.log('Equipment data:', equipmentData);

        setData(equipmentData);
        setStatus('✅ Conectado correctamente');
      } catch (error) {
        console.error('API Test Error:', error);
        setStatus(`❌ Error: ${error.message}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">Test de Conectividad API</h3>
      <p className="text-blue-800">{status}</p>
      {data && (
        <p className="text-blue-700 text-sm mt-2">
          Equipos cargados: {data.length}
        </p>
      )}
    </div>
  );
};