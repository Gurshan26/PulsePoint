import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.stubGlobal('requestAnimationFrame', (cb) => {
  cb(0);
  return 0;
});
vi.stubGlobal('cancelAnimationFrame', vi.fn());
