// Import required Node packages
import { fileURLToPath } from 'url';
import path from 'path';

// NOTE - There is no access to the default "__dirname" in ES6 modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).replace('\\utils', '');

export default __dirname;
