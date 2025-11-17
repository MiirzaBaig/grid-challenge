# Interactive Grid System

A Next.js 14+ interactive grid system with drag, resize, and selection capabilities. Built with TypeScript, Tailwind CSS, and React.

## Features

### Core Features
- ✅ **10-column CSS Grid layout** with dynamic rows
- ✅ **Resizable boxes** (1x1 to 5x5 grid cells) with visual resize handles
- ✅ **Selection system** with smooth transitions between grid and absolute positioning
- ✅ **Drag and drop** functionality for selected boxes
- ✅ **Grid snapping** when deselecting boxes
- ✅ **Collision detection** to prevent overlapping boxes

### Bonus Features
- ✅ **Multi-select** support (Shift + Click)
- ✅ **Keyboard shortcuts**:
  - `A` - Add new box
  - `Delete` / `Backspace` - Remove selected boxes
  - `Arrow Keys` - Move selected boxes (Shift for full cell movement)
  - `Ctrl+Z` / `Cmd+Z` - Undo
  - `Ctrl+Y` / `Cmd+Y` - Redo
- ✅ **Undo/Redo** functionality with history management
- ✅ **Export/Import** grid layout as JSON
- ✅ **Dark mode** support with system preference detection
- ✅ **Visual feedback** with hover states and smooth animations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Boxes
- Click the "Add Box" button or press `A` to create a new box
- New boxes are placed at the next available row

### Selecting Boxes
- Click a box to select it
- Shift + Click to multi-select boxes
- Click outside boxes to deselect all

### Moving Boxes
- Select a box to enable dragging
- Drag selected boxes freely (no snapping while dragging)
- Release to snap to the nearest grid position

### Resizing Boxes
- Select a box to show resize handles
- Drag any corner or edge handle to resize
- Boxes snap to grid cell boundaries when resizing ends
- Minimum size: 1x1 cell, Maximum size: 5x5 cells

### Keyboard Shortcuts
- `A` - Add box
- `Delete` / `Backspace` - Remove selected
- `Arrow Keys` - Move selected (Shift for full cell steps)
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo

### Export/Import
- Click "Export" to download the current layout as JSON
- Click "Import" to load a previously exported layout

## Project Structure

```
/app
  /page.tsx              # Main page with controls and state management
  /components
    /GridSystem.tsx      # Grid container and layout logic
    /GridBox.tsx         # Individual box component with drag/resize
    /ResizeHandle.tsx    # Resize handle component
  /lib
    /gridUtils.ts        # Grid calculation utilities
  /globals.css           # Global styles with Tailwind
  /layout.tsx            # Root layout
```

## Technical Details

### Grid System
- 10 columns with 80px cell size
- Dynamic rows that expand based on content
- Grid lines overlay for visual reference

### Box Positioning
- **Unselected**: Uses CSS Grid (`grid-column` and `grid-row`)
- **Selected**: Switches to absolute positioning for free dragging
- **Transition**: Smooth 200ms animation when selecting/deselecting

### Grid Calculations
When deselecting a box:
1. Calculate grid column start: `Math.round(x / cellSize) + 1`
2. Calculate grid column end: `colStart + Math.round(width / cellSize)`
3. Calculate grid row start: `Math.round(y / cellSize) + 1`
4. Calculate grid row end: `rowStart + Math.round(height / cellSize)`

### Performance
- Optimized rendering with React hooks
- Efficient collision detection
- History management with configurable limits

## Technologies Used

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **react-draggable** - Drag functionality
- **react-resizable** - Resize functionality (custom implementation)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

