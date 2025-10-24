import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('glslPlayLabDesktop', {
  isDesktop: true,
});
