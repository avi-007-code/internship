import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, ContactShadows, Text, Billboard } from "@react-three/drei";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Node3D, Edge3D } from "../types";
import * as THREE from "three";

// Custom cleanup component for node highlight rings
function HighlightRing({ position }: { position: [number, number, number] }) {
  const geoRef = useRef<THREE.RingGeometry>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const structureType = useAlgorithmStore((state) => state.structureType);
  const isStack = structureType === "STACK";

  useEffect(() => {
    return () => {
      if (geoRef.current) geoRef.current.dispose();
      if (matRef.current) matRef.current.dispose();
    };
  }, []);

  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry ref={geoRef} args={isStack ? [0.65, 0.72, 16] : [0.48, 0.54, 16]} />
      <meshBasicMaterial ref={matRef} color="#FF1744" side={THREE.DoubleSide} />
    </mesh>
  );
}

// Custom clean label component
function NodeLabel({ label, position }: { label: string; position: [number, number, number] }) {
  const structureType = useAlgorithmStore((state) => state.structureType);
  const isStack = structureType === "STACK";
  const labelPos: [number, number, number] = isStack
    ? [position[0] + 1.1, position[1], position[2]]
    : [position[0], position[1] + 0.75, position[2]];

  return (
    <Billboard position={labelPos}>
      <Text
        fontSize={0.32}
        color="#FFFFFF"
        anchorX={isStack ? "left" : "center"}
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#0f172a"
      >
        {label}
      </Text>
    </Billboard>
  );
}

