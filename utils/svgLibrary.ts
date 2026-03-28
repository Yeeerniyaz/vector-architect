// =============================================================================
// Vector Architect — SVG Path Library (CAD Blocks)
// All shapes are drawn in a 100x100 grid (from X:-50 to X:50, Y:-50 to Y:50).
// Center is always (0,0) for perfect rotation and scaling.
// =============================================================================

export const SVG_LIBRARY: Record<string, string> = {
  // --- ЭЛЕКТРИКА И СЕТЬ (Обычно мелкие, 1:1) ---
  socket_220v: 'M -20 0 A 20 20 0 1 1 20 0 Z M -8 0 V -25 M 8 0 V -25',
  socket_internet: 'M -25 -25 h 50 v 50 h -50 Z M -10 -10 h 20 v 20 h -20 Z M 0 10 V 25',
  light_switch: 'M -20 0 A 20 20 0 1 1 20 0 A 20 20 0 1 1 -20 0 M -14 -14 L 20 -48 M 15 -48 L 25 -48',
  router_wifi: 'M -40 -10 h 80 v 30 h -80 Z M -30 -10 v -25 M 0 -10 v -25 M 30 -10 v -25 M -15 10 A 3 3 0 1 1 -14.9 10 M 0 10 A 3 3 0 1 1 0.1 10 M 15 10 A 3 3 0 1 1 15.1 10',
  camera: 'M 0 20 L -40 -40 L 40 -40 Z M -15 20 A 15 15 0 1 0 15 20 A 15 15 0 1 0 -15 20',
  electric_panel: 'M -40 -20 h 80 v 40 h -80 Z M -10 -10 L 5 5 H -5 L 10 20 M -40 -20 L 40 20 M -40 20 L 40 -20',

  // --- МЕБЕЛЬ ---
  bed_queen: 'M -50 -50 h 100 v 100 h -100 Z M -45 -45 h 40 v 25 h -40 Z M 5 -45 h 40 v 25 h -40 Z M -50 -5 h 100 M -50 0 h 100',
  sofa_standard: 'M -50 -50 h 100 v 100 h -100 Z M -50 -50 h 100 v 20 h -100 Z M -50 -30 h 15 v 80 h -15 Z M 35 -30 h 15 v 80 h -15 Z M -11.6 -30 v 80 M 11.6 -30 v 80',
  table_dining: 'M -35 -25 h 70 v 50 h -70 Z M -20 -40 h 10 v 15 h -10 Z M 10 -40 h 10 v 15 h -10 Z M -20 25 h 10 v 15 h -10 Z M 10 25 h 10 v 15 h -10 Z M -50 -10 h 15 v 20 h -15 Z M 35 -10 h 15 v 20 h -15 Z',

  // --- ТЕХНИКА И КУХНЯ ---
  dishwasher_builtin: 'M -50 -50 h 100 v 100 h -100 Z M -40 -40 h 80 v 15 h -80 Z M -30 -32.5 h 10 v 5 h -10 Z M 20 -32.5 A 2.5 2.5 0 1 1 20.1 -32.5 M 30 -32.5 A 2.5 2.5 0 1 1 30.1 -32.5',
  oven_builtin: 'M -50 -50 h 100 v 100 h -100 Z M -40 -20 h 80 v 60 h -80 Z M -30 -10 h 60 v 40 h -60 Z M -30 -35 h 60 v 5 h -60 Z',
  kitchen_counter: 'M -50 -50 h 100 v 100 h -100 Z M -40 -30 h 30 v 60 h -30 Z M -28 -5 L -22 -5 L -22 5 L -28 5 Z M 15 -25 h 10 v 20 h -10 Z M 30 -25 h 10 v 20 h -10 Z M 15 5 h 10 v 20 h -10 Z M 30 5 h 10 v 20 h -10 Z',

  // --- САНТЕХНИКА ---
  toilet: 'M -25 -50 h 50 v 25 h -50 Z M -15 -25 C -15 35, 15 35, 15 -25 Z M -5 -40 h 10 v 5 h -10 Z',
  sink: 'M -50 -50 h 100 v 100 h -100 Z M -40 -20 C -40 40, 40 40, 40 -20 Z M -5 -40 h 10 v 15 h -10 Z M 0 10 A 5 5 0 1 1 0.1 10',
  shower_cabin: 'M -50 -50 h 100 v 100 h -100 Z M -40 -40 h 80 v 80 h -80 Z M -40 -40 L 40 40 M -40 40 L 40 -40 M -5 -5 A 5 5 0 1 1 -4.9 -5',
  
  // Фолбэк
  fallback: 'M -50 -50 h 100 v 100 h -100 Z M -50 -50 L 50 50 M -50 50 L 50 -50',
};