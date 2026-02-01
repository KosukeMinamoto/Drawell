// Parts data: only entries with existing SVGs
export const partsCategories = [
  {
    id: 'basic',
    label: 'Basic Shapes',
    parts: [
      { type: 'rect', label: 'Rectangle' },
      { type: 'circle', label: 'Circle' },
      { type: 'line', label: 'Line' },
      { type: 'triangle', label: 'Triangle' },
      { type: 'trapezoid', label: 'Trapezoid' },
      { type: 'ellipse', label: 'Ellipse' },
      { type: 'polygon', label: 'Polygon' },
      { type: 'text', label: 'Text' },
    ]
  },
  {
    id: 'omission',
    label: 'Omission Symbols',
    parts: [
      { type: 'omission-wave', label: 'Wave (2 lines)' },
      { type: 'omission-slash', label: 'Slash (2 lines)' },
      { type: 'omission-dot', label: 'Dotted (2 lines)' },
    ]
  },
  {
    id: 'drilling-rig',
    label: 'Drilling Rig',
    parts: [
      { type: 'draw-works', label: 'Draw-works (winch)' },
      { type: 'standpipe', label: 'Standpipe' },
      { type: 'goose-neck', label: 'Goose-neck' },
      { type: 'traveling-block', label: 'Traveling block' },
      { type: 'drill-line', label: 'Drill line' },
      { type: 'monkey-board', label: 'Monkey board' },
      { type: 'stand-drill-pipe', label: 'Stand (of drill pipe)' },
      { type: 'drill-floor', label: 'Drill floor' },
      { type: 'bell-nipple', label: 'Bell nipple' },
      { type: 'bop-annular', label: 'BOP Annular' },
      { type: 'bop-ram', label: 'BOPs pipe ram & shear ram' },
      { type: 'drill-string', label: 'Drill string' },
      { type: 'bit', label: 'Drill bit' },
      { type: 'casing-head', label: 'Casing head' },
      { type: 'flow-line', label: 'Flow line' },
    ]
  },
  {
    id: 'drilling',
    label: 'Drilling String / Bit',
    parts: [
      { type: 'bit', label: 'Tri-Cone Bit' },
      { type: 'bit-tri-cone', label: 'Tri-Cone Bit (Icon)' },
      { type: 'bit-fishtail', label: 'Fishtail Bit (1800s)' },
      { type: 'bit-two-cone', label: 'Two-Cone Bit (1909)' },
      { type: 'bit-pdc', label: 'PDC Bit (1980s-2000s)' },
      { type: 'bit-smart', label: 'Smart Bit (Modern)' },
    ]
  },
  {
    id: 'surface',
    label: 'Surface / Wellhead',
    parts: [
      { type: 'wellhead', label: 'Wellhead' },
      { type: 'christmas-tree', label: 'Christmas Tree' },
      { type: 'casing-head', label: 'Casing Head' },
      { type: 'choke-kill-spool', label: 'Choke/Kill Spool' },
      { type: 'flow-line', label: 'Flow Line' },
      { type: 'drilling-spool', label: 'Drilling Spool' },
    ]
  },
  {
    id: 'safety',
    label: 'Safety Equipment (BOP)',
    parts: [
      { type: 'bop-annular', label: 'Annular BOP' },
      { type: 'bop-ram', label: 'Ram BOP' },
      { type: 'bop-ram-single', label: 'Ram BOP (Single)' },
      { type: 'bop-connector', label: 'BOP Connector' },
      { type: 'blind-ram', label: 'Blind Ram' },
      { type: 'pipe-ram', label: 'Pipe Ram' },
      { type: 'variable-bore-ram', label: 'Variable Bore Ram' },
    ]
  },
  {
    id: 'casing-tubing',
    label: 'Casing / Tubing / Cementing',
    parts: [
      { type: 'casing', label: 'Casing' },
      { type: 'tubing', label: 'Tubing' },
      { type: 'cement', label: 'Cement (annulus)' },
      { type: 'cement-plug', label: 'Cement plug' },
    ]
  },
  {
    id: 'completion',
    label: 'Completion – Tubing & Valves',
    parts: [
      { type: 'packer', label: 'Packer' },
      { type: 'valve', label: 'Valve' },
      { type: 'gate-valve', label: 'Gate Valve' },
      { type: 'globe-valve', label: 'Globe Valve' },
      { type: 'ball-valve', label: 'Ball Valve' },
      { type: 'check-valve', label: 'Check Valve' },
      { type: 'butterfly-valve', label: 'Butterfly Valve' },
      { type: 'pressure-relief-valve', label: 'Pressure Relief Valve' },
      { type: 'plug-valve', label: 'Plug Valve' },
      { type: 'control-valve', label: 'Control Valve' },
    ]
  },
  {
    id: 'completion-methods',
    label: 'Completion Methods',
    parts: [
      { type: 'completion-barefoot', label: 'Barefoot' },
      { type: 'completion-open-hole', label: 'Open Hole' },
      { type: 'completion-slotted-liner', label: 'Slotted Liner / Pre-drilled' },
      { type: 'completion-perforated-lined', label: 'Cemented & Perforated Liner' },
      { type: 'completion-cased-perforated', label: 'Cased and Perforated' },
      { type: 'completion-open-hole-gravel-pack', label: 'Open Hole Gravel Pack' },
      { type: 'completion-cased-fracture-pack', label: 'Cased Hole Gravel Pack / Frac-pack' },
    ]
  },
]
