// Default API exporter. Currently uses the local `mockApi` implementation.
// To use Firestore instead, replace the default export with `firebaseApi`.

import mockApi from './mockApi';
import firebaseApi from './firebaseApi';

// change this to `firebaseApi` to enable Firebase-backed data
const api = mockApi;

export { firebaseApi };
export default api;