// InstancedMesh container that merges all spheres/blocks into 1 draw call
function InstancedNodes({ nodes }: { nodes: Node3D[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const structureType = useAlgorithmStore((state) => state.structureType);

  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // WebGL GPU memory cleanup on unmount for 150MB target thresholds
  useEffect(() => {
    return () => {
      if (geoRef.current) geoRef.current.dispose();
      if (matRef.current) matRef.current.dispose();
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    let needsRefreshedFrame = false;

    nodes.forEach((node, idx) => {
      const pos = node.position;
      tempObject.position.set(pos[0], pos[1], pos[2]);

      const isHovered = hoveredIdx === idx;
      let scale = (node.scale || 1.0) * (isHovered ? 1.2 : 1.0);

      // Pulse highlighted nodes dynamically
      if (node.isHighlighted) {
        const pulse = 1.0 + Math.sin(time * 5) * 0.15;
        scale *= pulse;
        needsRefreshedFrame = true; // request next frame for highlights
      }

      tempObject.scale.set(scale, scale, scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(idx, tempObject.matrix);

      // Instance node color (turns white under selective hovered index)
      tempColor.set(isHovered ? "#FFFFFF" : node.color);
      meshRef.current!.setColorAt(idx, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    if (needsRefreshedFrame) {
      invalidate();
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, nodes.length]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined) {
          setHoveredIdx(e.instanceId);
          invalidate();
        }
      }}
      onPointerOut={() => {
        setHoveredIdx(null);
        invalidate();
      }}
      dispose={null}
    >
      {structureType === "STACK" ? (
        <boxGeometry ref={geoRef as any} args={[0.8, 0.45, 0.8]} />
      ) : (
        <sphereGeometry ref={geoRef as any} args={[0.35, 16, 12]} />
      )}
      <meshStandardMaterial
        ref={matRef}
        roughness={structureType === "STACK" ? 0.25 : 0.15}
        metalness={structureType === "STACK" ? 0.05 : 0.8}
      />
    </instancedMesh>
  );
}

// Custom 3DEdge component with automatic unmount resource disposal
function ThreeEdge({ edge, fromNode, toNode }: { edge: Edge3D; fromNode: Node3D; toNode: Node3D }) {
  const arrowRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const cylinderGeoRef = useRef<THREE.CylinderGeometry>(null);
  const cylinderMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const coneGeoRef = useRef<THREE.ConeGeometry>(null);
  const coneMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    return () => {
      if (cylinderGeoRef.current) cylinderGeoRef.current.dispose();
      if (cylinderMatRef.current) cylinderMatRef.current.dispose();
      if (coneGeoRef.current) coneGeoRef.current.dispose();
      if (coneMatRef.current) coneMatRef.current.dispose();
    };
  }, []);

  const p1 = useMemo(() => new THREE.Vector3(...fromNode.position), [fromNode.position]);
  const p2 = useMemo(() => new THREE.Vector3(...toNode.position), [toNode.position]);

  const distance = useMemo(() => p1.distanceTo(p2), [p1, p2]);
  const midpoint = useMemo(() => new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5), [p1, p2]);
  const direction = useMemo(() => new THREE.Vector3().subVectors(p2, p1).normalize(), [p1, p2]);
  
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    q.setFromUnitVectors(up, direction);
    return q;
  }, [direction]);

  useFrame((state) => {
    let needsRefreshedFrame = false;

    // Fluid kinetic flow animations active only on highlighted nodes
    if (edge.isHighlighted) {
      needsRefreshedFrame = true;
      const time = state.clock.getElapsedTime();

      if (cylinderMatRef.current) {
        const intensity = 0.5 + Math.sin(time * 8) * 0.5;
        cylinderMatRef.current.color.setHSL(0.9, 1.0, 0.5 + intensity * 0.1);
      }

      if (arrowRef.current) {
        const slide = (time % 1) * distance;
        const animPos = new THREE.Vector3().copy(p1).addScaledVector(direction, slide);
        arrowRef.current.position.copy(animPos);
      }
    }

    if (needsRefreshedFrame) {
      invalidate();
    }
  });

  const activeColor = edge.isHighlighted ? "#FF1744" : edge.color || "#475569";

  return (
    <group>
      {/* 3D cylinder connection with only 8 radial segments for lightweight parsing */}
      <mesh position={midpoint} quaternion={quaternion}>
        <cylinderGeometry ref={cylinderGeoRef} args={[0.04, 0.04, distance - 0.7, 8]} />
        <meshStandardMaterial
          ref={cylinderMatRef}
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={edge.isHighlighted ? 2.0 : 0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Slide indicator cone with only 8 segments */}
      <group
        ref={arrowRef}
        position={new THREE.Vector3().copy(p2).addScaledVector(direction, -0.45)}
        quaternion={quaternion}
      >
        <mesh>
          <coneGeometry ref={coneGeoRef} args={[0.12, 0.25, 8]} />
          <meshStandardMaterial
            ref={coneMatRef}
            color={activeColor}
            emissive={activeColor}
            emissiveIntensity={edge.isHighlighted ? 3.0 : 0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

// Inner canvas subscriber helper to invalidate and draw single frames on state updates
function CanvasInvalidator({
  nodes,
  edges,
  isPlaying,
}: {
  nodes: Node3D[];
  edges: Edge3D[];
  isPlaying: boolean;
}) {
  const { invalidate } = useThree();

  useEffect(() => {
    invalidate();
  }, [nodes, edges, isPlaying, invalidate]);

  return null;
}

export default function ThreeVisualizer() {
  // Leverage selective Zustand subscriptions to completely isolate Three canvas updates
  const nodes = useAlgorithmStore((state) => state.nodes);
  const edges = useAlgorithmStore((state) => state.edges);
  const isLoading = useAlgorithmStore((state) => state.isLoading);
  const isPlaying = useAlgorithmStore((state) => state.isPlaying);

  const nodeMap = useMemo(() => {
    const map: Record<string | number, Node3D> = {};
    nodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [nodes]);

  const floorY = useMemo(() => {
    if (nodes.length === 0) return -2;
    let minNodeY = 2;
    nodes.forEach((n) => {
      if (n.position[1] < minNodeY) {
        minNodeY = n.position[1];
      }
    });
    // Dynamically adjust floorY to be at least 1.5 units below lowest node, maxed at -2
    return Math.min(-2, minNodeY - 1.5);
  }, [nodes]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 animate-ping opacity-30" />
            <div className="w-8 h-8 rounded-full border-t border-r border-white animate-spin" />
          </div>
          <span className="mt-4 font-mono text-[11px] text-white/60 tracking-widest animate-pulse uppercase">
            Recalculating 3D Coordinates...
          </span>
        </div>
      )}

      {/* React Three Fiber Canvas with full on-demand performance engineering */}
      <Canvas
        camera={{ position: [0, 0.5, 6.5], fov: 50 }}
        shadows
        gl={{ antialias: true }}
        frameloop="demand" // Scene uses ZERO GPU power when static
      >
        {/* On-Demand Invalidation Dispatcher */}
        <CanvasInvalidator nodes={nodes} edges={edges} isPlaying={isPlaying} />

        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.5} />
        <directionalLight position={[0, 8, 4]} intensity={1.2} />

        {/* Space background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1.5} />

        <group>
          {/* Dynamic Edge cylinder links */}
          {edges.map((edge) => {
            const fNode = nodeMap[edge.from];
            const tNode = nodeMap[edge.to];
            if (!fNode || !tNode) return null;
            return (
              <ThreeEdge
                key={edge.id}
                edge={edge}
                fromNode={fNode}
                toNode={tNode}
              />
            );
          })}

          {/* Combined InstancedMesh for ALL nodes to minimize draw calls to 1 */}
          {nodes.length > 0 && <InstancedNodes nodes={nodes} />}

          {/* Highlight halos on active items */}
          {nodes.map((node) => {
            if (!node.isHighlighted) return null;
            return <HighlightRing key={`ring-${node.id}`} position={node.position} />;
          })}

          {/* Labels positioned cleanly above */}
          {nodes.map((node) => (
            <NodeLabel key={`label-${node.id}`} label={node.label} position={node.position} />
          ))}
        </group>

        {/* Bottom grid helper */}
        <gridHelper args={[40, 40, "#1e293b", "#0f172a"]} position={[0, floorY, 0]} />

        {/* Contact shadow helper */}
        <ContactShadows
          position={[0, floorY, 0]}
          opacity={0.7}
          scale={15}
          blur={2.5}
          far={4}
        />

        {/* User controls trigger on-demand frames automatically during cursor drags */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />
      </Canvas>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none px-2.5 py-1 bg-slate-900/45 rounded-lg border border-white/5 backdrop-blur-md shadow-lg">
        <span className="text-[10px] font-sans text-white/40 tracking-wide font-medium">
          Drag to Rotate • Scroll to Zoom
        </span>
      </div>
    </div>
  );
}
