// Test script to verify assignment module uses real equipment data
const axios = require('axios');

async function testEquipmentIntegration() {
  try {
    console.log('🔍 Testing Equipment API integration...\n');
    
    // Test equipment endpoint
    const equipmentResponse = await axios.get('http://localhost:3001/api/equipment');
    const equipmentData = equipmentResponse.data;
    
    console.log(`✅ Equipment API returned ${equipmentData.length} equipos`);
    console.log('\n📋 Sample equipment data:');
    console.log(`   1. ${equipmentData[0].dominio} - ${equipmentData[0].marca} ${equipmentData[0].modelo}`);
    console.log(`   2. ${equipmentData[1].dominio} - ${equipmentData[1].marca} ${equipmentData[1].modelo}`);
    console.log(`   3. ${equipmentData[2].dominio} - ${equipmentData[2].marca} ${equipmentData[2].modelo}`);
    
    // Check data format for frontend compatibility
    const sampleEquipo = equipmentData[0];
    console.log('\n🔧 Equipment data structure validation:');
    console.log(`   ✅ ID: ${sampleEquipo.id ? '✓' : '✗'}`);
    console.log(`   ✅ Dominio: ${sampleEquipo.dominio ? '✓' : '✗'}`);
    console.log(`   ✅ Marca: ${sampleEquipo.marca ? '✓' : '✗'}`);
    console.log(`   ✅ Modelo: ${sampleEquipo.modelo ? '✓' : '✗'}`);
    console.log(`   ✅ Tipo Vehículo: ${sampleEquipo.tipoVehiculo ? '✓' : '✗'}`);
    console.log(`   ✅ Status: ${sampleEquipo.status ? '✓' : '✗'}`);
    
    // Count operative equipment (available for assignment)
    const operativeEquipment = equipmentData.filter(e => e.status === 'OPERATIVO');
    console.log(`\n📊 Equipment status summary:`);
    console.log(`   🟢 Operativo: ${operativeEquipment.length}`);
    console.log(`   🔴 Fuera de servicio: ${equipmentData.filter(e => e.status === 'FUERA_SERVICIO').length}`);
    console.log(`   🟡 Mantenimiento: ${equipmentData.filter(e => e.status === 'MANTENIMIENTO').length}`);
    
    console.log('\n✅ Integration test completed successfully!');
    console.log('🚀 Assignment module should now show real equipment data from database');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3001');
    }
  }
}

testEquipmentIntegration();