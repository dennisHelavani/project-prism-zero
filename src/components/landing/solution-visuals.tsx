'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Zap, Share2, FileCheck2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const Document = ({ label, position, rotation, zIndex }: { label: string; position: { x: number; y: number }; rotation: number; zIndex: number }) => (
  <motion.div
    className="absolute flex flex-col items-center justify-center bg-secondary p-2 rounded-md border border-border"
    initial={{ scale: 0, opacity: 0, ...position, rotate: 0 }}
    animate={{ scale: 1, opacity: 1, x: 0, y: 0, rotate: rotation, transition: { duration: 0.5, delay: 0.2 } }}
    exit={{ scale: 0, opacity: 0, x: position.x, y: position.y, rotate: 0, transition: { duration: 0.5 } }}
    style={{ zIndex }}
  >
    <FileText className="w-6 h-6 text-primary" />
    <span className="text-xs mt-1">{label}</span>
  </motion.div>
);

export function CompliantDocumentsVisual() {
  const [isCombined, setIsCombined] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCombined(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {!isCombined ? (
          <>
            <Document label="RAMS" position={{ x: -80, y: 0 }} rotation={-15} zIndex={1} />
            <Document label="Method" position={{ x: 0, y: -60 }} rotation={0} zIndex={2} />
            <Document label="CDM" position={{ x: 80, y: 0 }} rotation={15} zIndex={1} />
          </>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.5 } }}
          >
            <FileCheck2 className="w-16 h-16 text-primary" />
            <p className="mt-2 text-sm font-bold">Tailored Documents</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InstantGenerationVisual() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { delay: 0.2, type: 'spring', stiffness: 150 } }}
                className="relative"
            >
                <FileText className="w-20 h-20 text-primary" />
                <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                >
                    <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </motion.div>
            </motion.div>
        </div>
    );
}

export function EditableShareableVisual() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
            >
                <FileText className="w-20 h-20 text-primary" />
                <motion.div
                    className="absolute -top-4 -right-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, transition: { delay: 0.5 } }}
                >
                    <Share2 className="w-8 h-8 text-accent-foreground" />
                </motion.div>
                <motion.div
                    className="absolute -bottom-2 -left-2 bg-secondary p-1 rounded-full"
                     initial={{ scale: 0 }}
                    animate={{ scale: 1, transition: { delay: 0.7 } }}
                >
                    <span className="text-xs font-bold text-primary">.doc</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
