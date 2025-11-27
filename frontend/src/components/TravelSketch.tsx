import { useRef, useState, useEffect } from 'react';
import { X, Download, Trash2, Palette, Eraser } from 'lucide-react';

interface TravelSketchProps {
    onClose: () => void;
}

const TravelSketch: React.FC<TravelSketchProps> = ({ onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to parent container
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                // Restore context settings after resize
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = color;
                ctx.lineWidth = brushSize;
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = brushSize;
    }, [color, brushSize, tool]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { offsetX, offsetY } = getCoordinates(e);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { offsetX: 0, offsetY: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `travel-sketch-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Toolbar */}
                <div className="bg-gray-100 p-4 flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                            <button
                                onClick={() => setTool('pen')}
                                className={`p-2 rounded-md transition-colors ${tool === 'pen' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Pen"
                            >
                                <Palette className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`p-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Eraser"
                            >
                                <Eraser className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-none"
                                title="Color Picker"
                            />
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-24 cursor-pointer"
                                title="Brush Size"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearCanvas}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Clear Canvas"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={saveDrawing}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Save Drawing"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-white relative cursor-crosshair touch-none">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default TravelSketch;
