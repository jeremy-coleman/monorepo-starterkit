export function register() {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(() => console.log('Service Worker Registered')); // tslint:disable-line:no-console
}

export function unregister() {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('Service Worker Unregistered'); // tslint:disable-line:no-console
      }
    });
}

export function bootstrapServiceWorker(enable = true) {
  if ('serviceWorker' in navigator) {
    enable ? register() : unregister();
  }
}
