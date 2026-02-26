// Test script to verify backend setup
import supabase from './config/supabase.js';

console.log('🧪 Testing Supabase Connection...\n');

async function testConnection() {
  try {
    // Test 1: Check if Supabase client is initialized
    console.log('✅ Supabase client initialized');
    console.log(`   URL: ${process.env.SUPABASE_URL}`);
    
    // Test 2: Try to query the surveys table
    console.log('\n📊 Testing surveys table...');
    const { data, error, count } = await supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error querying surveys table:', error.message);
      console.log('\n💡 Make sure you:');
      console.log('   1. Created the surveys table in Supabase (see SUPABASE_SETUP.md)');
      console.log('   2. Set correct SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
      console.log('   3. Enabled Row Level Security policies');
      process.exit(1);
    }
    
    console.log(`✅ Surveys table exists! Current count: ${count || 0}`);
    
    // Test 3: Try to insert a test survey
    console.log('\n📝 Testing survey insertion...');
    const testSurvey = {
      name: 'Test User',
      branch: 'TEST',
      hostel: 'Test Hostel',
      campus: 'Test Campus',
      restaurant_1: 'Test Restaurant',
      phone_number: '+919999999999',
      pickup_spot: 'Test Spot',
      order_frequency: 'Daily',
      current_apps: ['Swiggy'],
      convincing_factors: ['Lower prices']
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('surveys')
      .insert([testSurvey])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test survey:', insertError.message);
      process.exit(1);
    }
    
    console.log('✅ Test survey inserted successfully!');
    console.log(`   ID: ${insertData.id}`);
    
    // Clean up test data
    await supabase.from('surveys').delete().eq('id', insertData.id);
    console.log('✅ Test survey cleaned up');
    
    console.log('\n🎉 All tests passed! Your backend is ready to use.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testConnection();
