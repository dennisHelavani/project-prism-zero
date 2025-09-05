'use client';

import { motion } from 'framer-motion';
import { Zap, Share2 } from 'lucide-react';
import { DataFlowVisual } from './data-flow-visual';

export function InstantGenerationVisual() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { delay: 0.2, type: 'spring', stiffness: 150 } }}
                className="relative"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
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
