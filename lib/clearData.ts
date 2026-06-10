/**
 * Utility to clear test/demo data from localStorage
 * Run this in browser console: clearAllData()
 */

export const clearAllData = () => {
  try {
    // Clear Zustand stores
    localStorage.removeItem('sika-auth');
    localStorage.removeItem('sika-program');
    
    // Confirm and reload
    console.log('✓ All test data cleared successfully');
    console.log('Reloading page...');
    window.location.reload();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

export const viewStoredData = () => {
  try {
    const authData = localStorage.getItem('sika-auth');
    const programData = localStorage.getItem('sika-program');
    
    console.log('=== SIKA Auth Store ===');
    console.log(authData ? JSON.parse(authData) : 'Empty');
    
    console.log('\n=== SIKA Program Store ===');
    console.log(programData ? JSON.parse(programData) : 'Empty');
  } catch (error) {
    console.error('Error viewing data:', error);
  }
};

// Make functions globally accessible for console
if (typeof window !== 'undefined') {
  (window as any).clearAllData = clearAllData;
  (window as any).viewStoredData = viewStoredData;
}
