import { useRef, useState, useEffect, useCallback } from 'react';
import NetworkNode from './NetworkNode';
import type { PostNode, Edge } from '@/types';

interface NetworkCanvasProps {
  nodes: PostNode[];
  edges: Edge[];
  selectedNode: string | null;
  showNodeTypes: boolean;
  turningPointId?: string | null;
  onSelectNode: (nodeId: string) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onRemoveEdge: (edgeId: string) => void;
  onNodePositionChange: (nodeId: string, position: { x: number; y: number }) => void;
}

const NODE_WIDTH = 192;
const NODE_HEIGHT = 140;

export default function NetworkCanvas({
  nodes,
  edges,
  selectedNode,
  showNodeTypes,
  turningPointId,
  onSelectNode,
  onConnect,
  onRemoveEdge,
  onNodePositionChange,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node) => {
      positions[node.id] = node.position;
    });
    setNodePositions(positions);
  }, [nodes]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      if (draggingNode) {
        const newX = dragStart.x + (e.clientX - dragStart.x);
        const newY = dragStart.y + (e.clientY - dragStart.y);
        setNodePositions((prev) => ({
          ...prev,
          [draggingNode]: { x: newX, y: newY },
        }));
        onNodePositionChange(draggingNode, { x: newX, y: newY });
      }
    },
    [draggingNode, dragStart, onNodePositionChange]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = nodePositions[nodeId];
    if (pos) {
      setDraggingNode(nodeId);
      setDragStart({
        x: pos.x,
        y: pos.y,
      });
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (draggingNode) return;

    if (selectedNode === null) {
      onSelectNode(nodeId);
    } else if (selectedNode === nodeId) {
      onSelectNode('');
    } else {
      onConnect(selectedNode, nodeId);
      onSelectNode('');
    }
  };

  const handleCanvasClick = () => {
    onSelectNode('');
  };

  const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这条连线吗？')) {
      onRemoveEdge(edgeId);
    }
  };

  const getNodeCenter = (nodeId: string) => {
    const pos = nodePositions[nodeId];
    if (!pos) return { x: 0, y: 0 };
    return {
      x: pos.x + NODE_WIDTH / 2,
      y: pos.y + NODE_HEIGHT / 2,
    };
  };

  const renderEdge = (edge: Edge, index: number) => {
    const sourcePos = getNodeCenter(edge.source);
    const targetPos = getNodeCenter(edge.target);

    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const cx1 = sourcePos.x + dx * 0.3;
    const cy1 = sourcePos.y;
    const cx2 = targetPos.x - dx * 0.3;
    const cy2 = targetPos.y;

    const path = `M ${sourcePos.x} ${sourcePos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetPos.x} ${targetPos.y}`;

    const strokeColor =
      edge.isCorrect === true ? '#22c55e' : edge.isCorrect === false ? '#ef4444' : '#9ca3af';
    const strokeWidth = edge.isCorrect ? 3 : 2;

    return (
      <g key={edge.id} style={{ animationDelay: `${index * 100}ms` }}>
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 6}
          strokeOpacity="0"
          className="cursor-pointer"
          onClick={(e) => handleEdgeClick(e, edge.id)}
        />
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="connection-line"
          style={{ animationDelay: `${index * 100}ms` }}
        />
        <defs>
          <marker
            id={`arrow-${edge.id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          markerEnd={`url(#arrow-${edge.id})`}
          className="connection-line"
          style={{ animationDelay: `${index * 100}ms` }}
        />
      </g>
    );
  };

  const renderGuideLine = () => {
    if (!selectedNode) return null;

    const sourcePos = getNodeCenter(selectedNode);
    const dx = mousePos.x - sourcePos.x;
    const dy = mousePos.y - sourcePos.y;
    const cx1 = sourcePos.x + dx * 0.3;
    const cy1 = sourcePos.y;
    const cx2 = mousePos.x - dx * 0.3;
    const cy2 = mousePos.y;

    const path = `M ${sourcePos.x} ${sourcePos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${mousePos.x} ${mousePos.y}`;

    return (
      <path
        d={path}
        fill="none"
        stroke="#d4a574"
        strokeWidth="2"
        strokeDasharray="8 4"
        strokeLinecap="round"
        pointerEvents="none"
      />
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden"
      onClick={handleCanvasClick}
      style={{ minHeight: '600px' }}
    >
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <g style={{ pointerEvents: 'auto' }}>
          {edges.map((edge, index) => renderEdge(edge, index))}
        </g>
        {renderGuideLine()}
      </svg>

      <div className="relative" style={{ zIndex: 10 }}>
        {nodes.map((node) => (
          <NetworkNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            isSource={selectedNode !== null && selectedNode === node.id}
            isTarget={false}
            isCorrect={showNodeTypes ? undefined : undefined}
            isWrong={false}
            showType={showNodeTypes}
            isTurningPoint={turningPointId === node.id}
            onMouseDown={handleNodeMouseDown}
            onClick={handleNodeClick}
            position={nodePositions[node.id] || node.position}
          />
        ))}
      </div>

      {selectedNode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gold-50 border border-gold-300 text-gold-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
          已选择起点，点击另一个节点建立传播关系，或点击空白处取消
        </div>
      )}
    </div>
  );
}
