/**
 * GemWallet Debug Utilities
 *
 * Helper functions to debug GemWallet connection issues
 */

export const debugGemWallet = () => {
  console.group('🔍 GemWallet Debug Info');

  console.log('Window object has gemWallet:', 'gemWallet' in window);
  console.log('Window object has GemWallet:', 'GemWallet' in window);
  console.log('Window object has xrpToolkit:', 'xrpToolkit' in window);

  if ((window as any).gemWallet) {
    console.log('window.gemWallet:', (window as any).gemWallet);
    console.log('Available methods:', Object.keys((window as any).gemWallet));
  }

  if ((window as any).GemWallet) {
    console.log('window.GemWallet:', (window as any).GemWallet);
  }

  if ((window as any).xrpToolkit) {
    console.log('window.xrpToolkit:', (window as any).xrpToolkit);
    if ((window as any).xrpToolkit.gemWallet) {
      console.log('xrpToolkit.gemWallet:', (window as any).xrpToolkit.gemWallet);
    }
  }

  // Check for other wallet extensions
  console.log('window.ethereum:', !!(window as any).ethereum);
  console.log('window.xrpl:', !!(window as any).xrpl);

  console.groupEnd();
};

// Auto-run debug on load (can be disabled in production)
if (typeof window !== 'undefined') {
  // Wait for extension to load
  setTimeout(() => {
    debugGemWallet();
  }, 1000);
}
