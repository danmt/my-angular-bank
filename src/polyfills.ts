import { Buffer } from 'buffer';
import * as process from 'process';
// import 'zone.js'; // Included with Angular CLI.

(window as any).global = window;
(window as any).global.Buffer = Buffer;
(window as any).process = process;
